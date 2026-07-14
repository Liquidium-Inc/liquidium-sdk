import type {
  AssetPrices,
  CreateSimpleLoanRequest,
  GetActivityStatusResponse,
  Pool,
  SimpleLoan,
  SimpleLoanFindResult,
  SimpleLoanGetRequest,
} from "@liquidium/client";
import { client } from "./client";

type MarketData = {
  pools: Pool[];
  assetPrices: AssetPrices;
};

type CalculateLoanLtvParams = {
  borrowAmount: bigint;
  borrowPoolId: string;
  collateralAmount: bigint;
  collateralPoolId: string;
  pools: Pool[];
  assetPrices: AssetPrices;
};

type GetLoanActivityStatusParams = {
  shortRef: string;
  id: string;
};

export async function loadMarketData(): Promise<MarketData> {
  const [pools, assetPrices] = await Promise.all([
    client.market.listPools(),
    client.market.getAssetPrices(),
  ]);

  return { pools, assetPrices };
}

export function calculateLoanLtv({
  borrowAmount,
  borrowPoolId,
  collateralAmount,
  collateralPoolId,
  pools,
  assetPrices,
}: CalculateLoanLtvParams) {
  return client.quote.calculateLtv(
    {
      borrowAmount,
      borrowPoolId,
      collateralAmount,
      collateralPoolId,
    },
    pools,
    assetPrices
  );
}

export async function createSimpleLoan(
  request: CreateSimpleLoanRequest
): Promise<SimpleLoan> {
  return await client.simpleLoans.create(request);
}

export async function getSimpleLoan(
  params: SimpleLoanGetRequest
): Promise<SimpleLoan> {
  return await client.simpleLoans.get(params);
}

export async function getLoanActivityStatus({
  shortRef,
  id,
}: GetLoanActivityStatusParams): Promise<GetActivityStatusResponse> {
  return await client.activities.getStatus({
    shortRef,
    id,
  });
}

export async function findSimpleLoans(
  query: string
): Promise<SimpleLoanFindResult[]> {
  return await client.simpleLoans.find(query);
}
