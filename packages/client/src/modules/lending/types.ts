import type {
  MarketAsset,
  MarketChain,
  Outflowtype,
  SupplyAction,
} from "../../core/types";
import type {
  SignatureInfo,
  SignMessageWalletAction,
  WalletAdapter,
} from "../../core/wallet-actions";

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

export interface BorrowSubmitSignatureInfo extends SignatureInfo {}

export interface WithdrawSubmitSignatureInfo extends SignatureInfo {}

export interface CreateBorrowRequest {
  profileId: string;
  poolId: string;
  amount: bigint;
  receiverAddress: string;
  signerWalletAddress: string;
}

export interface CreateBorrowData extends CreateBorrowRequest {
  expiryTimestamp: bigint;
}

export interface BorrowAction
  extends SignMessageWalletAction<CreateBorrowData, OutflowDetails> {
  kind: "create-borrow";
  executionKind: "sign-message";
  actionType: "create-borrow";
}

export interface CreateWithdrawRequest {
  profileId: string;
  poolId: string;
  amount: bigint;
  receiverAddress: string;
  signerWalletAddress: string;
}

export interface CreateWithdrawData extends CreateWithdrawRequest {
  expiryTimestamp: bigint;
}

export interface WithdrawAction
  extends SignMessageWalletAction<CreateWithdrawData, OutflowDetails> {
  kind: "create-withdraw";
  executionKind: "sign-message";
  actionType: "create-withdraw";
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

export interface SupplyFlowRequest extends SupplyRequest {
  btcWalletAdapter?: Pick<WalletAdapter, "sendBtcTransaction">;
  btcAccount?: string;
  btcAmountSats?: bigint;
}

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
  submit(request: SubmitInflowRequest): Promise<SubmitInflowResponse>;
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
