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

/**
 * Receipt for a borrow or withdraw submitted to the lending canister.
 *
 * `id` is the outflow reference to show users immediately. `txid` may be unset until
 * the protocol assigns a chain transaction id. `outflowRef` is an optional protocol reference.
 */
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

/**
 * Fields to build a borrow request. `amount` is in the borrow pool asset's base units
 * (e.g. satoshis, token smallest units).
 */
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

/**
 * Fields to build a withdraw request. `amount` is in the pool asset's base units.
 */
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

/** Minimal input for `prepareSupply` (target resolution only). */
export interface SupplyRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
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

/**
 * Input for `lending.supply`. Optional `walletAdapter`, `account`, and `amount` enable
 * automatic broadcast when the resolved mechanism supports it.
 */
export interface SupplyFlowRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  walletAdapter?: Pick<
    WalletAdapter,
    "sendBtcTransaction" | "sendEthTransaction"
  >;
  account?: string;
  amount?: bigint;
}

/** Optional filter for `SupplyFlow.getStatus`. */
export interface GetSupplyStatusRequest {
  txid?: string;
}

/** Options for `SupplyFlow.watchStatus` polling. */
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

export type SupplyPlanType = "transfer" | "contractInteraction";

/**
 * Unified supply result: manual or wallet-automated, with tracking helpers.
 *
 * - `submit` — register a broadcast txid with the SDK API (also used internally after auto-send).
 * - `getStatus` / `watchStatus` — poll inflow status (requires client `apiBaseUrl`).
 */
export interface SupplyFlow {
  type: SupplyPlanType;
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

/** Body for `SupplyFlow.submit` / `lending.submitInflow`. */
export interface SubmitInflowRequest {
  txid: string;
  chain?: "BTC" | "ETH";
  type?: "DEPOSIT" | "REPAY";
}

export interface SubmitInflowResponse {
  success: true;
  txid: string;
}

export interface GetEvmSupplyContextRequest {
  profileId: string;
  poolId: string;
  walletAddress: string;
  amount: bigint;
  action: SupplyAction;
}

export type EvmSupplyApprovalStrategy =
  | "none"
  | "approve-max"
  | "reset-then-approve-max";

export interface EvmSupplyContext {
  success: true;
  profileId: string;
  poolId: string;
  walletAddress: string;
  action: SupplyAction;
  asset: "USDC" | "USDT";
  chain: "ETH";
  amount: string;
  tokenAddress: string;
  spenderAddress: string;
  depositContractAddress: string;
  balance: string;
  allowance: string;
  requiresApproval: boolean;
  approvalStrategy: EvmSupplyApprovalStrategy;
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
