import type {
  LiquidiumAccount,
  LiquidiumAccountInput,
} from "../../core/accounts";
import type { LiquidiumOperation, LiquidiumStatus } from "../../core/status";
import type {
  Asset,
  AssetIdentifier,
  Chain,
  OutflowType,
  SigningChain,
  SupplyAction,
} from "../../core/types";
import type {
  SignMessageWalletAction,
  WalletActionKind,
  WalletAdapter,
  WalletExecutionKind,
} from "../../core/wallet-actions";

/** Wallet execution dependencies for borrow and withdraw convenience methods. */
export interface WalletExecutionParams {
  /** Chain used by the signing wallet. */
  signerChain: SigningChain;
  /** Wallet adapter used to execute the prepared action. */
  signerWalletAdapter: WalletAdapter;
}

/** EVM transaction payload returned by lending transaction builders. */
export interface EvmContractTransaction {
  /** Contract address to call. */
  to: string;
  /** Hex-encoded calldata. */
  data: string;
  /** Native ETH value in wei, serialized as a decimal string. */
  value?: string;
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
  receiver: LiquidiumAccount;
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
  /** Chain where borrowed funds should arrive. */
  chain: Chain;
  /** Destination that receives the borrowed asset. */
  receiver: LiquidiumAccountInput;
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

/** Fields to build a withdraw request. `amount` is in the pool asset's base units. */
export interface CreateWithdrawRequest {
  /** Liquidium profile principal text. */
  profileId: string;
  /** Pool principal text to withdraw from. */
  poolId: string;
  /**
   * Amount to withdraw in the pool asset's base units. BTC withdrawals require
   * at least 5,000 sats, ETH requires at least 0.005 ETH, and USDC and USDT
   * require at least 1 token.
   */
  amount: bigint;
  /** Chain where withdrawn funds should arrive. */
  chain: Chain;
  /** Destination that receives the withdrawn asset. */
  receiver: LiquidiumAccountInput;
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

/** Supply destination returned by `lending.supply(...)`. */
export type SupplyTarget = AssetIdentifier & {
  /** Pool principal text receiving the inflow. */
  poolId: string;
  /** Deposit or repayment action for the inflow. */
  action: SupplyAction;
  /** Address to use for this chain and asset pair. */
  address: string;
  /** Legacy account identifier for ICP ledger transfers. */
  icpAccountIdentifier?: string;
};

interface BaseSupplyFlowRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  /** Transfer chain to use. Pass ICP for ck-ledger transfers. */
  chain: Chain;
}

/** Manual transfer-based `lending.supply` request. */
export interface ManualTransferSupplyFlowRequest extends BaseSupplyFlowRequest {
  /** Explicit transfer mechanism. Omit this field to use the same default. */
  mechanism?: typeof SupplyPlanType.transfer;
  /** Manual supply does not broadcast through a wallet adapter. */
  walletAdapter?: never;
  /** Manual supply does not accept a sender account. */
  account?: never;
  /** Manual supply does not accept an execution amount. */
  amount?: never;
}

/** Wallet-executed transfer-based `lending.supply` request. */
export interface WalletTransferSupplyFlowRequest extends BaseSupplyFlowRequest {
  /** Explicit transfer mechanism. Omit this field to use the same default. */
  mechanism?: typeof SupplyPlanType.transfer;
  /** Wallet adapter used to broadcast the transfer. */
  walletAdapter: Pick<
    WalletAdapter,
    "sendBtcTransaction" | "sendEthTransaction" | "sendIcrcTransfer"
  >;
  /** Sender wallet account. */
  account: string;
  /** Transfer amount in base units. Deposits enforce the asset product minimum. */
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
  /** Contract interaction is supported for native ETH, USDC, and USDT pools on Ethereum. */
  chain: typeof Chain.ETH;
  /** ETH wallet adapter used to deposit native ETH or approve and deposit ERC-20 assets. */
  walletAdapter: Pick<WalletAdapter, "sendEthTransaction">;
  /** Sender EVM wallet address. */
  account: string;
  /** Amount in token base units. Deposits enforce the asset product minimum. */
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
 * - If post-broadcast inflow registration fails after the SDK broadcasts the
 *   transaction, `txid` is still returned so callers can track the transaction.
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
  chain?: Extract<Chain, "BTC" | "ETH">;
}

/** Body for direct `lending.submitInflow`. */
export interface SubmitInflowRequest extends SubmitSupplyFlowInflowRequest {
  /** Deposit or repayment operation represented by the transaction. */
  operation: InflowOperation;
}

/** Acknowledgement from the SDK API after submitting an inflow hint. */
export interface SubmitInflowResponse {
  /** Transaction id accepted by the SDK API. */
  txid: string;
}

/** Chain and asset pair for estimating an inflow target fee. */
export type EstimateInflowFeeRequest = AssetIdentifier;

/** Request for a native ETH or ETH stablecoin deposit address. */
export interface GetDepositAddressRequest {
  /** Liquidium profile principal text. */
  profileId: string;
  /** Pool principal text receiving the inflow. */
  poolId: string;
  /** Native ETH or ETH stablecoin asset. */
  asset: typeof Asset.ETH | typeof Asset.USDC | typeof Asset.USDT;
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
