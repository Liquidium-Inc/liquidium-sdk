import {
  LiquidiumClient,
  LiquidiumError,
  LiquidiumErrorCode,
  type Pool,
  type SupplyAction,
  type SupplyDestination,
  type SupplyInstruction,
} from "@liquidium/client";

const BTC_ASSET = "BTC";
const BTC_CHAIN = "BTC";
const REQUEST_TIMEOUT_45_SECONDS_MS = 45_000;

type SignatureChain = "ETH" | "BTC";

type CreateOrResolveProfileParams = {
  walletAddress: string;
  chain: SignatureChain;
  signMessage: (message: string) => Promise<string>;
  onStep?: (statusMessage: string) => void;
};

type CreateOrResolveProfileResult = {
  profileId: string;
  wasCreated: boolean;
};

type PoolsResult = {
  pools: Pool[];
  selectedPoolId: string;
};

type PrepareBtcSupplyParams = {
  profileId: string;
  poolId: string;
  action: SupplyAction;
};

export const DEFAULT_SUPPLY_ACTION: SupplyAction = "deposit";
const BTC_ADDRESS_DESTINATION: SupplyDestination = "nativeAddress";

export type { Pool, SupplyAction, SupplyInstruction };

export async function createOrResolveProfileId(
  params: CreateOrResolveProfileParams
): Promise<CreateOrResolveProfileResult> {
  console.log("[dynamic-example] createOrResolveProfileId started", {
    walletAddress: params.walletAddress,
    chain: params.chain,
  });

  const client = createLiquidiumClient();

  try {
    params.onStep?.("Preparing account creation request...");

    const createAction = await withTimeout(
      client.accounts.create({
        account: params.walletAddress,
      }),
      "Timed out while creating the account request."
    );

    console.log("[dynamic-example] account create action received");

    params.onStep?.("Please sign the wallet message to continue...");
    const signature = await params.signMessage(createAction.message);

    params.onStep?.("Submitting signed message to Liquidium...");

    const profileId = await withTimeout(
      createAction.submit({
        signature,
        chain: params.chain,
        account: params.walletAddress,
      }),
      "Timed out while submitting the signed message."
    );

    console.log("[dynamic-example] create action submitted", {
      profileId,
    });

    return {
      profileId,
      wasCreated: true,
    };
  } catch (error) {
    if (
      error instanceof LiquidiumError &&
      error.code === LiquidiumErrorCode.PROFILE_ALREADY_EXISTS
    ) {
      console.log("[dynamic-example] profile already exists, resolving");
      params.onStep?.("Profile already exists. Resolving profile ID...");

      const existingProfileId = await withTimeout(
        client.accounts.resolveProfile(params.walletAddress),
        "Timed out while resolving the existing profile ID."
      );

      if (!existingProfileId) {
        throw error;
      }

      return {
        profileId: existingProfileId,
        wasCreated: false,
      };
    }

    console.error("[dynamic-example] createOrResolveProfileId failed", error);

    throw error;
  }
}

export async function loadPoolsAndDefaultSelection(): Promise<PoolsResult> {
  const client = createLiquidiumClient();
  const pools = await client.market.getPools();
  const selectedPoolId = findBtcPool(pools)?.id ?? pools[0]?.id ?? "";

  return {
    pools,
    selectedPoolId,
  };
}

export async function prepareBtcSupplyInstruction(
  params: PrepareBtcSupplyParams
): Promise<SupplyInstruction> {
  const client = createLiquidiumClient();

  return client.lending.supply({
    profileId: params.profileId,
    poolId: params.poolId,
    action: params.action,
    destination: BTC_ADDRESS_DESTINATION,
  });
}

export function findBtcPool(pools: Pool[]): Pool | undefined {
  return pools.find(
    (pool) => pool.asset === BTC_ASSET && pool.chain === BTC_CHAIN
  );
}

export function isNativeAddressSupplyInstruction(
  supplyInstruction: SupplyInstruction | null
): supplyInstruction is SupplyInstruction & {
  target: { type: "nativeAddress"; address: string };
} {
  if (!supplyInstruction) {
    return false;
  }

  return supplyInstruction.target.type === BTC_ADDRESS_DESTINATION;
}

export function formatLiquidiumError(error: unknown): string {
  if (error instanceof LiquidiumError) {
    return `${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

export function bigintJsonReplacer(_key: string, value: unknown) {
  return typeof value === "bigint" ? value.toString() : value;
}

function createLiquidiumClient() {
  return LiquidiumClient.create({
    host: import.meta.env.VITE_LIQUIDIUM_HOST || undefined,
    apiBaseUrl: import.meta.env.VITE_LIQUIDIUM_API_BASE_URL || undefined,
  });
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMessage: string
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, REQUEST_TIMEOUT_45_SECONDS_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
