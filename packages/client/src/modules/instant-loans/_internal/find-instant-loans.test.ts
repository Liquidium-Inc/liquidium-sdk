import { expect, test, vi } from "vitest";
import { LiquidiumErrorCode } from "../../../core/errors";
import { SupplyAction } from "../../../core/types";
import type { SupplyTarget } from "../../lending";
import type { InstantLoan } from "../types";
import {
  findInstantLoans,
  type InstantLoanFindCandidate,
} from "./find-instant-loans";

const LOAN_ID = 42n;
const PROFILE_ID = "aaaaa-aa";
const POOL_ID = "hkmli-faaaa-aaaar-qb4ba-cai";
const LOAN_REF = "ABC123";

test("should use API candidates for free-form string queries", async () => {
  // given
  const loan = createLoan({ loanId: LOAN_ID, profileId: PROFILE_ID });
  const getLoan = vi.fn().mockResolvedValue(loan);
  const findCandidatesByQuery = vi
    .fn()
    .mockResolvedValue([createCandidate({ loanId: LOAN_ID })]);
  const listActivitiesByProfileId = vi.fn().mockResolvedValue([]);

  // when
  const results = await findInstantLoans("42", {
    getLoan,
    findCandidatesByQuery,
    listActivitiesByProfileId,
  });

  // then
  expect(findCandidatesByQuery).toHaveBeenCalledWith("42");
  expect(getLoan).toHaveBeenCalledWith({ loanId: LOAN_ID });
  expect(getLoan).toHaveBeenCalledTimes(1);
  expect(listActivitiesByProfileId).toHaveBeenCalledWith(PROFILE_ID);
  expect(results).toEqual([{ loan, activities: [] }]);
});

test("should use direct canister lookup for exact typed identifiers", async () => {
  // given
  const loan = createLoan({ loanId: LOAN_ID, profileId: PROFILE_ID });
  const getLoan = vi.fn().mockResolvedValue(loan);
  const findCandidatesByQuery = vi.fn();
  const listActivitiesByProfileId = vi.fn().mockResolvedValue([]);

  // when
  const results = await findInstantLoans(
    { ref: LOAN_REF },
    {
      getLoan,
      findCandidatesByQuery,
      listActivitiesByProfileId,
    }
  );

  // then
  expect(findCandidatesByQuery).not.toHaveBeenCalled();
  expect(getLoan).toHaveBeenCalledWith({ ref: LOAN_REF });
  expect(results).toEqual([{ loan, activities: [] }]);
});

test("should reject empty free-form queries before orchestration", async () => {
  // given
  const getLoan = vi.fn();
  const findCandidatesByQuery = vi.fn();
  const listActivitiesByProfileId = vi.fn();

  // when
  const result = findInstantLoans("   ", {
    getLoan,
    findCandidatesByQuery,
    listActivitiesByProfileId,
  });

  // then
  await expect(result).rejects.toMatchObject({
    code: LiquidiumErrorCode.VALIDATION_ERROR,
  });
  expect(getLoan).not.toHaveBeenCalled();
  expect(findCandidatesByQuery).not.toHaveBeenCalled();
});

function createCandidate(
  overrides: Partial<InstantLoanFindCandidate> = {}
): InstantLoanFindCandidate {
  return {
    loanId: LOAN_ID,
    ...overrides,
  };
}

function createLoan(
  overrides: Pick<InstantLoan, "loanId" | "profileId">
): InstantLoan {
  const depositTarget = createSupplyTarget(SupplyAction.deposit);
  const repaymentTarget = createSupplyTarget(SupplyAction.repayment);

  return {
    loanId: overrides.loanId,
    ref: LOAN_REF,
    status: "active",
    profileId: overrides.profileId,
    terms: {
      ltvMaxBps: 6_000n,
      depositWindowSeconds: 3_600n,
    },
    collateral: {
      poolId: POOL_ID,
      asset: "BTC",
      chain: "BTC",
      decimals: 8n,
      amount: 10_000n,
    },
    borrow: {
      poolId: POOL_ID,
      asset: "USDT",
      chain: "ETH",
      decimals: 6n,
      amount: 1_000n,
      destination: { type: "External", address: "0xabc" },
    },
    refundDestination: { type: "External", address: "bc1qrefund" },
    initialDeposit: {
      amount: 10_000n,
      decimals: 8n,
      collateralAmount: 10_000n,
      inflowFeeAmount: 0n,
      asset: "BTC",
      chain: "BTC",
      target: depositTarget,
      detectedTimestamp: null,
      expiryTimestamp: null,
    },
    repayment: {
      amount: 1_000n,
      decimals: 6n,
      debtAmount: 1_000n,
      interestBufferAmount: 0n,
      interestBufferSeconds: 86_400n,
      inflowFeeAmount: 0n,
      inflowFeeEstimateAvailable: true,
      asset: "USDT",
      chain: "ETH",
      target: repaymentTarget,
    },
    position: {
      collateralAmount: 10_000n,
      collateralDecimals: 8n,
      collateralInterestAmount: 0n,
      borrowedAmount: 1_000n,
      borrowedDecimals: 6n,
      debtInterestAmount: 0n,
      totalDebtAmount: 1_000n,
    },
  };
}

function createSupplyTarget(action: SupplyAction): SupplyTarget {
  return {
    type: "nativeAddress",
    poolId: POOL_ID,
    asset: action === SupplyAction.deposit ? "BTC" : "USDT",
    chain: action === SupplyAction.deposit ? "BTC" : "ETH",
    action,
    address: action === SupplyAction.deposit ? "bc1qdeposit" : "0xrepay",
  };
}
