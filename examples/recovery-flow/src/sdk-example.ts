import { Principal } from "@icp-sdk/core/principal";
import {
  Chain,
  type LiquidiumClient,
  LiquidiumError,
  type Pool,
  type RecoveryResult,
} from "@liquidium/client";

export type PoolRecoveryBalance =
  | { pool: Pool; amount: bigint; error?: never }
  | { pool: Pool; amount?: never; error: string };

export interface RecoverySubmission {
  receipt: RecoveryResult;
  balances: PoolRecoveryBalance[] | null;
  refreshError: string | null;
}

export async function loadRecoveryBalances(
  client: LiquidiumClient,
  profileId: string
): Promise<PoolRecoveryBalance[]> {
  Principal.fromText(profileId);
  const pools = await client.market.listPools();
  const results = await Promise.allSettled(
    pools.map((pool) => client.lending.getRecoveryBalance(profileId, pool.id))
  );
  return results.map((result, index) => {
    const pool = pools[index];
    return result.status === "fulfilled"
      ? { pool, amount: result.value }
      : { pool, error: formatError(result.reason) };
  });
}

export async function submitAndRefresh(
  client: LiquidiumClient,
  profileId: string,
  submit: () => Promise<RecoveryResult>
): Promise<RecoverySubmission> {
  const receipt = await submit();
  try {
    return {
      receipt,
      balances: await loadRecoveryBalances(client, profileId),
      refreshError: null,
    };
  } catch (error) {
    return { receipt, balances: null, refreshError: formatError(error) };
  }
}

export function getDeliveryChains(pool: Pool): Chain[] {
  return pool.chain === Chain.ICP ? [Chain.ICP] : [Chain.ICP, pool.chain];
}

export function formatError(error: unknown): string {
  if (error instanceof LiquidiumError) return `${error.code}: ${error.message}`;
  return error instanceof Error ? error.message : String(error);
}

export function formatJson(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, item) => (typeof item === "bigint" ? item.toString() : item),
    2
  );
}
