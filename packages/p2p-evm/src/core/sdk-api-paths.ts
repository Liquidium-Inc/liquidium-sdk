/**
 * Path and query key constants for the Liquidium P2P EVM SDK HTTP API.
 */

const SDK_API_V1_PATH = "/v1";

export const SdkApiQueryParam = {
  asset: "asset",
  chainId: "chainId",
  collection: "collection",
} as const;

interface BuildOffersPathRequest {
  chainId: number;
  collection?: string;
  asset?: string;
}

const MARKETS = `${SDK_API_V1_PATH}/markets`;
const OFFERS = `${SDK_API_V1_PATH}/offers`;
const VALUATIONS = `${SDK_API_V1_PATH}/valuations`;

export function buildMarketsPath(chainId: number): string {
  const query = new URLSearchParams({
    [SdkApiQueryParam.chainId]: chainId.toString(),
  });
  return `${MARKETS}?${query.toString()}`;
}

export function buildOffersPath(request: BuildOffersPathRequest): string {
  const query = new URLSearchParams({
    [SdkApiQueryParam.chainId]: request.chainId.toString(),
  });
  if (request.collection) {
    query.set(SdkApiQueryParam.collection, request.collection);
  }
  if (request.asset) {
    query.set(SdkApiQueryParam.asset, request.asset);
  }
  return `${OFFERS}?${query.toString()}`;
}

export const SdkApiPath = {
  offers: OFFERS,
  valuations: VALUATIONS,
} as const;
