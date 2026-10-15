import type { LiquidiumClient, Pool, RecoveryResult } from "@liquidium/client";
import { expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { loadRecoveryBalances, submitAndRefresh } from "../sdk-example";

const PROFILE_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";

test("shows a failed pool read separately from zero and available funds", async () => {
  // given
  const client = mockDeep<LiquidiumClient>();
  const pools = ["btc-pool", "eth-pool", "icp-pool"].map((id) =>
    mockDeep<Pool>({ id })
  );
  const availableAmount = 100_000n;
  const emptyAmount = 0n;
  const readError = new Error("Ledger unavailable");
  client.market.listPools.mockResolvedValue(
    pools satisfies Awaited<ReturnType<LiquidiumClient["market"]["listPools"]>>
  );
  client.lending.getRecoveryBalance
    .mockResolvedValueOnce(availableAmount satisfies bigint)
    .mockRejectedValueOnce(readError)
    .mockResolvedValueOnce(emptyAmount satisfies bigint);

  // when
  const balances = await loadRecoveryBalances(client, PROFILE_ID);

  // then
  expect(balances).toEqual([
    { pool: pools[0], amount: availableAmount },
    { pool: pools[1], error: readError.message },
    { pool: pools[2], amount: emptyAmount },
  ]);
  expect(client.lending.getRecoveryBalance.mock.calls).toEqual(
    pools.map(({ id }) => [PROFILE_ID, id])
  );
  expect(client.positions.listPositions).not.toHaveBeenCalled();
  expect(client.activities.list).not.toHaveBeenCalled();
});

test("rejects an invalid profile before reading pools", async () => {
  // given
  const client = mockDeep<LiquidiumClient>();
  const invalidProfileId = "not-a-principal";

  // when
  const load = loadRecoveryBalances(client, invalidProfileId);

  // then
  await expect(load).rejects.toThrow();
  expect(client.market.listPools).not.toHaveBeenCalled();
});

test("keeps the transfer receipt when the following balance refresh fails", async () => {
  // given
  const client = mockDeep<LiquidiumClient>();
  const receipt: RecoveryResult = {
    amount: 100_000n,
    ledgerCanisterId: "ryjl3-tyaaa-aaaaa-aaaba-cai",
    blockIndex: 123n,
    status: {
      operation: "withdrawal",
      state: "processing",
      confirmations: null,
      requiredConfirmations: null,
    },
  };
  const refreshError = new Error("Pool query failed");
  const submit = vi
    .fn<() => Promise<RecoveryResult>>()
    .mockResolvedValue(receipt satisfies RecoveryResult);
  client.market.listPools.mockRejectedValue(refreshError);

  // when
  const result = await submitAndRefresh(client, PROFILE_ID, submit);

  // then
  expect(result).toEqual({
    receipt,
    balances: null,
    refreshError: refreshError.message,
  });
  expect(submit).toHaveBeenCalledOnce();
});

test("does not retry an uncertain transfer", async () => {
  // given
  const client = mockDeep<LiquidiumClient>();
  const transferError = new Error("Update reply unavailable");
  const submit = vi
    .fn<() => Promise<RecoveryResult>>()
    .mockRejectedValue(transferError);

  // when
  const result = submitAndRefresh(client, PROFILE_ID, submit);

  // then
  await expect(result).rejects.toBe(transferError);
  expect(submit).toHaveBeenCalledOnce();
  expect(client.market.listPools).not.toHaveBeenCalled();
});
