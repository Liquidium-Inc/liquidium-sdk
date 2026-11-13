import type { ContractFunctionReturnType } from "viem";
import { P2pEvmError, P2pEvmErrorCode } from "../../core/errors";
import type { loanCoreAbi } from "../../generated/loan-core";
import type { Loan, LoanStatus } from "./types";

type LoanCoreLoan = ContractFunctionReturnType<
  typeof loanCoreAbi,
  "view",
  "getLoan"
>;

// Mirrors `enum LoanStatus { Active, Repaid, Defaulted }` in ILoanCore.sol.
const LOAN_STATUS_BY_INDEX: readonly LoanStatus[] = [
  "active",
  "repaid",
  "defaulted",
];

export function toLoan(loanId: bigint, loan: LoanCoreLoan): Loan {
  const status = LOAN_STATUS_BY_INDEX[loan.status];
  if (!status) {
    throw new P2pEvmError(
      P2pEvmErrorCode.INTERNAL,
      `LoanCore returned unknown loan status ${loan.status}`
    );
  }

  return {
    loanId,
    borrower: loan.borrower,
    lender: loan.lender,
    collection: loan.collection,
    tokenId: loan.tokenId,
    asset: loan.asset,
    principal: loan.principal,
    repayment: loan.repayment,
    feeBps: loan.feeBps,
    startTime: loan.startTime,
    maturity: loan.maturity,
    status,
    collateralHeld: loan.collateralHeld,
  };
}
