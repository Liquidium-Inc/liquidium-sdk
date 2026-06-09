import type {
  AssetPrices,
  GetActivityStatusResponse,
  InstantLoan,
  InstantLoanAsset,
  InstantLoanFindResult,
  Pool,
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

type CreateInstantLoanParams = {
  collateralPoolId: string;
  borrowPoolId: string;
  collateralAsset: string;
  borrowAsset: string;
  collateralAmount: bigint;
  borrowAmount: bigint;
  ltvMaxBps: bigint;
  depositWindowSeconds: bigint;
  borrowDestinationAddress: string;
  refundDestinationAddress: string;
};

type GetInstantLoanParams =
  | {
      ref: string;
      loanId?: never;
    }
  | {
      ref?: never;
      loanId: bigint;
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

export async function createInstantLoan({
  collateralPoolId,
  borrowPoolId,
  collateralAsset,
  borrowAsset,
  collateralAmount,
  borrowAmount,
  ltvMaxBps,
  depositWindowSeconds,
  borrowDestinationAddress,
  refundDestinationAddress,
}: CreateInstantLoanParams): Promise<InstantLoan> {
  return await client.instantLoans.create({
    collateralPoolId,
    borrowPoolId,
    collateralAsset: toInstantLoanAsset(collateralAsset),
    borrowAsset: toInstantLoanAsset(borrowAsset),
    collateralAmount,
    borrowAmount,
    ltvMaxBps,
    depositWindowSeconds,
    borrowDestination: {
      type: "External",
      address: borrowDestinationAddress,
    },
    refundDestination: {
      type: "External",
      address: refundDestinationAddress,
    },
  });
}

export async function getInstantLoan(
  params: GetInstantLoanParams
): Promise<InstantLoan> {
  return await client.instantLoans.get(params);
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

export async function findInstantLoans(
  query: string
): Promise<InstantLoanFindResult[]> {
  return await client.instantLoans.find(query);
}

function toInstantLoanAsset(asset: string): InstantLoanAsset {
  return asset as InstantLoanAsset;
}
