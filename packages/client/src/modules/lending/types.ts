import type {
  Asset,
  Chain,
  InflowSubmitType,
  MarketAsset,
  MarketChain,
  Outflowtype,
  SupplyAction,
} from "../../core/types";
import type {
  SignatureInfo,
  SignMessageWalletAction,
  WalletActionKind,
  WalletAdapter,
  WalletExecutionKind,
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
  kind: typeof WalletActionKind.createBorrow;
  executionKind: typeof WalletExecutionKind.signMessage;
  actionType: typeof WalletActionKind.createBorrow;
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
  kind: typeof WalletActionKind.createWithdraw;
  executionKind: typeof WalletExecutionKind.signMessage;
  actionType: typeof WalletActionKind.createWithdraw;
}

export const SupplyPlanType = {
  contractInteraction: "contractInteraction",
  transfer: "transfer",
} as const;
export type SupplyPlanType =
  (typeof SupplyPlanType)[keyof typeof SupplyPlanType];

/** Minimal input for `prepareSupply` (target resolution only). */
export interface SupplyRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
  mechanism?: SupplyPlanType;
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

interface BaseSupplyFlowRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
}

/**
 * Input for transfer-based `lending.supply`. Omitting wallet fields returns
 * instructions so the caller can broadcast manually and call `SupplyFlow.submit`.
 */
export interface TransferSupplyFlowRequest extends BaseSupplyFlowRequest {
  mechanism?: typeof SupplyPlanType.transfer;
  walletAdapter?: Pick<
    WalletAdapter,
    "sendBtcTransaction" | "sendEthTransaction"
  >;
  account?: string;
  amount?: bigint;
}

/** Input for contract-interaction `lending.supply`, which always executes now. */
export interface ContractInteractionSupplyFlowRequest
  extends BaseSupplyFlowRequest {
  mechanism: typeof SupplyPlanType.contractInteraction;
  walletAdapter: Pick<WalletAdapter, "sendEthTransaction">;
  account: string;
  amount: bigint;
}

export type SupplyFlowRequest =
  | TransferSupplyFlowRequest
  | ContractInteractionSupplyFlowRequest;

/**
 * Supply receipt returned by `lending.supply(...)`.
 *
 * - `txid` is populated when the SDK broadcast the transaction on your behalf
 *   (wallet-adapter path). When undefined, the caller is expected to broadcast
 *   themselves and register the txid via {@link SupplyFlow.submit}.
 * - `submit` registers a broadcast txid with the SDK API for faster indexing.
 *
 * The SDK does not poll inflow status. When you have a `txid`, it is your
 * responsibility to track confirmation state with your own polling.
 */
export interface SupplyFlow {
  type: SupplyPlanType;
  instruction: SupplyInstruction;
  target: SupplyTarget;
  txid?: string;
  submit(request: SubmitInflowRequest): Promise<SubmitInflowResponse>;
}

/** Body for `SupplyFlow.submit` / `lending.submitInflow`. */
export interface SubmitInflowRequest {
  txid: string;
  chain?: Chain;
  type?: InflowSubmitType;
}

export interface SubmitInflowResponse {
  success: true;
  txid: string;
}

export interface EstimateInflowFeeRequest {
  asset: Asset;
  chain: Chain;
}

export interface InflowFeeEstimate {
  totalFee: bigint;
}

export interface GetEvmSupplyContextRequest {
  profileId: string;
  poolId: string;
  walletAddress: string;
  amount: bigint;
  action: SupplyAction;
}

export const EvmSupplyApprovalStrategy = {
  approveMax: "approve-max",
  none: "none",
  resetThenApproveMax: "reset-then-approve-max",
} as const;
export type EvmSupplyApprovalStrategy =
  (typeof EvmSupplyApprovalStrategy)[keyof typeof EvmSupplyApprovalStrategy];

export interface EvmSupplyContext {
  success: true;
  profileId: string;
  poolId: string;
  walletAddress: string;
  action: SupplyAction;
  asset: typeof Asset.USDC | typeof Asset.USDT;
  chain: typeof Chain.ETH;
  amount: string;
  tokenAddress: string;
  spenderAddress: string;
  depositContractAddress: string;
  balance: string;
  allowance: string;
  requiresApproval: boolean;
  approvalStrategy: EvmSupplyApprovalStrategy;
}
