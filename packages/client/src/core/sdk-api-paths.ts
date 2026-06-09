/**
 * Path and query key constants for the Liquidium SDK HTTP API.
 */

const SDK_API_VERSION = {
  activities: "v1",
  history: "v1",
  inflow: "v1",
  instantLoans: "v1",
} as const;

export const SdkApiQueryParam = {
  cursor: "cursor",
  from: "from",
  limit: "limit",
  market: "market",
  poolId: "poolId",
  profileId: "profileId",
  state: "state",
  statuses: "statuses",
  to: "to",
  types: "types",
} as const;

interface BuildActivitiesPathRequest {
  profileId: string;
  state?: string;
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

const ACTIVITIES = `/${SDK_API_VERSION.activities}/activities`;
const HISTORY_POOL = `/${SDK_API_VERSION.history}/history/pool`;
const HISTORY_POOL_CONFIG = `/${SDK_API_VERSION.history}/history/pool-config`;
const HISTORY_RATES = `/${SDK_API_VERSION.history}/history/rates`;
const HISTORY_USERS = `/${SDK_API_VERSION.history}/history/users`;
const INFLOW = `/${SDK_API_VERSION.inflow}/inflow`;
const INSTANT_LOANS = `/${SDK_API_VERSION.instantLoans}/instant-loans`;

export function buildHistoryPoolPath(
  poolId: string,
  query: URLSearchParams
): string {
  const base = `${HISTORY_POOL}/${encodeURIComponent(poolId)}`;
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

export function buildHistoryPoolConfigPath(
  poolId: string,
  cursor?: string
): string {
  const base = `${HISTORY_POOL_CONFIG}/${encodeURIComponent(poolId)}`;
  if (!cursor) {
    return base;
  }

  const query = new URLSearchParams({ [SdkApiQueryParam.cursor]: cursor });
  return `${base}?${query.toString()}`;
}

export function buildHistoryRatesPath(
  poolId: string,
  query: URLSearchParams
): string {
  const base = `${HISTORY_RATES}/${encodeURIComponent(poolId)}`;
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}

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
  if (request.state) {
    query.set(SdkApiQueryParam.state, request.state);
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
