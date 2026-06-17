import type { LiquidiumOperation, LiquidiumStatus } from "../../core/status";
import type {
  Asset,
  Chain,
  MarketAsset,
  MarketChain,
  OutflowType,
  SupplyAction,
} from "../../core/types";
import type {
  SignatureInfo,
  SignMessageWalletAction,
  WalletActionKind,
  WalletAdapter,
  WalletExecutionKind,
} from "../../core/wallet-actions";

/** Wallet execution dependencies for borrow and withdraw convenience methods. */
export interface WalletExecutionParams {
  /** Chain used by the signing wallet. */
  signerChain: Chain;
  /** Wallet adapter used to execute the prepared action. */
  signerWalletAdapter: WalletAdapter;
}

/** EVM transaction payload returned by lending transaction builders. */
export interface EvmContractTransaction {
  /** Contract address to call. */
  to: string;
  /** Hex-encoded calldata. */
  data: string;
}

/** Parameters for an ERC-20 transfer transaction. */
export interface CreateTransferErc20TransactionParams {
  /** ERC-20 token contract address. */
  tokenAddress: string;
  /** Destination EVM address. */
  recipientAddress: string;
  /** Transfer amount in token base units. */
  amount: bigint;
}

/** Destination account for a completed outflow. */
export type OutflowReceiver =
  | NativeOutflowReceiver
  | ExternalOutflowReceiver
  | AccountIdentifierOutflowReceiver
  | IcrcOutflowReceiver;

/** IC principal destination for a completed outflow. */
export interface NativeOutflowReceiver {
  /** Destination account type reported by the protocol. */
  type: "Native";
  /** Destination principal. */
  account: string;
}

/** External-chain destination for a completed outflow. */
export interface ExternalOutflowReceiver {
  /** Destination account type reported by the protocol. */
  type: "External";
  /** External-chain destination address. */
  account: string;
}

/** Legacy ICP ledger account identifier destination for a completed outflow. */
export interface AccountIdentifierOutflowReceiver {
  /** Destination account type reported by the protocol. */
  type: "AccountIdentifier";
  /** ICP ledger account identifier text, displayed as the destination address. */
  account: string;
}

/** ICRC account destination for a completed outflow. */
export interface IcrcOutflowReceiver {
  /** Destination account type reported by the protocol. */
  type: "Icrc";
  /** ICRC account owner principal text. */
  owner: string;
  /** Optional ICRC subaccount bytes. */
  subaccount?: Uint8Array;
  /** Text-encoded ICRC account for display. */
  account: string;
}

/**
 * Receipt for a borrow or withdrawal outflow submitted to the lending canister.
 *
 * `id` is the outflow reference to show users immediately. `txid` may be unset until
 * the protocol assigns a chain transaction id. `outflowRef` is an optional protocol reference.
 */
export interface OutflowDetails {
  /** Protocol outflow id. */
  id: string;
  /** Borrow, withdrawal, or fee-claim discriminator. */
  outflowType: OutflowType;
  /** Optional protocol outflow reference. */
  outflowRef?: string;
  /** Chain transaction id when already assigned by the protocol. */
  txid?: string;
  /** Outflow amount in the pool asset's base units. */
  amount: bigint;
  /** Outflow destination account. */
  receiver: OutflowReceiver;
}

/** Borrow receipt. */
export type BorrowOutflowDetails = OutflowDetails & {
  outflowType: "borrow";
  /** Shared lifecycle status for the borrow outflow receipt. */
  status: LiquidiumStatus;
};

/** Withdraw receipt. */
export type WithdrawOutflowDetails = OutflowDetails & {
  outflowType: "withdrawal";
  /** Shared lifecycle status for the withdraw outflow receipt. */
  status: LiquidiumStatus;
};

/** Signature payload for submitting a prepared borrow action. */
export interface BorrowSubmitSignatureInfo extends SignatureInfo {}

/** Signature payload for submitting a prepared withdraw action. */
export interface WithdrawSubmitSignatureInfo extends SignatureInfo {}

/**
 * Fields to build a borrow request. `amount` is in the borrow pool asset's base units
 * (e.g. satoshis, token smallest units).
 */
export interface CreateBorrowRequest {
  /** Liquidium profile principal text. */
  profileId: string;
  /** Borrow pool principal text. */
  poolId: string;
  /** Amount to borrow in the borrow asset's base units. */
  amount: bigint;
  /** External-chain address that receives the borrowed asset. Must match the borrow pool chain. */
  receiverAddress: string;
  /** Wallet address that signs the borrow authorization. */
  signerWalletAddress: string;
}

/** Prepared borrow request data embedded in the signable action. */
export interface CreateBorrowData extends CreateBorrowRequest {
  /** Unix expiry timestamp in seconds, included in the signed message. */
  expiryTimestamp: bigint;
}

/** Prepared action for creating a borrow outflow. */
export interface BorrowAction
  extends SignMessageWalletAction<CreateBorrowData, BorrowOutflowDetails> {
  /** Protocol action kind. */
  kind: typeof WalletActionKind.createBorrow;
  /** Required wallet capability. */
  executionKind: typeof WalletExecutionKind.signMessage;
  /** Adapter-facing action type. */
  actionType: typeof WalletActionKind.createBorrow;
}

