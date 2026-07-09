import type {
  LiquidiumAccount,
  LiquidiumAccountInput,
} from "../../core/accounts";
import type { LiquidiumStatus } from "../../core/status";
import type { Asset, Chain, MarketAsset, MarketChain } from "../../core/types";
import type { SupplyTarget } from "../lending";

/** Asset symbols supported by the instant-loans canister. */
export type InstantLoanAsset = Asset;

/** Delivery-chain selection for instant-loan creation. */
export interface InstantLoanDeliveryChainOptions {
  /** Delivery chain used for the borrowed asset. Use ICP for ck-ledger delivery. */
  borrowChain: Chain;
  /** Delivery chain used for collateral refunds and withdrawals. Use ICP for ck-ledger delivery. */
  refundChain: Chain;
}

/** Delivery-chain selection for instant-loan creation. */
export type InstantLoanOutflowChainOptions = InstantLoanDeliveryChainOptions;

/** Collateral leg used when creating an instant loan. */
export interface CreateInstantLoanCollateral {
  /**
   * Principal text of the pool that receives the user's collateral deposit.
   *
   * This should be the `id` of the collateral `Pool` selected from
   * `client.market.listPools()`. The pool asset must match `asset`.
   */
  poolId: string;
  /**
   * Asset the user will deposit as collateral.
   *
   * Must match the asset for `poolId`; for example, use `"BTC"` with a BTC
   * collateral pool.
   */
  asset: InstantLoanAsset;
  /**
   * Intended credited collateral amount, in base units.
   *
   * This is used to validate LTV and initialize the loan record before
   * deposit/inflow fees are deducted. For BTC, pass satoshis. For token assets,
   * convert the UI amount using the selected pool's `decimals` value. After
   * creation, use one of `loan.initialDeposit.targets` as the fee-inclusive
   * transfer quote and destination.
   */
  amount: bigint;
}

/** Borrow leg used when creating an instant loan. */
export interface CreateInstantLoanBorrow {
  /**
   * Principal text of the pool that funds the borrow.
   *
   * This should be the `id` of the borrow `Pool` selected from
   * `client.market.listPools()`. The pool asset must match `asset`.
   */
  poolId: string;
  /**
   * Asset the user wants to borrow from the borrow pool.
   *
   * Must match the asset for `poolId`; for example, use `"USDC"` with a USDC
   * borrow pool.
   */
  asset: InstantLoanAsset;
  /**
   * Amount to borrow, in the borrow asset's base units.
   *
   * For USDC/USDT, convert the UI amount using the selected borrow pool's
   * `decimals` value before passing it here.
   */
  amount: bigint;
  /** Delivery chain used for the borrowed asset. Use ICP for ck-ledger delivery. */
  chain: Chain;
  /**
   * Destination that receives the borrowed asset after the loan starts.
   *
   * Pass either a string shorthand or a typed destination. For BTC/ETH chain
   * outflows this is usually the user's chain address. For ICP or ck outflows,
   * use `IcPrincipal`, `IcpAccountIdentifier`, or `IcrcAccount` destinations.
   */
  destination: InstantLoanDestination;
}

/** Refund leg used when creating an instant loan. */
export interface CreateInstantLoanRefund {
  /** Delivery chain used for collateral refunds and withdrawals. Use ICP for ck-ledger delivery. */
  chain: Chain;
  /**
   * Destination that receives collateral refunds or withdrawals.
   *
   * Pass either a string shorthand or a typed destination. For BTC/ETH chain
   * outflows this is usually the user's chain address. For ICP or ck outflows,
   * use `IcPrincipal`, `IcpAccountIdentifier`, or `IcrcAccount` destinations.
   */
  destination: InstantLoanDestination;
}

/**
 * Borrow destination or refund account associated with an instant loan.
 *
 * @example
 * ```ts
 * const icPrincipalAccount: InstantLoanAccount = {
 *   type: "IcPrincipal",
 *   principal: "aaaaa-aa",
 * };
 *
 * const chainAddressAccount: InstantLoanAccount = {
 *   type: "ChainAddress",
 *   address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
 * };
 *
 * const accountIdentifierAccount: InstantLoanAccount = {
 *   type: "IcpAccountIdentifier",
 *   accountIdentifier: "e2134f3f176b1429df3f92807b8f0f26a520debc313b2d6ad86a4a2e7f3d8f8d",
 * };
 *
 * const icrcAccount: InstantLoanAccount = {
 *   type: "IcrcAccount",
 *   owner: "aaaaa-aa",
 *   address: "aaaaa-aa",
 * };
 * ```
 */
