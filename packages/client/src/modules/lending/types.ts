import type {
  InflowType,
  MarketAsset,
  MarketChain,
  Outflowtype,
} from "../../core/types";

export interface OutflowDetails {
  id: string;
  outflowType: Outflowtype;
  outflowRef?: string;
  amount: bigint;
}

export type LendingInflowType = InflowType;

export const InflowDestinationType = {
  NATIVE_ADDRESS: "NATIVE_ADDRESS",
  ICRC_ACCOUNT: "ICRC_ACCOUNT",
} as const;

export type InflowDestinationType =
  (typeof InflowDestinationType)[keyof typeof InflowDestinationType];

export const InflowTargetType = InflowDestinationType;
export type InflowTargetType = InflowDestinationType;

interface SupplyRequestBase {
  profileId: string;
  poolId: string;
  inflowType: InflowType;
}

export type SupplyRequest =
  | (SupplyRequestBase & {
      destinationType: InflowDestinationType;
      targetType?: never;
    })
  | (SupplyRequestBase & {
      targetType: InflowDestinationType;
      destinationType?: never;
    });

export interface NativeAddressInflowTarget {
  type: typeof InflowDestinationType.NATIVE_ADDRESS;
  poolId: string;
  asset: MarketAsset;
  chain: MarketChain;
  inflowType: InflowType;
  address: string;
}

export interface IcrcAccountInflowTarget {
  type: typeof InflowDestinationType.ICRC_ACCOUNT;
  poolId: string;
  asset: MarketAsset;
  chain: MarketChain;
  inflowType: InflowType;
  owner: string;
  subaccount: Uint8Array;
  account: string;
}

export type InflowTarget = NativeAddressInflowTarget | IcrcAccountInflowTarget;

export interface SupplyInstruction {
  poolId: string;
  asset: MarketAsset;
  chain: MarketChain;
  inflowType: InflowType;
  target: InflowTarget;
}
