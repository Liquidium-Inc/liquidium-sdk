import {
  type LiquidiumClient,
  LiquidiumError,
  LiquidiumErrorCode,
} from "@liquidium/client";

export type ProfileChain = "BTC" | "ETH";

type CreateOrResolveProfileParams = {
  client: LiquidiumClient;
  walletAddress: string;
  chain: ProfileChain;
  signMessage: (message: string) => Promise<string>;
};

type CreateOrResolveProfileResult = {
  profileId: string;
  wasCreated: boolean;
};

/**
 * Creates a Liquidium profile for the given wallet, or resolves the existing
 * one if the canister reports it already exists. This "create-or-resolve"
 * pattern is the recommended way to make profile setup idempotent from the UI.
 */
export async function createOrResolveProfile(
  params: CreateOrResolveProfileParams
): Promise<CreateOrResolveProfileResult> {
  try {
    const profileId = await params.client.accounts.createProfile({
      account: params.walletAddress,
      chain: params.chain,
      walletAdapter: {
        signMessage: async ({ message }) => await params.signMessage(message),
      },
    });

    return { profileId, wasCreated: true };
  } catch (error) {
    if (
      error instanceof LiquidiumError &&
      error.code === LiquidiumErrorCode.PROFILE_ALREADY_EXISTS
    ) {
      const existingProfileId = await params.client.accounts.getProfileId(
        params.walletAddress
      );

      if (!existingProfileId) {
        throw error;
      }

      return { profileId: existingProfileId, wasCreated: false };
    }

    throw error;
  }
}