export type InstantLoanAccount = LiquidiumAccount;

/** Destination accepted when creating an instant loan. */
export type InstantLoanDestination = LiquidiumAccountInput;

/**
 * Parameters for creating an accountless instant loan.
 *
 * Use market data from `client.market.listPools()` to choose the two pool ids,
 * and use `client.quote.calculateLtv(...)` before creation to validate the
 * amount pair and choose `ltvMaxBps`.
 *
 * Amount fields are in each asset's smallest/base units. For example, BTC uses
 * satoshis and ERC-20 assets use token base units according to the selected
 * pool decimals.
 */
export interface CreateInstantLoanRequest {
  /** Collateral leg: pool, asset, and amount the user deposits. */
  collateral: CreateInstantLoanCollateral;
  /** Borrow leg: pool, asset, amount, delivery chain, and destination. */
  borrow: CreateInstantLoanBorrow;
  /** Refund leg: chain and destination for returned collateral. */
  refund: CreateInstantLoanRefund;
  /**
   * Maximum allowed loan-to-value ratio in basis points.
   *
   * `6_000n` means 60%. Use `client.quote.calculateLtv(...)` to calculate the
   * implied LTV for the selected amounts and pass the policy value your app is
   * willing to accept. Creation is rejected if the requested borrow would exceed
   * this limit.
   */
  ltvMaxBps: bigint;
  /**
   * Seconds allowed for the user to send collateral after loan creation.
   *
   * If the collateral deposit is not detected before this window expires, the
   * instant-loan flow can time out. Internally this is sent to the canister as
   * `ltv_timer_s`.
   */
  depositWindowSeconds: bigint;
}

/** Lookup request for loading an instant loan by numeric canister id. */
export interface InstantLoanGetByIdRequest {
  /** Canister-assigned loan id. */
  loanId: bigint;
}

/** Lookup request for loading an instant loan by short user-facing reference. */
export interface InstantLoanGetByRefRequest {
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
}

/** Lookup request for loading canonical instant-loan state. */
export type InstantLoanGetRequest =
  | InstantLoanGetByIdRequest
  | InstantLoanGetByRefRequest;

/** Collateral leg returned by instant-loan search. */
export interface InstantLoanFindCollateral {
  /** Principal text of the collateral pool. */
  poolId: string;
  /** Asset the user deposits as collateral. */
  asset: InstantLoanAsset;
  /** Intended credited collateral amount in base units, before inflow fees. */
  amount: bigint;
}

/** Borrow leg returned by instant-loan search. */
export interface InstantLoanFindBorrow {
  /** Principal text of the borrow pool. */
  poolId: string;
  /** Asset the user borrows. */
  asset: InstantLoanAsset;
}

/** Lightweight search result for an instant loan match. */
export interface InstantLoanFindResult {
  /** Canister-assigned loan id. Use this with `client.instantLoans.get({ loanId })` to load full loan state. */
  loanId: bigint;
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
  /** Unix creation timestamp in seconds. */
  createdAt: bigint;
  /** Collateral-side pool, asset, and requested credited amount. */
  collateral: InstantLoanFindCollateral;
  /** Borrow-side pool and asset. */
  borrow: InstantLoanFindBorrow;
  /** Generated profile principal from the search index. */
  profileId: string;
}

/** Page request for direct instant-loan canister event queries. */
export interface InstantLoanListEventsRequest {
  /** Event id to start from. */
  start: bigint;
  /** Maximum number of events to return. */
  limit: bigint;
}

/** Active instant-loans canister config. */
export interface InstantLoanConfig {
  /** Principal text of the lending canister used by instant loans. */
  lendingCanisterId: string;
}

/** Authentication metadata for warmed instant-loan profiles. */
export interface InstantLoanAuthorization {
  type: "EthSignature";
  derivationIndex: Uint8Array;
  publicKey: Uint8Array;
  address: string;
}

/** Warmed profile available for a future instant loan. */
export interface InstantLoanWarmedProfile {
  id: bigint;
  authorization: InstantLoanAuthorization;
  /** Unix creation timestamp in seconds. */
  createdAt: bigint;
  profileId: string;
}

/** Direct canister event returned by the instant-loans query API. */
export interface InstantLoanEvent {
  id: bigint;
  schemaVersion: number;
  /** Unix event timestamp in seconds. */
  timestamp: bigint;
  eventType: InstantLoanEventType;
}

