import type {
  AssetPrices,
  GetActivityStatusResponse,
  InstantLoan,
  InstantLoanAsset,
  InstantLoanDestination,
  InstantLoanFindResult,
  InstantLoanTransferModeOptions,
  Pool,
  TransferMode,
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
  borrowTransferMode: TransferMode;
  borrowDestinationAddress: string;
  borrowDestinationType: InstantLoanDestinationType;
  refundTransferMode: TransferMode;
  refundDestinationAddress: string;
  refundDestinationType: InstantLoanDestinationType;
};

export type InstantLoanDestinationType =
  | "ChainAddress"
  | "IcPrincipal"
  | "IcpAccountIdentifier"
  | "IcrcAccount";

type GetInstantLoanParams = InstantLoanTransferModeOptions &
  (
    | {
        ref: string;
        loanId?: never;
      }
    | {
        ref?: never;
        loanId: bigint;
      }
  );

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
  borrowTransferMode,
  borrowDestinationAddress,
  borrowDestinationType,
  refundTransferMode,
  refundDestinationAddress,
  refundDestinationType,
}: CreateInstantLoanParams): Promise<InstantLoan> {
  const typedCollateralAsset = toInstantLoanAsset(collateralAsset);
  const typedBorrowAsset = toInstantLoanAsset(borrowAsset);

  return await client.instantLoans.create({
    collateralPoolId,
    borrowPoolId,
    collateralAsset: typedCollateralAsset,
    borrowAsset: typedBorrowAsset,
    collateralAmount,
    borrowAmount,
    ltvMaxBps,
    depositWindowSeconds,
    borrowTransferMode,
    borrowDestination: toInstantLoanDestination(
      borrowDestinationAddress,
      borrowDestinationType
    ),
    refundTransferMode,
    refundDestination: toInstantLoanDestination(
      refundDestinationAddress,
      refundDestinationType
    ),
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

function toInstantLoanDestination(
  address: string,
  destinationType: InstantLoanDestinationType
): InstantLoanDestination {
  switch (destinationType) {
    case "ChainAddress":
      return {
        type: "ChainAddress",
        address,
      };
    case "IcPrincipal":
      return {
        type: "IcPrincipal",
        address,
      };
    case "IcpAccountIdentifier":
      return {
        type: "IcpAccountIdentifier",
        address,
      };
    case "IcrcAccount":
      return {
        type: "IcrcAccount",
        address,
      };
  }
}
