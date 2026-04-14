import {
  type ApySample,
  type AssetPrices,
  LiquidiumClient,
  LiquidiumError,
  LiquidiumErrorCode,
  type OutflowDetails,
  type Pool,
  type QuoteRequest,
  type QuoteResult,
  type SupplyAction,
  type SupplyDestination,
  type SupplyFlow,
  type SupplyInstruction,
  type UserHistoryEntry,
  type UserStats,
  type WalletAdapter,
} from "@liquidium/client";
import { resolveLiquidiumClientConfig } from "./liquidium-runtime-config";

const BTC_ASSET = "BTC";
const BTC_CHAIN = "BTC";
const BTC_ADDRESS_DESTINATION: SupplyDestination = "nativeAddress";
const REQUEST_TIMEOUT_5_MINUTES_MS = 300_000;

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

type QuoteContextResult = PoolsResult & {
  prices: AssetPrices;
};

type PrepareBtcSupplyParams = {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  btcAmountSats: bigint;
  btcAccount: string;
  sendBtcTransaction?: (params: {
    toAddress: string;
    amountSats: bigint;
  }) => Promise<string>;
};

type PrepareErc20SupplyParams = {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  amount: bigint;
  walletAddress: string;
  sendEthTransaction: (params: {
    to: string;
    data?: string;
    value?: string;
  }) => Promise<string>;
};

type CreateBorrowParams = {
  profileId: string;
  poolId: string;
  amount: bigint;
  receiverAddress: string;
  signerWalletAddress: string;
  signerChain: SignatureChain;
  signMessage: (message: string) => Promise<string>;
  onStep?: (statusMessage: string) => void;
};

export type {
  ApySample,
  OutflowDetails,
  Pool,
  SupplyAction,
  SupplyFlow,
  UserHistoryEntry,
  UserStats,
};

function createWalletAdapter(
  signMessage: (message: string) => Promise<string>
): WalletAdapter {
  return {
    signMessage: async ({ message }) => await signMessage(message),
  };
}

export async function createOrResolveProfileIdSimple(
  params: CreateOrResolveProfileParams
): Promise<CreateOrResolveProfileResult> {
  const client = createLiquidiumClient();

  try {
    params.onStep?.("Creating Liquidium account...");

    const profileId = await withTimeout(
      client.accounts.create({
        account: params.walletAddress,
        chain: params.chain,
        walletAdapter: createWalletAdapter(params.signMessage),
      }),
      "Timed out while creating the account."
    );

    return {
      profileId,
      wasCreated: true,
    };
  } catch (error) {
    if (
      error instanceof LiquidiumError &&
      error.code === LiquidiumErrorCode.PROFILE_ALREADY_EXISTS
    ) {
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

export async function loadQuoteContext(): Promise<QuoteContextResult> {
  const client = createLiquidiumClient();
  const [pools, prices] = await Promise.all([
    client.market.getPools(),
    client.market.getAssetPrices(),
  ]);
  const selectedPoolId = await resolveDefaultPoolId(client, pools);

  return {
    pools,
    prices,
    selectedPoolId,
  };
}

export async function loadUserPositionSummary(
  profileId: string
): Promise<UserStats> {
  const client = createLiquidiumClient();

  return await client.positions.getUserStats(profileId);
}

export async function loadUserTransactionHistory(
  profileId: string,
  market?: string,
  filters?: { cursor?: string; from?: string; to?: string; limit?: number }
): Promise<{ items: UserHistoryEntry[]; nextCursor?: string }> {
  const client = createLiquidiumClient();

  return await client.history.getUserTransactionHistory(
    profileId,
    market,
    filters
  );
}

export async function loadLiquidationActivities(
  profileId: string,
  market?: string
): Promise<{ items: UserHistoryEntry[]; nextCursor?: string }> {
  const client = createLiquidiumClient();

  return await client.history.getLiquidationHistory(profileId, market);
}

export async function loadBorrowApyHistory(
  poolId: string,
  window?: { cursor?: string; from?: string; to?: string; limit?: number }
): Promise<{ items: ApySample[]; nextCursor?: string }> {
  const client = createLiquidiumClient();

  return await client.history.getBorrowRateHistory(poolId, window);
}

export async function getLoanQuote(params: {
  request: QuoteRequest;
  pools: Pool[];
  prices: AssetPrices;
}): Promise<QuoteResult> {
  const client = createLiquidiumClient();

  return await client.quote.quote(params.request, params.pools, params.prices);
}

export async function prepareBtcSupplyFlow(
  params: PrepareBtcSupplyParams
): Promise<SupplyFlow> {
  const client = createLiquidiumClient();

  const baseRequest = {
    profileId: params.profileId,
    poolId: params.poolId,
    action: params.action,
    destination: BTC_ADDRESS_DESTINATION,
  } as const;

  if (!params.sendBtcTransaction) {
    return await client.lending.supply(baseRequest);
  }

  const sendBtcTransaction = params.sendBtcTransaction;

  return await client.lending.supply({
    ...baseRequest,
    btcAmountSats: params.btcAmountSats,
    btcAccount: params.btcAccount,
    btcWalletAdapter: {
      sendBtcTransaction: async ({ toAddress, amountSats }) =>
        await sendBtcTransaction({
          toAddress,
          amountSats: amountSats ?? params.btcAmountSats,
        }),
    },
  });
}

export async function prepareErc20SupplyFlow(
  params: PrepareErc20SupplyParams
): Promise<SupplyFlow> {
  const client = createLiquidiumClient();

  return await client.lending.supply({
    profileId: params.profileId,
    poolId: params.poolId,
    action: params.action,
    destination: "icrcAccount",
    ethAmount: params.amount,
    ethAccount: params.walletAddress,
    ethWalletAdapter: {
      sendEthTransaction: async ({ transaction }) =>
        await params.sendEthTransaction(transaction),
    },
  });
}

export async function createBorrowOutflow(
  params: CreateBorrowParams
): Promise<OutflowDetails> {
  const client = createLiquidiumClient();

  params.onStep?.("Preparing borrow request...");
  params.onStep?.("Please sign the borrow message to continue...");
  params.onStep?.(
    "Submitting signed borrow request and waiting for BTC txid..."
  );

  const borrowOutflow = await withTimeout(
    client.lending.borrow({
      profileId: params.profileId,
      poolId: params.poolId,
      amount: params.amount,
      receiverAddress: params.receiverAddress,
      signerWalletAddress: params.signerWalletAddress,
      signerChain: params.signerChain,
      signerWalletAdapter: createWalletAdapter(params.signMessage),
      waitForTxid: true,
    }),
    "Timed out while waiting for the borrow txid."
  );

  if (borrowOutflow.txid) {
    params.onStep?.(`Borrow txid assigned: ${borrowOutflow.txid}`);
  }

  return borrowOutflow;
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
  timeoutMessage: string,
  timeoutMs: number = REQUEST_TIMEOUT_5_MINUTES_MS
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