/** Instant-loan leg used when stuck funds are withdrawn. */
export type InstantLoanLeg = "Lend" | "Borrow";

/** Loan-created instant-loan event payload. */
export interface InstantLoanCreatedEventType {
  type: "LoanCreated";
  loanId: bigint;
  borrowDestination: InstantLoanAccount;
  collateralAsset: InstantLoanAsset;
  borrowAmount: bigint;
  collateralPoolId: string;
  refundDestination: InstantLoanAccount;
  ltvMaxBps: bigint;
  depositWindowSeconds: bigint;
  profileId: string;
  borrowPoolId: string;
  borrowAsset: InstantLoanAsset;
}

/** Full collateral withdrawal request event payload. */
export interface InstantLoanFullLendWithdrawalRequestedEventType {
  type: "FullLendWithdrawalRequested";
  loanId: bigint;
  account: InstantLoanAccount;
  poolId: string;
}

/** Borrow request event payload. */
export interface InstantLoanBorrowRequestedEventType {
  type: "BorrowRequested";
  loanId: bigint;
  account: InstantLoanAccount;
  poolId: string;
  amount: bigint;
}

/** Deposit timer exceeded event payload. */
export interface InstantLoanDepositTimerExceededEventType {
  type: "DepositTimerExceeded";
  loanId: bigint;
}

/** Stuck funds withdrawal request event payload. */
export interface InstantLoanStuckFundsWithdrawalRequestedEventType {
  type: "StuckFundsWithdrawalRequested";
  leg: InstantLoanLeg;
  loanId: bigint;
  account: InstantLoanAccount;
  poolId: string;
  amount: bigint;
}

/** Profile-warmed event payload. */
export interface InstantLoanProfileWarmedEventType {
  type: "ProfileWarmed";
  derivationIndex: Uint8Array;
  warmedProfileId: bigint;
  ethAddress: string;
  profileId: string;
}

/** Repay-complete event payload. */
export interface InstantLoanRepayCompleteEventType {
  type: "RepayComplete";
  loanId: bigint;
  profileId: string;
}

/** Deposit timer started event payload. */
export interface InstantLoanDepositTimerStartedEventType {
  type: "DepositTimerStarted";
  loanId: bigint;
  /** Unix timestamp in seconds when the deposit timer started. */
  timestamp: bigint;
}

/** Direct canister event payload returned by instant-loans event queries. */
export type InstantLoanEventType =
  | InstantLoanCreatedEventType
  | InstantLoanFullLendWithdrawalRequestedEventType
  | InstantLoanBorrowRequestedEventType
  | InstantLoanDepositTimerExceededEventType
  | InstantLoanStuckFundsWithdrawalRequestedEventType
  | InstantLoanProfileWarmedEventType
  | InstantLoanRepayCompleteEventType
  | InstantLoanDepositTimerStartedEventType;

/** Inflow target options returned for a generated transfer quote. */
export interface InstantLoanInflowTargetQuotes<TTargetQuote> {
  /** Target for the selected pool's own chain, such as BTC for BTC pools or ETH for ETH pools. */
  poolChain: TTargetQuote;
  /** ICP ledger/ICRC target when a ck-ledger transfer rail is distinct from the pool chain. */
  icp?: TTargetQuote;
}

/** Fee-inclusive collateral deposit quote for one transfer target. */
export interface InstantLoanInitialDepositTargetQuote {
  /** Full amount to send to the collateral deposit target, including fee. */
  amount: bigint;
  /** Chain used for the collateral deposit. */
  chain: MarketChain;
  /** Inflow fee amount in base units added to the transfer amount. */
  inflowFeeAmount: bigint;
  /** Address or ICRC account where the collateral should be sent. */
  target: SupplyTarget;
}

/** Fee-inclusive repayment quote for one transfer target. */
export interface InstantLoanRepaymentTargetQuote {
  /** Full amount to send to the repayment target, including fee and interest buffer. */
  amount: bigint;
  /** Chain used for repayment. */
  chain: MarketChain;
  /** Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable. */
  inflowFeeAmount: bigint;
  /** Whether `inflowFeeAmount` came from a live fee estimate. */
  inflowFeeEstimateAvailable: boolean;
  /** Address or ICRC account where the repayment should be sent. */
  target: SupplyTarget;
}

