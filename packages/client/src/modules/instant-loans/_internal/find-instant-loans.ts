import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import type { Activity } from "../../activities";
import type {
  InstantLoan,
  InstantLoanFindRequest,
  InstantLoanFindResult,
  InstantLoanGetRequest,
} from "../types";

export const INSTANT_LOAN_FIND_QUERY_MAX_LENGTH = 256;

export interface InstantLoanFindCandidate {
  loanId: bigint;
}

export interface FindInstantLoansDependencies {
  getLoan(request: InstantLoanGetRequest): Promise<InstantLoan>;
  findCandidatesByQuery(query: string): Promise<InstantLoanFindCandidate[]>;
  listActivitiesByProfileId(profileId: string): Promise<Activity[]>;
}

export async function findInstantLoans(
  request: string | bigint | InstantLoanFindRequest,
  dependencies: FindInstantLoansDependencies
): Promise<InstantLoanFindResult[]> {
  if (typeof request === "bigint") {
    return await findDirectLoan({ loanId: request }, dependencies);
  }

  if (typeof request === "string") {
    return await findByQuery(request, dependencies);
  }

  if ("loanId" in request) {
    return await findDirectLoan({ loanId: request.loanId }, dependencies);
  }

  if ("ref" in request) {
    return await findDirectLoan(
      { ref: validateInstantLoanFindQuery(request.ref) },
      dependencies
    );
  }

  return await findByQuery(request.query, dependencies);
}

export function validateInstantLoanFindQuery(query: string): string {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan find query must be non-empty"
    );
  }
  if (trimmedQuery.length > INSTANT_LOAN_FIND_QUERY_MAX_LENGTH) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Instant loan find query must be at most ${INSTANT_LOAN_FIND_QUERY_MAX_LENGTH.toString()} characters`
    );
  }

  return trimmedQuery;
}

async function findByQuery(
  query: string,
  dependencies: FindInstantLoansDependencies
): Promise<InstantLoanFindResult[]> {
  const trimmedQuery = validateInstantLoanFindQuery(query);
  const candidates = await dependencies.findCandidatesByQuery(trimmedQuery);

  return await Promise.all(
    uniqueBigints(candidates.map((candidate) => candidate.loanId)).map(
      (loanId) => createFindResultByLoanId(loanId, dependencies)
    )
  );
}

async function findDirectLoan(
  request: InstantLoanGetRequest,
  dependencies: FindInstantLoansDependencies
): Promise<InstantLoanFindResult[]> {
  if ("loanId" in request && request.loanId < 0n) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan ID must be non-negative"
    );
  }

  try {
    const loan = await dependencies.getLoan(request);
    return [await createFindResult(loan, dependencies)];
  } catch (error) {
    if (
      error instanceof LiquidiumError &&
      error.code === LiquidiumErrorCode.POSITION_NOT_FOUND
    ) {
      return [];
    }

    throw error;
  }
}

async function createFindResultByLoanId(
  loanId: bigint,
  dependencies: FindInstantLoansDependencies
): Promise<InstantLoanFindResult> {
  const loan = await dependencies.getLoan({ loanId });
  return await createFindResult(loan, dependencies);
}

async function createFindResult(
  loan: InstantLoan,
  dependencies: FindInstantLoansDependencies
): Promise<InstantLoanFindResult> {
  return {
    loan,
    activities: await dependencies.listActivitiesByProfileId(loan.profileId),
  };
}

function uniqueBigints(values: bigint[]): bigint[] {
  return [...new Set(values)];
}
