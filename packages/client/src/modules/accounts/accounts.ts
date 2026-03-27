import { createLendingActor } from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { Wallet } from "../../core/types";
import { mapCreateAccountRequestToRegisterProfileRequest } from "./mappers";
import type { CreateAccountAction, CreateAccountRequest } from "./types";

const SIGNATURE_VALIDITY_5_MINUTES_IN_SECONDS = 5n * 60n;

export class AccountsModule {
  constructor(readonly canisterContext: CanisterContext) {}

  async create(options: { account: string }): Promise<CreateAccountAction> {
    return await this.createAccountAction(options.account);
  }

  async getProfile(profileId: string): Promise<Wallet[]> {
    void profileId;
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

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

  async unlinkWallet(profileId: string, walletAddress: string): Promise<void> {
    void profileId;
    void walletAddress;
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

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

  private async createAccountAction(
    account: string
  ): Promise<CreateAccountAction> {
    try {
      await assertWalletHasNoProfile(this.canisterContext, account);

      const nonce = await createLendingActor(this.canisterContext).get_nonce(
        account
      );
      const expiryTimestamp = computeExpiryTimestamp();

      return {
        kind: "create-account",
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
            signatureInfo,
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
      await assertWalletHasNoProfile(
        this.canisterContext,
        request.signatureInfo.account
      );

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

function computeExpiryTimestamp(): bigint {
  return (
    BigInt(Math.floor(Date.now() / 1000)) +
    SIGNATURE_VALIDITY_5_MINUTES_IN_SECONDS
  );
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
