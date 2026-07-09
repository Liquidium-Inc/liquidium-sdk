import {
  Chain,
  getMinimumBorrowAmount as getConfiguredMinimumBorrowAmount,
  type Pool,
} from "../../packages/client/src";

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

export function selectIcpPool(pools: Pool[]): Pool {
  return selectPool({
    pools,
    asset: "ICP",
    chain: Chain.ICP,
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

export function selectEthStablecoinPoolByAsset(
  pools: Pool[],
  asset: EthStablecoinBorrowAsset
): Pool {
  return selectPool({
    pools,
    asset,
    chain: Chain.ETH,
  });
}

export function listAvailableBorrowPools(pools: Pool[]): Pool[] {
  return ETH_STABLECOIN_BORROW_ASSETS.map((asset) =>
    findBorrowPoolByAsset(pools, asset)
  ).filter((pool): pool is Pool => Boolean(pool));
}

export function getMinimumBorrowAmount(pool: Pool): bigint {
  if (!isEthStablecoinBorrowAsset(pool.asset)) {
    throw new Error(`Unsupported e2e borrow asset: ${pool.asset}`);
  }

  return getConfiguredMinimumBorrowAmount(pool.asset);
}

function findBorrowPoolByAsset(
  pools: Pool[],
  asset: EthStablecoinBorrowAsset
): Pool | undefined {
  const minimumAvailableLiquidity = getConfiguredMinimumBorrowAmount(asset);

  return pools.find(
    (pool) =>
      pool.asset === asset &&
      pool.chain === Chain.ETH &&
      !pool.frozen &&
      pool.availableLiquidity >= minimumAvailableLiquidity
  );
}

function isEthStablecoinBorrowAsset(
  asset: string
): asset is EthStablecoinBorrowAsset {
  return ETH_STABLECOIN_BORROW_ASSETS.some(
    (borrowAsset) => borrowAsset === asset
  );
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
