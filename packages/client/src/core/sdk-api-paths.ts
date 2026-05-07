/**
 * Path and query key constants for the Liquidium SDK HTTP API.
 */

export const SDK_API_V1_PREFIX = "/v1";

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

type BuildActivitiesPathRequest = {
  profileId: string;
  state?: string;
};

type BuildActivityStatusPathRequest = {
  profileId: string;
  id: string;
};

const HISTORY_POOL = `${SDK_API_V1_PREFIX}/history/pool`;
const HISTORY_RATES = `${SDK_API_V1_PREFIX}/history/rates`;
const HISTORY_USERS = `${SDK_API_V1_PREFIX}/history/users`;

export function buildHistoryPoolPath(poolId: string, cursor?: string): string {
  const base = `${HISTORY_POOL}/${encodeURIComponent(poolId)}`;
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

  return `${SDK_API_V1_PREFIX}/activities?${query.toString()}`;
}

export function buildActivityStatusPath(
  request: BuildActivityStatusPathRequest
): string {
  const query = new URLSearchParams({
    [SdkApiQueryParam.profileId]: request.profileId,
  });

  return `${SDK_API_V1_PREFIX}/activities/${encodeURIComponent(
    request.id
  )}/status?${query.toString()}`;
}

export const SdkApiPath = {
  inflow: `${SDK_API_V1_PREFIX}/inflow`,
} as const;
