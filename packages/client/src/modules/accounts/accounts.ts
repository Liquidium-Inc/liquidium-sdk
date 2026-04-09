import { Principal } from "@dfinity/principal";
import {
  createLendingActor,
  type WalletRecord,
} from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { Wallet } from "../../core/types";
import { computeExpiryTimestampFromNow } from "../../core/utils/time";
import { getVariantKey } from "../../core/utils/variant";
import type { WalletAdapter } from "../../core/wallet-actions";
import { executeWith } from "../../execute";
import { mapCreateAccountRequestToRegisterProfileRequest } from "./mappers";
import type { CreateAccountAction, CreateAccountRequest } from "./types";

type PrepareCreateOptions = {
  account: string;
};

type ExecuteCreateParams = {
  account: string;
  chain: "BTC" | "ETH";
  walletAdapter: WalletAdapter;
};

export class AccountsModule {
  constructor(readonly canisterContext: CanisterContext) {}

  /**
   * Prepares an account-creation action that can be signed and submitted later.
   *
   * Use this when you need direct control over the signing flow.
   */
  async prepareCreate(
    options: PrepareCreateOptions
  ): Promise<CreateAccountAction> {
    return await this.createAccountAction(options.account);
  }

  /**
   * Creates a Liquidium profile using the provided wallet adapter.
   *
   * This is the convenience form of `prepareCreate(...)` plus execution.
   */
  async create(params: ExecuteCreateParams): Promise<string> {
    const action = await this.prepareCreate({ account: params.account });

    return await executeWith({
      walletAdapter: params.walletAdapter,
      chain: params.chain,
      account: params.account,
    })(action);
  }

  /**
   * Resolves the Liquidium profile linked to a wallet address.
   */
  async resolveProfile(walletAddress: string): Promise<string | null> {
    try {
      const profile = await createLendingActor(
        this.canisterContext
      ).get_wallet_profile(walletAddress);

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
   */
  async getNonce(walletAddress: string): Promise<bigint> {
    try {
      return await createLendingActor(this.canisterContext).get_nonce(
        walletAddress
      );
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_nonce", error);
    }
  }

  /**
   * Returns the wallets currently linked to a profile.
   *
   * @param profileId - The Liquidium profile principal text.
   * @returns The wallets currently linked to the requested profile.
   */
  async getProfile(profileId: string): Promise<Wallet[]> {
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

  /**
   * Links an additional wallet to an existing profile.
   */
  async linkWallet(
    profileId: string,
    newWalletAddress: string,
    chain: "BTC" | "ETH"
  ): Promise<void> {
    void profileId;
    void newWalletAddress;
    void chain;
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Unlinks a wallet from an existing profile.
   */
  async unlinkWallet(profileId: string, walletAddress: string): Promise<void> {
    void profileId;
    void walletAddress;
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  private async createAccountAction(
    account: string
  ): Promise<CreateAccountAction> {
    try {
      await assertWalletHasNoProfile(this.canisterContext, account);

      const nonce = await createLendingActor(this.canisterContext).get_nonce(
        account
      );
      const expiryTimestamp = computeExpiryTimestampFromNow();

      return {
        kind: "create-account",
        executionKind: "sign-message",
        actionType: "create-account",
        transferMode: "native",
        account,
        message: createInitializeAccountMessage(expiryTimestamp, nonce),
        data: {
          expiryTimestamp,
        },
        submit: async (signatureInfo) => {
          return await this.submitCreate({
            data: {
              expiryTimestamp,
            },
            signatureInfo: {
              ...signatureInfo,
              account: signatureInfo.account ?? account,
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

  private async submitCreate(request: CreateAccountRequest): Promise<string> {
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
    case "BTC":
    case "ETH":
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
