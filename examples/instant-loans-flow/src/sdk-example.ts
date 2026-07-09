import type {
  AssetPrices,
  Chain,
  GetActivityStatusResponse,
  InstantLoan,
  InstantLoanAsset,
  InstantLoanDestination,
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
  collateral: {
    poolId: string;
    asset: string;
    amount: bigint;
  };
  borrow: {
    poolId: string;
    asset: string;
    amount: bigint;
    chain: Chain;
    destinationAddress: string;
    destinationType: InstantLoanDestinationType;
  };
  refund: {
    chain: Chain;
    destinationAddress: string;
    destinationType: InstantLoanDestinationType;
  };
  ltvMaxBps: bigint;
  depositWindowSeconds: bigint;
};

export type InstantLoanDestinationType =
  | "ChainAddress"
  | "IcPrincipal"
  | "IcpAccountIdentifier"
  | "IcrcAccount";

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
  collateral,
  borrow,
  refund,
  ltvMaxBps,
  depositWindowSeconds,
}: CreateInstantLoanParams): Promise<InstantLoan> {
  const typedCollateralAsset = toInstantLoanAsset(collateral.asset);
  const typedBorrowAsset = toInstantLoanAsset(borrow.asset);

  return await client.instantLoans.create({
    collateral: {
      poolId: collateral.poolId,
      asset: typedCollateralAsset,
      amount: collateral.amount,
    },
    borrow: {
      poolId: borrow.poolId,
      asset: typedBorrowAsset,
      amount: borrow.amount,
      chain: borrow.chain,
      destination: toInstantLoanDestination(
        borrow.destinationAddress,
        borrow.destinationType
      ),
    },
    refund: {
      chain: refund.chain,
      destination: toInstantLoanDestination(
        refund.destinationAddress,
        refund.destinationType
      ),
    },
    ltvMaxBps,
    depositWindowSeconds,
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
