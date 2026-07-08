import { Principal } from "@icp-sdk/core/principal";
import {
  createLendingActor,
  type WalletRecord,
} from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { normalizeEvmAddress } from "../../core/evm";
import type { CanisterContext } from "../../core/transports/canister-context";
import { Chain, type Wallet } from "../../core/types";
import { computeExpiryTimestampFromNow } from "../../core/utils/time";
import { getVariantKey } from "../../core/utils/variant";
import {
  WalletActionKind,
  WalletExecutionKind,
} from "../../core/wallet-actions";
import { executeWith } from "../../execute";
import { mapCreateAccountRequestToRegisterProfileRequest } from "./mappers";
import type {
  CreateAccountAction,
  CreateAccountRequest,
  CreateProfileParams,
  PrepareCreateProfileOptions,
} from "./types";

/** Profile lifecycle and linked-wallet helpers. */
export class AccountsModule {
  constructor(private readonly canisterContext: CanisterContext) {}

  /**
   * Prepares a profile-creation action that can be signed and submitted later.
   *
   * Use this when you need direct control over the signing flow.
   *
   * @param options - `account` is the wallet address that will own the new profile.
   * @returns A signable {@link CreateAccountAction} with `submit` wired to the canister.
   */
  async prepareCreateProfile(
    options: PrepareCreateProfileOptions
  ): Promise<CreateAccountAction> {
    return await this.buildCreateProfileAction(options.account);
  }

  /**
   * Creates a Liquidium profile using the provided wallet adapter.
   *
   * This is the convenience form of `prepareCreateProfile(...)` plus execution.
   *
   * @param params - Wallet `account`, signing `chain`, and `walletAdapter` with `signMessage`.
   * @returns The new profile principal as text.
   */
  async createProfile(params: CreateProfileParams): Promise<string> {
    const account = normalizeProfileAccount(params.account);
    const action = await this.prepareCreateProfile({
      account,
    });

    return await executeWith({
      walletAdapter: params.walletAdapter,
      chain: params.chain,
      account,
    })(action);
  }

  /**
   * Resolves the Liquidium profile id linked to a wallet address.
   *
   * @param walletAddress - Wallet address string as registered with the protocol.
   * @returns Profile principal text, or `null` if none exists.
   */
  async getProfileId(walletAddress: string): Promise<string | null> {
    try {
      const account = normalizeProfileAccount(walletAddress);
      const profile = await createLendingActor(
        this.canisterContext
      ).get_wallet_profile(account);

      return profile[0]?.toText() ?? null;
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_wallet_profile", error);
    }
  }

  /**
   * Returns the current nonce for a wallet address.
   *
   * This is mainly useful for custom signing flows built on prepared actions.
   *
   * @param walletAddress - Wallet address used in `get_nonce` on the lending canister.
   * @returns The next signing nonce as a bigint.
   */
  async getWalletNonce(walletAddress: string): Promise<bigint> {
    try {
      const account = normalizeProfileAccount(walletAddress);
      return await createLendingActor(this.canisterContext).get_nonce(account);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_nonce", error);
    }
  }

  /**
   * Lists the wallets currently linked to a profile.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns The wallets currently linked to the requested profile.
   */
  async listLinkedWallets(profileId: string): Promise<Wallet[]> {
    try {
      const wallets = await createLendingActor(
        this.canisterContext
      ).get_profile_wallets(Principal.fromText(profileId));

      return wallets.map(mapCanisterWalletToWallet);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_profile_wallets", error);
    }
  }

  private async buildCreateProfileAction(
    account: string
  ): Promise<CreateAccountAction> {
    try {
      const normalizedAccount = normalizeProfileAccount(account);

      const nonce = await createLendingActor(this.canisterContext).get_nonce(
        normalizedAccount
      );
      const expiryTimestamp = computeExpiryTimestampFromNow();

      return {
        kind: WalletActionKind.createAccount,
        executionKind: WalletExecutionKind.signMessage,
        actionType: WalletActionKind.createAccount,
        account: normalizedAccount,
        message: createInitializeAccountMessage(expiryTimestamp, nonce),
        data: {
          expiryTimestamp,
        },
        submit: async (signatureInfo) => {
          return await this.submitCreateProfile({
            data: {
              expiryTimestamp,
            },
            signatureInfo: {
              ...signatureInfo,
              account: normalizeProfileAccount(
                signatureInfo.account ?? normalizedAccount
              ),
            },
          });
        },
      };
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_nonce", error);
    }
  }

  private async submitCreateProfile(
    request: CreateAccountRequest
  ): Promise<string> {
    try {
      const signingAccount = request.signatureInfo.account;
      if (!signingAccount) {
        throw new LiquidiumError(
          LiquidiumErrorCode.VALIDATION_ERROR,
          "Account creation requires the signing account"
        );
      }

      await assertWalletHasNoProfile(this.canisterContext, signingAccount);

      const result = await createLendingActor(
        this.canisterContext
      ).register_profile(
        mapCreateAccountRequestToRegisterProfileRequest(request)
      );

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return result.Ok.toText();
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("register_profile", error);
    }
  }
}

function normalizeProfileAccount(account: string): string {
  return normalizeEvmAddress(account);
}

function createInitializeAccountMessage(
  expiryTimestamp: bigint,
  nonce: bigint
): string {
  return `Liquidium: Initialize Account

Action: Create new account
Expires: ${expiryTimestamp}
Nonce: ${nonce}`;
}

async function assertWalletHasNoProfile(
  canisterContext: CanisterContext,
  walletAddress: string
): Promise<void> {
  const existingProfile =
    await createLendingActor(canisterContext).get_wallet_profile(walletAddress);
  const profileId = existingProfile[0]?.toText();

  if (!profileId) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
    `Wallet address is already linked to profile ${profileId}`
  );
}

function mapCanisterWalletToWallet(canisterWallet: WalletRecord): Wallet {
  const walletChain = getVariantKey(canisterWallet.chain.Wallet);

  switch (walletChain) {
    case Chain.BTC:
    case Chain.ETH:
    case Chain.ICP:
      return {
        address: canisterWallet.address,
        chain: walletChain,
      };
    default:
      throw new LiquidiumError(
        LiquidiumErrorCode.INTERNAL,
        `Unsupported wallet chain returned for profile wallet: ${walletChain}`
      );
  }
}
