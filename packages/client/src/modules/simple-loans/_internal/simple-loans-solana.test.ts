import { Actor } from "@icp-sdk/core/agent";
import { Principal } from "@icp-sdk/core/principal";
import { afterEach, expect, test, vi } from "vitest";
import { LiquidiumClient } from "../../../index";
import {
  createBtcPoolRecord,
  createSimpleLoan,
  createSimpleLoanPosition,
  LOAN_ID,
} from "./test-fixtures";

const SOL_POOL_ID = "efo3x-cyaaa-aaaae-qkpva-cai";
const PROFILE_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";
const SOL_ADDRESS = "So11111111111111111111111111111111111111112";
const REPAY_ADDRESS = "11111111111111111111111111111111";
const COLLATERAL_LAMPORTS = 100_000_000n;
const DEBT_LAMPORTS = 1_000_000n;
const NATIVE_FEE_LAMPORTS = 900_000n;
const NATIVE_MINIMUM_LAMPORTS = 20_000_000n;
const LEDGER_FEE_LAMPORTS = 500n;

afterEach(() => vi.restoreAllMocks());

test("hydrates SOL and ckSOL quotes with separate actions and native minimums", async () => {
  // given
  mockSolLoan();
  const fetch = quoteFetch();
  const client = new LiquidiumClient({
    fetch,
    canisterIds: { pools: { sol: SOL_POOL_ID } },
  });

  // when
  const loan = await client.simpleLoans.get({ loanId: LOAN_ID });

  // then
  expect(loan.borrow).toMatchObject({
    asset: "SOL",
    chain: "SOL",
    decimals: 9n,
  });
  expect(loan.initialDeposit.targets.SOL).toMatchObject({
    amount: COLLATERAL_LAMPORTS + NATIVE_FEE_LAMPORTS,
    target: { address: SOL_ADDRESS, action: "deposit" },
  });
  expect(loan.repayment.targets.SOL).toMatchObject({
    amount: NATIVE_MINIMUM_LAMPORTS,
    inflowFeeAmount: NATIVE_FEE_LAMPORTS,
    inflowFeeEstimateAvailable: true,
    target: { address: REPAY_ADDRESS, action: "repayment" },
  });
  expect(loan.repayment.targets.ICP?.amount).toBe(
    DEBT_LAMPORTS + LEDGER_FEE_LAMPORTS
  );
  const feeRequests = fetch.mock.calls
    .map(([url]) => String(url))
    .filter((url) => url.includes("inflow-fee"));
  expect(feeRequests).toHaveLength(4);
  expect(
    feeRequests.every(
      (url) => new URL(url).searchParams.get("profileId") === PROFILE_ID
    )
  ).toBe(true);
  expect(
    feeRequests.some(
      (url) => new URL(url).searchParams.get("operation") === "repayment"
    )
  ).toBe(true);
});

test("rejects unavailable SOL repayment quotes instead of showing zero fees", async () => {
  // given
  mockSolLoan();
  const client = new LiquidiumClient({
    fetch: quoteFetch(true),
    canisterIds: { pools: { sol: SOL_POOL_ID } },
  });

  // when
  const result = client.simpleLoans.get({ loanId: LOAN_ID });

  // then
  await expect(result).rejects.toThrow();
});

function mockSolLoan() {
  const pool = createBtcPoolRecord({
    principal: Principal.fromText(SOL_POOL_ID),
    asset: { SOL: null },
    chain: { SOL: null },
  });
  const loan = createSimpleLoan({
    lend_asset: { SOL: null },
    borrow_asset: { SOL: null },
    lend_pool_id: Principal.fromText(SOL_POOL_ID),
    borrow_pool_id: Principal.fromText(SOL_POOL_ID),
    lending_profile: Principal.fromText(PROFILE_ID),
    borrow_destination: { External: SOL_ADDRESS },
    refund_destination: { External: SOL_ADDRESS },
  });
  const position = createSimpleLoanPosition(
    SOL_POOL_ID,
    { BTC: null },
    {
      asset: { SOL: null },
      deposited_native_now: COLLATERAL_LAMPORTS,
      debt_native_now: DEBT_LAMPORTS,
    }
  );
  const actor = {
    get_loan: vi.fn().mockResolvedValue({ Ok: loan }),
    list_pools: vi.fn().mockResolvedValue([pool]),
    get_pool_rate: vi.fn().mockResolvedValue([[0n, 0n, 0n]]),
    get_position: vi.fn().mockResolvedValue([position]),
    get_deposit_address: vi
      .fn()
      .mockResolvedValueOnce(SOL_ADDRESS)
      .mockResolvedValueOnce(REPAY_ADDRESS),
  };
  vi.spyOn(Actor, "createActor").mockReturnValue(actor as never);
}

function quoteFetch(failRepayment = false) {
  return vi.fn<typeof globalThis.fetch>().mockImplementation(async (input) => {
    const url = new URL(String(input));
    if (url.pathname.endsWith("/collateral-hint"))
      return Response.json({
        success: true,
        collateralAmountHint: COLLATERAL_LAMPORTS.toString(),
      });
    if (url.pathname.endsWith("/activities"))
      return Response.json({ activities: [] });
    if (url.pathname.endsWith("/solana/inflow-fee")) {
      if (failRepayment && url.searchParams.get("operation") === "repayment")
        return Response.json({ error: "Fee unavailable" }, { status: 503 });
      const isNative = url.searchParams.get("chain") === "SOL";
      return Response.json({
        totalFee: (isNative
          ? NATIVE_FEE_LAMPORTS
          : LEDGER_FEE_LAMPORTS
        ).toString(),
        minimumSendAmount: (isNative
          ? NATIVE_MINIMUM_LAMPORTS
          : LEDGER_FEE_LAMPORTS + 1n
        ).toString(),
        walletTransferFee: LEDGER_FEE_LAMPORTS.toString(),
      });
    }
    throw new Error(`Unexpected request: ${url}`);
  });
}
