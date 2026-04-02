import type {
  MarketAsset,
  MarketChain,
  Outflowtype,
  SupplyAction,
} from "../../core/types";

export interface OutflowReceiver {
  type: "Native" | "External";
  account: string;
}

export interface OutflowDetails {
  id: string;
  outflowType: Outflowtype;
  outflowRef?: string;
  txid?: string;
  amount: bigint;
  receiver: OutflowReceiver;
}

export interface BorrowSubmitSignatureInfo {
  signature: string;
  chain: "BTC" | "ETH";
}

export interface WithdrawSubmitSignatureInfo {
  signature: string;
  chain: "BTC" | "ETH";
}

export interface CreateBorrowRequest {
  profileId: string;
  poolId: string;
  amount: bigint;
  account: string;
  signerAccount: string;
}

export interface CreateBorrowData extends CreateBorrowRequest {
  expiryTimestamp: bigint;
}

export interface BorrowAction {
  kind: "create-borrow";
  account: string;
  message: string;
  data: CreateBorrowData;
  submit(signatureInfo: BorrowSubmitSignatureInfo): Promise<OutflowDetails>;
}

export interface CreateWithdrawRequest {
  profileId: string;
  poolId: string;
  amount: bigint;
  account: string;
  signerAccount: string;
}

export interface CreateWithdrawData extends CreateWithdrawRequest {
  expiryTimestamp: bigint;
}

export interface WithdrawAction {
  kind: "create-withdraw";
  account: string;
  message: string;
  data: CreateWithdrawData;
  submit(signatureInfo: WithdrawSubmitSignatureInfo): Promise<OutflowDetails>;
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

export interface SupplyFlowRequest extends SupplyRequest {}

export interface GetSupplyStatusRequest {
  txid?: string;
}

export interface WatchSupplyStatusOptions {
  txid?: string;
  signal?: AbortSignal;
  pollIntervalMs?: number;
}

export interface SupplyTrackingStatus {
  txid: string;
  inflowId: string;
  poolId: string;
  type: "deposit" | "repayment";
  stage: "LOGGED" | "CONFIRMED" | "PENDING" | "FINALISING";
  amountSats: string;
  timestampMs: number;
  confirmations: number | null;
  requiredConfirmations: number;
  remainingConfirmations: number | null;
  isDetected: boolean;
  isAvailable: boolean;
  estimatedMsUntilAvailable: number | null;
  expectedAvailableAtMs: number | null;
}

export interface SupplyFlow {
  instruction: SupplyInstruction;
  target: SupplyTarget;
  submit(request: { txid: string }): Promise<SubmitInflowResponse>;
  getStatus(
    request?: GetSupplyStatusRequest
  ): Promise<SupplyTrackingStatus | null>;
  watchStatus(
    options?: WatchSupplyStatusOptions
  ): AsyncGenerator<SupplyTrackingStatus, void, void>;
}

export interface SubmitInflowRequest {
  txid: string;
}

export interface SubmitInflowResponse {
  success: true;
  txid: string;
}

export interface GetInflowStatusRequest {
  profileId: string;
  txid?: string;
}

export interface InflowStatusItem {
  inflowId: string;
  txid: string;
  type: "deposit" | "repayment";
  stage: "LOGGED" | "CONFIRMED" | "PENDING" | "FINALISING";
  poolId: string;
  amountSats: string;
  timestampMs: number;
  confirmations: number | null;
  requiredConfirmations: number;
}

export interface GetInflowStatusResponse {
  success: true;
  inflows: InflowStatusItem[];
}
