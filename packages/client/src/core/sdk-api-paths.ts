/**
 * Path and query key constants for the Liquidium SDK HTTP API.
 */

const SDK_API_V1_PATH = "/v1";
const SDK_API_V2_PATH = "/v2";

export const SdkApiQueryParam = {
  cursor: "cursor",
  from: "from",
  filter: "filter",
  limit: "limit",
  market: "market",
  poolId: "poolId",
  profileId: "profileId",
  states: "states",
  to: "to",
  types: "types",
} as const;

interface BuildActivitiesPathRequest {
  profileId: string;
  filter?: string;
}

interface BuildActivityStatusPathRequest {
  profileId: string;
  id: string;
}

interface BuildInstantLoanFindPathRequest {
  query: string;
}

interface BuildInstantLoanCollateralHintPathRequest {
  loanId: bigint;
}

const ACTIVITIES = `${SDK_API_V2_PATH}/activities`;
const HISTORY_USERS = `${SDK_API_V2_PATH}/history/users`;
const INFLOW = `${SDK_API_V2_PATH}/inflow`;
const INSTANT_LOANS = `${SDK_API_V1_PATH}/instant-loans`;

export function buildHistoryUserTransactionsPath(
  user: string,
  query: URLSearchParams
): string {
  const base = `${HISTORY_USERS}/${encodeURIComponent(user)}/transactions`;
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

export function buildHistoryUserLiquidationsPath(
  user: string,
  query: URLSearchParams
): string {
  const base = `${HISTORY_USERS}/${encodeURIComponent(user)}/liquidations`;
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

export function buildActivitiesPath(
  request: BuildActivitiesPathRequest
): string {
  const query = new URLSearchParams({
    [SdkApiQueryParam.profileId]: request.profileId,
  });
  if (request.filter) {
    query.set(SdkApiQueryParam.filter, request.filter);
  }

  return `${ACTIVITIES}?${query.toString()}`;
}

export function buildActivityStatusPath(
  request: BuildActivityStatusPathRequest
): string {
  const query = new URLSearchParams({
    [SdkApiQueryParam.profileId]: request.profileId,
  });

  return `${ACTIVITIES}/${encodeURIComponent(
    request.id
  )}/status?${query.toString()}`;
}

export function buildInstantLoanFindPath(
  request: BuildInstantLoanFindPathRequest
): string {
  const query = new URLSearchParams({ query: request.query });
  return `${INSTANT_LOANS}/find?${query.toString()}`;
}

export function buildInstantLoanCollateralHintPath(
  request: BuildInstantLoanCollateralHintPathRequest
): string {
  return `${INSTANT_LOANS}/${encodeURIComponent(
    request.loanId.toString()
  )}/collateral-hint`;
}

export const SdkApiPath = {
  inflow: INFLOW,
  instantLoans: INSTANT_LOANS,
} as const;
