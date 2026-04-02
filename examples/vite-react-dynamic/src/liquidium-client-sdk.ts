import {
  type OutflowDetails,
  type GetInflowStatusResponse,
  LiquidiumClient,
  LiquidiumError,
  LiquidiumErrorCode,
  type Pool,
  type SupplyAction,
  type SupplyDestination,
  type SupplyFlow,
  type SupplyInstruction,
  type SupplyTrackingStatus,
} from "@liquidium/client";
import { resolveLiquidiumClientConfig } from "./liquidium-runtime-config";

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

type CreateBorrowParams = {
  profileId: string;
  poolId: string;
  amount: bigint;
  account: string;
  signerAccount: string;
  chain: SignatureChain;
  signMessage: (message: string) => Promise<string>;
  onStep?: (statusMessage: string) => void;
};

type BorrowQuoteParams = {
  profileId: string;
  poolId: string;
  amount: bigint;
};

export type BorrowQuote = {
  asset: string;
  chain: string;
  amountRaw: bigint;
  amountDisplay: string;
  assetPriceUsd: number | null;
  requestedValueUsd: number | null;
  collateralUsd: number;
  debtUsd: number;
  grossBorrowableUsd: number;
  availableBorrowableUsd: number;
  remainingBorrowableUsdAfterRequest: number;
  exceedsBorrowingPower: boolean;
};

export const DEFAULT_SUPPLY_ACTION: SupplyAction = "deposit";
const BTC_ADDRESS_DESTINATION: SupplyDestination = "nativeAddress";

export type { Pool, SupplyAction, SupplyFlow, SupplyInstruction, SupplyTrackingStatus };
export type { OutflowDetails };

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
  const selectedPoolId = await resolveDefaultPoolId(client, pools);

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

export async function prepareBtcSupplyFlow(
  params: PrepareBtcSupplyParams
): Promise<SupplyFlow> {
  const client = createLiquidiumClient();

  return await client.lending.createSupply({
    profileId: params.profileId,
    poolId: params.poolId,
    action: params.action,
    destination: BTC_ADDRESS_DESTINATION,
  });
}

export async function createBorrowOutflow(
  params: CreateBorrowParams
): Promise<OutflowDetails> {
  const client = createLiquidiumClient();

  params.onStep?.("Preparing borrow request...");
  const borrowAction = await withTimeout(
    client.lending.createBorrow({
      profileId: params.profileId,
      poolId: params.poolId,
      amount: params.amount,
      account: params.account,
      signerAccount: params.signerAccount,
    }),
    "Timed out while creating the borrow request."
  );

  params.onStep?.("Please sign the borrow message to continue...");
  const signature = await params.signMessage(borrowAction.message);

  params.onStep?.("Submitting signed borrow request to Liquidium...");

  return await withTimeout(
    borrowAction.submit({
      signature,
      chain: params.chain,
    }),
    "Timed out while submitting the signed borrow request."
  );
}

export async function createWithdrawOutflow(
  params: CreateBorrowParams
): Promise<OutflowDetails> {
  const client = createLiquidiumClient();

  params.onStep?.("Preparing withdraw request...");
  const withdrawAction = await withTimeout(
    client.lending.createWithdraw({
      profileId: params.profileId,
      poolId: params.poolId,
      amount: params.amount,
      account: params.account,
      signerAccount: params.signerAccount,
    }),
    "Timed out while creating the withdraw request."
  );

  params.onStep?.("Please sign the withdraw message to continue...");
  const signature = await params.signMessage(withdrawAction.message);

  params.onStep?.("Submitting signed withdraw request to Liquidium...");

  return await withTimeout(
    withdrawAction.submit({
      signature,
      chain: params.chain,
    }),
    "Timed out while submitting the signed withdraw request."
  );
}

export async function getBorrowQuote(
  params: BorrowQuoteParams
): Promise<BorrowQuote> {
  const client = createLiquidiumClient();
  const [pools, assetPrices, userStats] = await Promise.all([
    client.market.getPools(),
    client.market.getAssetPrices(),
    client.positions.getUserStats(params.profileId),
  ]);
  const selectedPool = pools.find((pool) => pool.id === params.poolId);

  if (!selectedPool) {
    throw new Error(`Pool not found: ${params.poolId}`);
  }

  const assetDecimals = getAssetDecimals(selectedPool.asset);
  const amountDisplay = formatUnits(params.amount, assetDecimals);
  const assetPriceUsd = assetPrices[selectedPool.asset] ?? null;
  const requestedValueUsd =
    assetPriceUsd === null ? null : Number(amountDisplay) * assetPriceUsd;
  const collateralUsd = formatScaledUsd(
    userStats.collateral,
    userStats.collateralDecimals
  );
  const debtUsd = formatScaledUsd(userStats.debt, userStats.debtDecimals);
  const grossBorrowableUsd = formatScaledUsd(
    userStats.borrowingPower.maxBorrowableUsd,
    userStats.borrowingPower.maxBorrowableUsdDecimals
  );
  const availableBorrowableUsd = Math.max(grossBorrowableUsd - debtUsd, 0);
  const remainingBorrowableUsdAfterRequest = Math.max(
    availableBorrowableUsd - (requestedValueUsd ?? 0),
    0
  );

  return {
    asset: selectedPool.asset,
    chain: selectedPool.chain,
    amountRaw: params.amount,
    amountDisplay,
    assetPriceUsd,
    requestedValueUsd,
    collateralUsd,
    debtUsd,
    grossBorrowableUsd,
    availableBorrowableUsd,
    remainingBorrowableUsdAfterRequest,
    exceedsBorrowingPower:
      requestedValueUsd !== null && requestedValueUsd > availableBorrowableUsd,
  };
}

export async function submitInflowTxid(txid: string) {
  const client = createLiquidiumClient();

  return await client.lending.submitInflow({ txid });
}

export async function getInflowStatus(params: {
  profileId: string;
  txid?: string;
}): Promise<GetInflowStatusResponse> {
  const client = createLiquidiumClient();

  return await client.lending.getInflowStatus({
    profileId: params.profileId,
    txid: params.txid,
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
  return LiquidiumClient.create(resolveLiquidiumClientConfig());
}

function getAssetDecimals(asset: string): number {
  switch (asset) {
    case "BTC":
      return 8;
    case "USDT":
    case "USDC":
      return 6;
    case "SOL":
      return 9;
    default:
      return 8;
  }
}

function formatUnits(value: bigint, decimals: number): string {
  if (decimals === 0) {
    return value.toString();
  }

  const decimalBase = 10n ** BigInt(decimals);
  const whole = value / decimalBase;
  const fraction = value % decimalBase;

  if (fraction === 0n) {
    return whole.toString();
  }

  return `${whole}.${fraction.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}

function formatScaledUsd(value: bigint, decimals: bigint): number {
  return Number(value) / 10 ** Number(decimals);
}

async function resolveDefaultPoolId(
  client: LiquidiumClient,
  pools: Pool[]
): Promise<string> {
  try {
    const btcPool = await client.market.findPool({
      asset: BTC_ASSET,
      chain: BTC_CHAIN,
    });

    return btcPool.id;
  } catch (error) {
    if (error instanceof LiquidiumError) {
      if (error.code === LiquidiumErrorCode.POOL_NOT_FOUND) {
        return pools[0]?.id ?? "";
      }

      if (error.code === LiquidiumErrorCode.VALIDATION_ERROR) {
        return "";
      }
    }

    throw error;
  }
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