/** Current amount to send to a repayment target to close the debt. */
export interface InstantLoanRepayment {
  /** Decimal scale for `amount`. */
  decimals: bigint;
  /** Current debt in base units, before fee and interest buffer. */
  debtAmount: bigint;
  /** Additional interest buffer in base units. */
  interestBufferAmount: bigint;
  /** Seconds of interest accrual included in `interestBufferAmount`. */
  interestBufferSeconds: bigint;
  /** Asset to repay. */
  asset: MarketAsset;
  /** Available repayment targets keyed by transfer rail. */
  targets: InstantLoanInflowTargetQuotes<InstantLoanRepaymentTargetQuote>;
}

/** Initial collateral deposit quote returned when an instant loan is created. */
export interface InstantLoanInitialDeposit {
  /** Decimal scale for `amount`, `collateralAmount`, and `inflowFeeAmount`. */
  decimals: bigint;
  /** Intended credited collateral amount in base units, before inflow fees. */
  collateralAmount: bigint;
  /** Collateral asset to deposit. */
  asset: MarketAsset;
  /** Available collateral deposit targets keyed by transfer rail. */
  targets: InstantLoanInflowTargetQuotes<InstantLoanInitialDepositTargetQuote>;
  /** Unix timestamp in seconds when the collateral deposit was detected, or null before detection. */
  detectedTimestamp: bigint | null;
  /** Unix timestamp in seconds when the collateral deposit window expires, or null before detection when unavailable. */
  expiryTimestamp: bigint | null;
}

/** Current lending position backing the instant loan. */
export interface InstantLoanPositionSummary {
  /** Current collateral amount in the collateral asset's base units. */
  collateralAmount: bigint;
  /** Decimal scale for `collateralAmount`. */
  collateralDecimals: bigint;
  /** Earned interest on the collateral side in base units. */
  collateralInterestAmount: bigint;
  /** Borrowed principal in the borrow asset's base units. */
  borrowedAmount: bigint;
  /** Decimal scale for borrowed/debt amounts. */
  borrowedDecimals: bigint;
  /** Accrued borrow interest in base units. */
  debtInterestAmount: bigint;
  /** Borrowed principal plus accrued interest in base units, before repayment buffer. */
  totalDebtAmount: bigint;
}

/** Immutable terms selected for an instant loan. */
export interface InstantLoanTerms {
  /** Maximum loan-to-value ratio in basis points. */
  ltvMaxBps: bigint;
  /** Seconds allowed for the collateral deposit before timeout. */
  depositWindowSeconds: bigint;
}

/** Collateral leg selected for an instant loan. */
export interface InstantLoanCollateral {
  /** Principal text of the collateral pool. */
  poolId: string;
  /** Collateral asset symbol. */
  asset: MarketAsset;
  /** Chain used for collateral deposits. */
  chain: MarketChain;
  /** Decimal scale for collateral amounts. */
  decimals: bigint;
  /** Intended credited collateral amount in base units, before inflow fees. */
  amount: bigint;
}

/** Borrow leg selected for an instant loan. */
export interface InstantLoanBorrow {
  /** Principal text of the borrow pool. */
  poolId: string;
  /** Borrow asset symbol. */
  asset: MarketAsset;
  /** Chain where borrowed funds are delivered. */
  chain: MarketChain;
  /** Decimal scale for borrow and debt amounts. */
  decimals: bigint;
  /** Requested borrow amount in base units. */
  amount: bigint;
  /** Destination that receives the borrowed asset. */
  destination: InstantLoanAccount;
}

/** Hydrated instant-loan state plus generated quote targets. */
export interface InstantLoan {
  /** Canister-assigned loan id. */
  loanId: bigint;
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
  /** Shared lifecycle status for display and flow control. */
  status: LiquidiumStatus;
  /** Generated profile principal used by the instant loan. */
  profileId: string;
  /** Immutable loan terms. */
  terms: InstantLoanTerms;
  /** Collateral-side pool, asset, chain, decimals, and requested credited amount. */
  collateral: InstantLoanCollateral;
  /** Borrow-side pool, asset, chain, decimals, requested amount, and destination. */
  borrow: InstantLoanBorrow;
  /** Destination used for collateral refunds or withdrawals. */
  refundDestination: InstantLoanAccount;
  /** Current actionable initial collateral deposit quote. */
  initialDeposit: InstantLoanInitialDeposit;
  /** Current repayment quote. Amount fields are zero when the loan has no debt. */
  repayment: InstantLoanRepayment;
  /** Current lending position state for the generated profile. */
  position: InstantLoanPositionSummary;
}
