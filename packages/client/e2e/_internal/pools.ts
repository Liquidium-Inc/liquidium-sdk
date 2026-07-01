import { Chain, type Pool } from "../../src";

const MINIMUM_USDT_BORROW_AMOUNT = 1_000_000n;
const MINIMUM_USDC_BORROW_AMOUNT = 1_000_000n;

export function selectBtcCollateralPool(pools: Pool[]): Pool {
  return selectPool({
    pools,
    asset: "BTC",
    chain: Chain.BTC,
  });
}

export function selectBorrowPool(pools: Pool[]): Pool {
  const usdtPool = pools.find(
    (pool) =>
      pool.asset === "USDT" &&
      pool.chain === Chain.ETH &&
      !pool.frozen &&
      pool.availableLiquidity >= MINIMUM_USDT_BORROW_AMOUNT
  );
  if (usdtPool) {
    return usdtPool;
  }

  return selectPool({
    pools,
    asset: "USDC",
    chain: Chain.ETH,
    minimumAvailableLiquidity: MINIMUM_USDC_BORROW_AMOUNT,
  });
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
