import { Chain, type Pool } from "../../packages/client/src";

const MINIMUM_USDT_BORROW_AMOUNT = 1_000_000n;
const MINIMUM_USDC_BORROW_AMOUNT = 1_000_000n;
const ETH_STABLECOIN_BORROW_ASSETS = ["USDT", "USDC"] as const;

export type EthStablecoinBorrowAsset =
  (typeof ETH_STABLECOIN_BORROW_ASSETS)[number];

export function selectBtcCollateralPool(pools: Pool[]): Pool {
  return selectPool({
    pools,
    asset: "BTC",
    chain: Chain.BTC,
  });
}

export function selectBorrowPool(pools: Pool[]): Pool {
  for (const asset of ETH_STABLECOIN_BORROW_ASSETS) {
    const pool = findBorrowPoolByAsset(pools, asset);
    if (pool) {
      return pool;
    }
  }

  throw new Error(
    "No live ETH stablecoin borrow pool is available for e2e tests"
  );
}

export function selectBorrowPoolByAsset(
  pools: Pool[],
  asset: EthStablecoinBorrowAsset
): Pool {
  const pool = findBorrowPoolByAsset(pools, asset);
  if (!pool) {
    throw new Error(
      `No live ${Chain.ETH} ${asset} pool is available for e2e tests`
    );
  }

  return pool;
}

export function listAvailableBorrowPools(pools: Pool[]): Pool[] {
  return ETH_STABLECOIN_BORROW_ASSETS.map((asset) =>
    findBorrowPoolByAsset(pools, asset)
  ).filter((pool): pool is Pool => Boolean(pool));
}

export function getMinimumBorrowAmount(pool: Pool): bigint {
  if (pool.asset === "USDT") {
    return MINIMUM_USDT_BORROW_AMOUNT;
  }

  if (pool.asset === "USDC") {
    return MINIMUM_USDC_BORROW_AMOUNT;
  }

  throw new Error(`Unsupported e2e borrow asset: ${pool.asset}`);
}

function findBorrowPoolByAsset(
  pools: Pool[],
  asset: EthStablecoinBorrowAsset
): Pool | undefined {
  const minimumAvailableLiquidity = getMinimumBorrowAmountForAsset(asset);

  return pools.find(
    (pool) =>
      pool.asset === asset &&
      pool.chain === Chain.ETH &&
      !pool.frozen &&
      pool.availableLiquidity >= minimumAvailableLiquidity
  );
}

function getMinimumBorrowAmountForAsset(
  asset: EthStablecoinBorrowAsset
): bigint {
  if (asset === "USDT") {
    return MINIMUM_USDT_BORROW_AMOUNT;
  }

  return MINIMUM_USDC_BORROW_AMOUNT;
}

function selectPool(params: {
  pools: Pool[];
  asset: string;
  chain: string;
  minimumAvailableLiquidity?: bigint;
}): Pool {
  const pool = params.pools.find(
    (candidate) =>
      candidate.asset === params.asset &&
      candidate.chain === params.chain &&
      !candidate.frozen &&
      candidate.availableLiquidity >= (params.minimumAvailableLiquidity ?? 0n)
  );

  if (!pool) {
    throw new Error(
      `No live ${params.chain} ${params.asset} pool is available for e2e tests`
    );
  }

  return pool;
}
