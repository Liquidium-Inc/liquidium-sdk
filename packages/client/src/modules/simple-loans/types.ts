import type {
  LiquidiumAccount,
  LiquidiumAccountInput,
} from "../../core/accounts";
import type { LiquidiumStatus } from "../../core/status";
import type { AssetIdentifier, Chain } from "../../core/types";
import type { SupplyTarget } from "../lending";

/** Asset symbols supported by the Simple Loans canister. */
export type SimpleLoanAsset = AssetIdentifier["asset"];

/** Collateral leg used when creating a simple loan. */
export interface CreateSimpleLoanCollateral {
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
  asset: SimpleLoanAsset;
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

/**
 * Borrow leg used when creating a simple loan.
 *
 * `chain` and `asset` form the canonical asset identifier. For example,
 * `{ chain: "ICP", asset: "USDT" }` means ckUSDT.
 */
export type CreateSimpleLoanBorrow = AssetIdentifier & {
  /**
   * Principal text of the pool that funds the borrow.
   *
   * This should be the `id` of the borrow `Pool` selected from
   * `client.market.listPools()`. The pool asset must match `asset`.
   */
  poolId: string;
  /**
   * Amount to borrow, in the borrow asset's base units.
   *
   * For USDC/USDT, convert the UI amount using the selected borrow pool's
   * `decimals` value before passing it here.
   */
  amount: bigint;
  /**
   * Destination that receives the borrowed asset after the loan starts.
   *
   * Pass either a string shorthand or a typed destination. For BTC/ETH chain
   * outflows this is usually the user's chain address. Chain-key assets on ICP
   * require an `IcPrincipal`; native ICP also accepts `IcpAccountIdentifier`
   * and `IcrcAccount` destinations.
   */
  destination: SimpleLoanDestination;
};

/** Refund leg used when creating a simple loan. */
export interface CreateSimpleLoanRefund {
  /** Delivery chain used for collateral refunds and withdrawals. Use ICP for ck-ledger delivery. */
  chain: Chain;
  /**
   * Destination that receives collateral refunds or withdrawals.
   *
   * Pass either a string shorthand or a typed destination. For BTC/ETH chain
   * outflows this is usually the user's chain address. Chain-key assets on ICP
   * require an `IcPrincipal`; native ICP also accepts `IcpAccountIdentifier`
   * and `IcrcAccount` destinations.
   */
  destination: SimpleLoanDestination;
}

/**
 * Borrow destination or refund account associated with a simple loan.
 *
 * @example
 * ```ts
 * const icPrincipalAccount: SimpleLoanAccount = {
 *   type: "IcPrincipal",
 *   address: "aaaaa-aa",
 * };
 *
 * const chainAddressAccount: SimpleLoanAccount = {
 *   type: "ChainAddress",
 *   address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
 * };
 *
 * const accountIdentifierAccount: SimpleLoanAccount = {
 *   type: "IcpAccountIdentifier",
 *   address: "e2134f3f176b1429df3f92807b8f0f26a520debc313b2d6ad86a4a2e7f3d8f8d",
 * };
 *
 * const icrcAccount: SimpleLoanAccount = {
 *   type: "IcrcAccount",
 *   owner: "aaaaa-aa",
 *   address: "aaaaa-aa",
 * };
 * ```
 */
export type SimpleLoanAccount = LiquidiumAccount;

/** Destination accepted when creating a simple loan. */
export type SimpleLoanDestination = LiquidiumAccountInput;

/**
 * Parameters for creating an accountless simple loan.
 *
 * Use market data from `client.market.listPools()` to choose the two pool ids,
 * and use `client.quote.calculateLtv(...)` before creation to validate the
 * amount pair and choose `ltvMaxBps`.
 *
 * Amount fields are in each asset's smallest/base units. For example, BTC uses
 * satoshis and ERC-20 assets use token base units according to the selected
 * pool decimals.
 */
export interface CreateSimpleLoanRequest {
  /** Collateral leg: pool, asset, and amount the user deposits. */
  collateral: CreateSimpleLoanCollateral;
  /** Borrow leg: pool, asset, amount, delivery chain, and destination. */
  borrow: CreateSimpleLoanBorrow;
  /** Refund leg: chain and destination for returned collateral. */
  refund: CreateSimpleLoanRefund;
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
   * simple loan flow can time out. Internally this is sent to the canister as
   * `ltv_timer_s`.
   */
  depositWindowSeconds: bigint;
}

/** Lookup request for loading a simple loan by numeric canister id. */
export interface SimpleLoanGetByIdRequest {
  /** Canister-assigned loan id. */
  loanId: bigint;
}

/** Lookup request for loading a simple loan by short user-facing reference. */
export interface SimpleLoanGetByRefRequest {
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
}

/** Lookup request for loading canonical simple loan state. */
export type SimpleLoanGetRequest =
  | SimpleLoanGetByIdRequest
  | SimpleLoanGetByRefRequest;

/** Collateral leg returned by Simple Loans search. */
export interface SimpleLoanFindCollateral {
  /** Principal text of the collateral pool. */
  poolId: string;
  /** Asset the user deposits as collateral. */
  asset: SimpleLoanAsset;
  /** Intended credited collateral amount in base units, before inflow fees. */
  amount: bigint;
}

/** Borrow leg returned by Simple Loans search. */
export interface SimpleLoanFindBorrow {
  /** Principal text of the borrow pool. */
  poolId: string;
  /** Asset the user borrows. */
  asset: SimpleLoanAsset;
}

/** Lightweight search result for a simple loan match. */
export interface SimpleLoanFindResult {
  /** Canister-assigned loan id. Use this with `client.simpleLoans.get({ loanId })` to load full loan state. */
  loanId: bigint;
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
  /** Unix creation timestamp in seconds. */
  createdAt: bigint;
  /** Collateral-side pool, asset, and requested credited amount. */
  collateral: SimpleLoanFindCollateral;
  /** Borrow-side pool and asset. */
  borrow: SimpleLoanFindBorrow;
  /** Generated profile principal from the search index. */
  profileId: string;
}

/** Page request for direct Simple Loans canister event queries. */
export interface SimpleLoanListEventsRequest {
  /** Event id to start from. */
  start: bigint;
  /** Maximum number of events to return. */
  limit: bigint;
}

/** Active Simple Loans canister config. */
export interface SimpleLoanConfig {
  /** Principal text of the lending canister used by Simple Loans. */
  lendingCanisterId: string;
}

/** Authentication metadata for warmed Simple Loans profiles. */
export interface SimpleLoanAuthorization {
  type: "EthSignature";
  derivationIndex: Uint8Array;
  publicKey: Uint8Array;
  address: string;
}

/** Warmed profile available for a future simple loan. */
export interface SimpleLoanWarmedProfile {
  id: bigint;
  authorization: SimpleLoanAuthorization;
  /** Unix creation timestamp in seconds. */
  createdAt: bigint;
  profileId: string;
}

/** Direct canister event returned by the Simple Loans query API. */
export interface SimpleLoanEvent {
  id: bigint;
  schemaVersion: number;
  /** Unix event timestamp in seconds. */
  timestamp: bigint;
  eventType: SimpleLoanEventType;
}

/** Simple loan leg used when stuck funds are withdrawn. */
export type SimpleLoanLeg = "Lend" | "Borrow";

/** Simple-loan-created event payload. */
export interface SimpleLoanCreatedEventType {
  type: "LoanCreated";
  loanId: bigint;
  borrowDestination: SimpleLoanAccount;
  collateralAsset: SimpleLoanAsset;
  borrowAmount: bigint;
  collateralPoolId: string;
  refundDestination: SimpleLoanAccount;
  ltvMaxBps: bigint;
  depositWindowSeconds: bigint;
  profileId: string;
  borrowPoolId: string;
  borrowAsset: SimpleLoanAsset;
}

/** Full collateral withdrawal request event payload. */
export interface SimpleLoanFullLendWithdrawalRequestedEventType {
  type: "FullLendWithdrawalRequested";
  loanId: bigint;
  account: SimpleLoanAccount;
  poolId: string;
}

/** Borrow request event payload. */
export interface SimpleLoanBorrowRequestedEventType {
  type: "BorrowRequested";
  loanId: bigint;
  account: SimpleLoanAccount;
  poolId: string;
  amount: bigint;
}

/** Deposit timer exceeded event payload. */
export interface SimpleLoanDepositTimerExceededEventType {
  type: "DepositTimerExceeded";
  loanId: bigint;
}

/** Stuck funds withdrawal request event payload. */
export interface SimpleLoanStuckFundsWithdrawalRequestedEventType {
  type: "StuckFundsWithdrawalRequested";
  leg: SimpleLoanLeg;
  loanId: bigint;
  account: SimpleLoanAccount;
  poolId: string;
  amount: bigint;
}

/** Profile-warmed event payload. */
export interface SimpleLoanProfileWarmedEventType {
  type: "ProfileWarmed";
  derivationIndex: Uint8Array;
  warmedProfileId: bigint;
  ethAddress: string;
  profileId: string;
}

/** Repay-complete event payload. */
export interface SimpleLoanRepayCompleteEventType {
  type: "RepayComplete";
  loanId: bigint;
  profileId: string;
}

/** Deposit timer started event payload. */
export interface SimpleLoanDepositTimerStartedEventType {
  type: "DepositTimerStarted";
  loanId: bigint;
  /** Unix timestamp in seconds when the deposit timer started. */
  timestamp: bigint;
}

/** Direct canister event payload returned by Simple Loans event queries. */
export type SimpleLoanEventType =
  | SimpleLoanCreatedEventType
  | SimpleLoanFullLendWithdrawalRequestedEventType
  | SimpleLoanBorrowRequestedEventType
  | SimpleLoanDepositTimerExceededEventType
  | SimpleLoanStuckFundsWithdrawalRequestedEventType
  | SimpleLoanProfileWarmedEventType
  | SimpleLoanRepayCompleteEventType
  | SimpleLoanDepositTimerStartedEventType;

/** Fee-inclusive collateral deposit quote for one transfer target. */
export interface SimpleLoanInitialDepositTargetQuote {
  /** Full amount to send to the collateral deposit target, including fee. */
  amount: bigint;
  /** Inflow fee amount in base units added to the transfer amount. */
  inflowFeeAmount: bigint;
  /** Address or ICRC account where the collateral should be sent. */
  target: SupplyTarget;
}

/** Fee-inclusive repayment quote for one transfer target. */
export interface SimpleLoanRepaymentTargetQuote {
  /** Full amount to send to the repayment target, including fee and interest buffer. */
  amount: bigint;
  /** Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable. */
  inflowFeeAmount: bigint;
  /** Whether `inflowFeeAmount` came from a live fee estimate. */
  inflowFeeEstimateAvailable: boolean;
  /** Address or ICRC account where the repayment should be sent. */
  target: SupplyTarget;
}

/** Current amount to send to a repayment target to close the debt. */
export interface SimpleLoanRepayment {
  /** Decimal scale for `amount`. */
  decimals: bigint;
  /** Current debt in base units, before fee and interest buffer. */
  debtAmount: bigint;
  /** Additional interest buffer in base units. */
  interestBufferAmount: bigint;
  /** Seconds of interest accrual included in `interestBufferAmount`. */
  interestBufferSeconds: bigint;
  /** Asset to repay. */
  asset: SimpleLoanAsset;
  /** Available repayment targets keyed by the actual transfer chain. */
  targets: Partial<Record<Chain, SimpleLoanRepaymentTargetQuote>>;
}

/** Initial collateral deposit quote returned when a simple loan is created. */
export interface SimpleLoanInitialDeposit {
  /** Decimal scale for `amount`, `collateralAmount`, and `inflowFeeAmount`. */
  decimals: bigint;
  /** Intended credited collateral amount in base units, before inflow fees. */
  collateralAmount: bigint;
  /** Collateral asset to deposit. */
  asset: SimpleLoanAsset;
  /** Available collateral deposit targets keyed by the actual transfer chain. */
  targets: Partial<Record<Chain, SimpleLoanInitialDepositTargetQuote>>;
  /** Unix timestamp in seconds when the collateral deposit was detected, or null before detection. */
  detectedTimestamp: bigint | null;
  /** Unix timestamp in seconds when the collateral deposit window expires, or null before detection when unavailable. */
  expiryTimestamp: bigint | null;
}

/** Current lending position backing the simple loan. */
export interface SimpleLoanPositionSummary {
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

/** Immutable terms selected for a simple loan. */
export interface SimpleLoanTerms {
  /** Maximum loan-to-value ratio in basis points. */
  ltvMaxBps: bigint;
  /** Seconds allowed for the collateral deposit before timeout. */
  depositWindowSeconds: bigint;
}

/** Collateral leg selected for a simple loan. */
export interface SimpleLoanCollateral {
  /** Principal text of the collateral pool. */
  poolId: string;
  /** Asset deposited as collateral. Transfer rails are exposed by `initialDeposit.targets`. */
  asset: SimpleLoanAsset;
  /** Decimal scale for collateral amounts. */
  decimals: bigint;
  /** Intended credited collateral amount in base units, before inflow fees. */
  amount: bigint;
}

/** Borrow leg selected for a simple loan. */
export type SimpleLoanBorrow = AssetIdentifier & {
  /** Principal text of the borrow pool. */
  poolId: string;
  /** Decimal scale for borrow and debt amounts. */
  decimals: bigint;
  /** Requested borrow amount in base units. */
  amount: bigint;
  /** Destination that receives the borrowed asset. */
  destination: SimpleLoanAccount;
};

/** Hydrated simple loan state plus generated quote targets. */
export interface SimpleLoan {
  /** Canister-assigned loan id. */
  loanId: bigint;
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
  /** Shared lifecycle status for display and flow control. */
  status: LiquidiumStatus;
  /** Generated profile principal used by the simple loan. */
  profileId: string;
  /** Immutable loan terms. */
  terms: SimpleLoanTerms;
  /** Collateral-side pool, asset, decimals, and requested credited amount. */
  collateral: SimpleLoanCollateral;
  /** Borrow-side pool, asset, chain, decimals, requested amount, and destination. */
  borrow: SimpleLoanBorrow;
  /** Destination used for collateral refunds or withdrawals. */
  refundDestination: SimpleLoanAccount;
  /** Current actionable initial collateral deposit quote. */
  initialDeposit: SimpleLoanInitialDeposit;
  /** Current repayment quote. Amount fields are zero when the loan has no debt. */
  repayment: SimpleLoanRepayment;
  /** Current lending position state for the generated profile. */
  position: SimpleLoanPositionSummary;
}