/**
 * Fields to build a withdraw request. `amount` is in the pool asset's base units.
 */
export interface CreateWithdrawRequest {
  /** Liquidium profile principal text. */
  profileId: string;
  /** Pool principal text to withdraw from. */
  poolId: string;
  /** Amount to withdraw in the pool asset's base units. */
  amount: bigint;
  /** External-chain address that receives the withdrawn asset. Must match the pool chain. */
  receiverAddress: string;
  /** Wallet address that signs the withdraw authorization. */
  signerWalletAddress: string;
}

/** Prepared withdraw request data embedded in the signable action. */
export interface CreateWithdrawData extends CreateWithdrawRequest {
  /** Unix expiry timestamp in seconds, included in the signed message. */
  expiryTimestamp: bigint;
}

/** Prepared action for creating a withdraw outflow. */
export interface WithdrawAction
  extends SignMessageWalletAction<CreateWithdrawData, WithdrawOutflowDetails> {
  /** Protocol action kind. */
  kind: typeof WalletActionKind.createWithdraw;
  /** Required wallet capability. */
  executionKind: typeof WalletExecutionKind.signMessage;
  /** Adapter-facing action type. */
  actionType: typeof WalletActionKind.createWithdraw;
}

/** Supply execution plan selected by the SDK. */
export const SupplyPlanType = {
  contractInteraction: "contractInteraction",
  transfer: "transfer",
} as const;
/** Supply execution plan selected by the SDK. */
export type SupplyPlanType =
  (typeof SupplyPlanType)[keyof typeof SupplyPlanType];

/** External-chain address target for manual or wallet-executed transfers. */
export interface NativeAddressSupplyTarget {
  /** Target discriminator. */
  type: "nativeAddress";
  /** Pool principal text receiving the inflow. */
  poolId: string;
  /** Asset expected by the target. */
  asset: MarketAsset;
  /** Chain where the target address is valid. */
  chain: MarketChain;
  /** Deposit or repayment action for the inflow. */
  action: SupplyAction;
  /** External-chain address where funds should be sent. */
  address: string;
}

/** ICRC account target for ck-asset or contract-interaction inflows. */
export interface IcrcAccountSupplyTarget {
  /** Target discriminator. */
  type: "icrcAccount";
  /** Pool principal text receiving the inflow. */
  poolId: string;
  /** Asset expected by the target. */
  asset: MarketAsset;
  /** Chain associated with the inflow. */
  chain: MarketChain;
  /** Deposit or repayment action for the inflow. */
  action: SupplyAction;
  /** ICRC account owner principal text. */
  owner: string;
  /** ICRC subaccount bytes. */
  subaccount: Uint8Array;
  /** Text-encoded ICRC account. */
  account: string;
}

/** Supply destination returned by `lending.supply(...)`. */
export type SupplyTarget = NativeAddressSupplyTarget | IcrcAccountSupplyTarget;

interface BaseSupplyFlowRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
}

/** Manual transfer-based `lending.supply` request. */
export interface ManualTransferSupplyFlowRequest extends BaseSupplyFlowRequest {
  /** Optional explicit transfer mechanism. */
  mechanism?: typeof SupplyPlanType.transfer;
  /** Disallowed for manual transfer flows. */
  walletAdapter?: never;
  /** Disallowed for manual transfer flows. */
  account?: never;
  /** Disallowed for manual transfer flows. */
  amount?: never;
}

/** Wallet-executed transfer-based `lending.supply` request. */
export interface WalletTransferSupplyFlowRequest extends BaseSupplyFlowRequest {
  /** Optional explicit transfer mechanism. */
  mechanism?: typeof SupplyPlanType.transfer;
  /** Wallet adapter used to broadcast the transfer. */
  walletAdapter: Pick<
    WalletAdapter,
    "sendBtcTransaction" | "sendEthTransaction"
  >;
  /** Sender wallet account. */
  account: string;
  /** Transfer amount in the target asset's base units. */
  amount: bigint;
}

/** Transfer-based supply request, either manual or wallet-executed. */
export type TransferSupplyFlowRequest =
  | ManualTransferSupplyFlowRequest
  | WalletTransferSupplyFlowRequest;

/** Input for contract-interaction `lending.supply`, which always executes now. */
export interface ContractInteractionSupplyFlowRequest
  extends BaseSupplyFlowRequest {
  /** Contract-interaction mechanism discriminator. */
  mechanism: typeof SupplyPlanType.contractInteraction;
  /** ETH wallet adapter used to approve and deposit ERC-20 assets. */
  walletAdapter: Pick<WalletAdapter, "sendEthTransaction">;
  /** Sender EVM wallet address. */
  account: string;
  /** Deposit or repayment amount in token base units. */
  amount: bigint;
}

/** Request accepted by `lending.supply(...)`. */
export type SupplyFlowRequest =
  | TransferSupplyFlowRequest
  | ContractInteractionSupplyFlowRequest;

