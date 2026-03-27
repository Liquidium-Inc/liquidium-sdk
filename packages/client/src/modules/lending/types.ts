import type {
  MarketAsset,
  MarketChain,
  Outflowtype,
  SupplyAction,
} from "../../core/types";

export interface OutflowDetails {
  id: string;
  outflowType: Outflowtype;
  outflowRef?: string;
  amount: bigint;
}

export type SupplyDestination = "nativeAddress" | "icrcAccount";

export interface SupplyRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  destination: SupplyDestination;
}

export interface NativeAddressSupplyTarget {
  type: "nativeAddress";
  poolId: string;
  asset: MarketAsset;
  chain: MarketChain;
  action: SupplyAction;
  address: string;
}

export interface IcrcAccountSupplyTarget {
  type: "icrcAccount";
  poolId: string;
  asset: MarketAsset;
  chain: MarketChain;
  action: SupplyAction;
  owner: string;
  subaccount: Uint8Array;
  account: string;
}

export type SupplyTarget = NativeAddressSupplyTarget | IcrcAccountSupplyTarget;

export interface SupplyInstruction {
  poolId: string;
  asset: MarketAsset;
  chain: MarketChain;
  action: SupplyAction;
  target: SupplyTarget;
}