/**
 * Supply receipt returned by `lending.supply(...)`.
 *
 * - `txid` is populated when the SDK broadcast the transaction on your behalf
 *   (wallet-adapter path). When undefined, the caller is expected to broadcast
 *   themselves and call {@link SupplyFlow.submit} for flows that require txid
 *   registration.
 * - `submit` registers a broadcast txid with the SDK API when needed. ETH
 *   stablecoin deposit-address transfers are indexed from ERC-20 transfer logs,
 *   so `submit` acknowledges the txid without posting it to the inflow endpoint.
 *
 * The SDK does not poll inflow status. When you have a `txid`, it is your
 * responsibility to track confirmation state with your own polling.
 */
export interface SupplyFlow {
  /** Execution plan used by the supply flow. */
  type: SupplyPlanType;
  /** Destination where funds should be sent or were sent. */
  target: SupplyTarget;
  /** Transaction id when the SDK broadcast the transaction. */
  txid?: string;
  /** Shared lifecycle status for the supply flow. */
  status: LiquidiumStatus;
  /** Registers a broadcast transaction id when the flow requires an indexing hint. */
  submit(request: SubmitSupplyFlowInflowRequest): Promise<SubmitInflowResponse>;
}

/** Canonical inflow operation accepted by direct inflow submission. */
export type InflowOperation = Extract<
  LiquidiumOperation,
  "deposit" | "repayment"
>;

/** Body for `SupplyFlow.submit`. The supply flow supplies the inflow operation. */
export interface SubmitSupplyFlowInflowRequest {
  /** Broadcast transaction id or hash. */
  txid: string;
  /** Chain where the transaction was broadcast, when not implied by the flow. */
  chain?: Chain;
}

/** Body for direct `lending.submitInflow`. */
export interface SubmitInflowRequest extends SubmitSupplyFlowInflowRequest {
  /** Deposit or repayment operation represented by the transaction. */
  operation: InflowOperation;
}

/** Acknowledgement from the SDK API after submitting an inflow hint. */
export interface SubmitInflowResponse {
  /** Indicates the submit request was accepted by the SDK API. */
  success: true;
  /** Transaction id accepted by the SDK API. */
  txid: string;
  /** Shared lifecycle status for the submitted inflow. */
  status: LiquidiumStatus;
}

/** Request for estimating the fee needed for an inflow target. */
export interface EstimateInflowFeeRequest {
  /** Asset to estimate for. */
  asset: Asset;
  /** Chain to estimate for. */
  chain: Chain;
}

/** Request for an ETH stablecoin deposit address. */
export interface GetDepositAddressRequest {
  /** Liquidium profile principal text. */
  profileId: string;
  /** Pool principal text receiving the inflow. */
  poolId: string;
  /** ETH stablecoin asset. */
  asset: string;
  /** Deposit or repayment action for the inflow. */
  action: SupplyAction;
}

/** Fee estimate for an inflow target, rounded up to the asset's fee unit. */
export interface InflowFeeEstimate {
  /** Estimated total fee rounded up in the asset's base units. */
  totalFee: bigint;
}

/** Request for ERC-20 approval and deposit planning. */
export interface GetEvmSupplyContextRequest {
  /** Liquidium profile principal text. */
  profileId: string;
  /** Pool principal text receiving the inflow. */
  poolId: string;
  /** EVM wallet address that will send funds. */
  walletAddress: string;
  /** Supply amount in token base units. */
  amount: bigint;
  /** Deposit or repayment action for the inflow. */
  action: SupplyAction;
}

/** Approval strategy required before an ERC-20 deposit contract call. */
export const EvmSupplyApprovalStrategy = {
  approveMax: "approve-max",
  none: "none",
  resetThenApproveMax: "reset-then-approve-max",
} as const;
/** Approval strategy required before an ERC-20 deposit contract call. */
export type EvmSupplyApprovalStrategy =
  (typeof EvmSupplyApprovalStrategy)[keyof typeof EvmSupplyApprovalStrategy];

/** ERC-20 supply planning data returned by `lending.getEvmSupplyContext(...)`. */
export interface EvmSupplyContext {
  /** Indicates the context was computed successfully. */
  success: true;
  /** Liquidium profile principal text. */
  profileId: string;
  /** Pool principal text receiving the inflow. */
  poolId: string;
  /** Normalized EVM wallet address. */
  walletAddress: string;
  /** Deposit or repayment action for the inflow. */
  action: SupplyAction;
  /** Supported ETH stablecoin asset. */
  asset: typeof Asset.USDC | typeof Asset.USDT;
  /** ETH chain discriminator. */
  chain: typeof Chain.ETH;
  /** Requested amount serialized in token base units. */
  amount: string;
  /** ERC-20 token contract address. */
  tokenAddress: string;
  /** Contract address that must be approved as spender. */
  spenderAddress: string;
  /** Deposit helper contract address. */
  depositContractAddress: string;
  /** Current token balance serialized in base units. */
  balance: string;
  /** Current allowance serialized in base units. */
  allowance: string;
  /** Whether an approval transaction is needed before deposit. */
  requiresApproval: boolean;
  /** Approval sequence the caller should perform. */
  approvalStrategy: EvmSupplyApprovalStrategy;
}
