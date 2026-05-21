import type { Chain, MarketAsset, MarketChain } from "../../core/types";
import type { SupplyTarget } from "../lending";

/** Asset symbols supported by the instant-loans canister. */
export type InstantLoanAsset = "BTC" | "SOL" | "USDC" | "USDT";

/** External chain account used for borrow delivery or collateral refunds. */
export interface ExternalAccount {
  /**
   * Account kind discriminator.
   *
   * Use `External` for addresses outside the IC, such as BTC, Solana, or EVM
   * addresses. Instant-loan creation currently accepts external destinations.
   */
  type: "External";
  /**
   * Optional chain metadata for display and caller-side validation.
   *
   * The instant-loan API only sends `address` to the canister. Include `chain`
   * when your UI needs to remember which network the address belongs to.
   */
  chain?: Chain | MarketChain;
  /**
   * Destination address on the external chain.
   *
   * For `borrowDestination`, this receives the borrowed asset. For
   * `refundDestination`, this receives collateral refunds or withdrawals.
   */
  address: string;
}

/** IC principal account returned when a canister-native destination is used. */
export interface NativeAccount {
  /** Account kind discriminator. */
  type: "Native";
  /** Principal text for the canister-native account. */
  principal: string;
}

/** Borrow destination or refund account associated with an instant loan. */
export type InstantLoanAccount = ExternalAccount | NativeAccount;

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
  /**
   * Principal text of the pool that receives the user's collateral deposit.
   *
   * This should be the `id` of the collateral `Pool` selected from
   * `client.market.listPools()`. The pool asset must match `collateralAsset`.
   */
  collateralPoolId: string;
  /**
   * Principal text of the pool that funds the borrow.
   *
   * This should be the `id` of the borrow `Pool` selected from
   * `client.market.listPools()`. The pool asset must match `borrowAsset`.
   */
  borrowPoolId: string;
  /**
   * Asset the user will deposit as collateral.
   *
   * Must match the asset for `collateralPoolId`; for example, use `"BTC"` with
   * a BTC collateral pool.
   */
  collateralAsset: InstantLoanAsset;
  /**
   * Asset the user wants to borrow from the borrow pool.
   *
   * Must match the asset for `borrowPoolId`; for example, use `"USDC"` with a
   * USDC borrow pool.
   */
  borrowAsset: InstantLoanAsset;
  /**
   * Amount the user is expected to deposit as collateral, in base units.
   *
   * This is used to validate LTV and initialize the loan record. For BTC, pass
   * satoshis. For token assets, convert the UI amount using the selected pool's
   * `decimals` value.
   */
  collateralAmount: bigint;
  /**
   * Amount to borrow, in the borrow asset's base units.
   *
   * For USDC/USDT, convert the UI amount using the selected borrow pool's
   * `decimals` value before passing it here.
   */
  borrowAmount: bigint;
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
  /**
   * External destination that receives the borrowed asset after the loan starts.
   *
   * Pass either an address string or `{ type: "External", address }`. This is
   * usually the user's wallet address on the borrow asset's chain, such as an
   * EVM address for ETH USDC/USDT outflows.
   */
  borrowDestination: string | ExternalAccount;
  /**
   * External destination that receives collateral refunds or withdrawals.
   *
   * Pass either an address string or `{ type: "External", address }`. This
   * should be an address on the collateral asset's chain, such as a BTC address
   * when `collateralAsset` is `"BTC"`.
   */
  refundDestination: string | ExternalAccount;
}

/** Lookup request for loading canonical instant-loan state. */
export type InstantLoanGetRequest = { loanId: bigint } | { ref: string };

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
  createdAt: bigint;
  profileId: string;
}

/** Direct canister event returned by the instant-loans query API. */
export interface InstantLoanEvent {
  id: bigint;
  schemaVersion: number;
  timestamp: bigint;
  eventType: InstantLoanEventType;
}

export type InstantLoanLeg = "Lend" | "Borrow";

export type InstantLoanEventType =
  | {
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
  | {
      type: "FullLendWithdrawalRequested";
      loanId: bigint;
      account: InstantLoanAccount;
      poolId: string;
    }
  | {
      type: "BorrowRequested";
      loanId: bigint;
      account: InstantLoanAccount;
      poolId: string;
      amount: bigint;
    }
  | { type: "DepositTimerExceeded"; loanId: bigint }
  | {
      type: "StuckFundsWithdrawalRequested";
      leg: InstantLoanLeg;
      loanId: bigint;
      account: InstantLoanAccount;
      poolId: string;
      amount: bigint;
    }
  | {
      type: "ProfileWarmed";
      derivationIndex: Uint8Array;
      warmedProfileId: bigint;
      ethAddress: string;
      profileId: string;
    }
  | { type: "RepayComplete"; loanId: bigint; profileId: string }
  | { type: "DepositTimerStarted"; loanId: bigint; timestamp: bigint };

/** Current amount to send to the repayment target to close the debt. */
export interface InstantLoanRepayment {
  /** Full amount to send to the repayment target, including fee and interest buffer. */
  amount: bigint;
  /** Decimal scale for `amount`. */
  decimals: bigint;
  /** Current debt in base units, before fee and interest buffer. */
  debtAmount: bigint;
  /** Additional interest buffer in base units. */
  interestBufferAmount: bigint;
  /** Seconds of interest accrual included in `interestBufferAmount`. */
  interestBufferSeconds: bigint;
  /** Inflow fee amount in base units added to the repayment transfer. Falls back to the protocol minimum when live estimation is unavailable. */
  inflowFeeAmount: bigint;
  /** Whether `inflowFeeAmount` came from a live fee estimate. */
  inflowFeeEstimateAvailable: boolean;
  /** Asset to repay. */
  asset: MarketAsset;
  /** Chain used for repayment. */
  chain: MarketChain;
  /** Address or ICRC account where the repayment should be sent. */
  target: SupplyTarget;
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

/** Simplified lifecycle status for consumer UIs. */
export const InstantLoanStatus = {
  awaitingDeposit: "awaiting_deposit",
  depositDetected: "deposit_detected",
  active: "active",
  settling: "settling",
  closed: "closed",
} as const;
export type InstantLoanStatus =
  (typeof InstantLoanStatus)[keyof typeof InstantLoanStatus];

/** Hydrated instant-loan state plus generated deposit and repayment targets. */
export interface InstantLoan {
  /** Canister-assigned loan id. */
  loanId: bigint;
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
  /** Simplified lifecycle status for display and flow control. */
  status: InstantLoanStatus;
  /** Generated lending profile principal used by the instant loan. */
  profileId: string;
  /** Maximum loan-to-value ratio in basis points. */
  ltvMaxBps: bigint;
  /** Seconds allowed for the collateral deposit before timeout. */
  depositWindowSeconds: bigint;
  /** Collateral-side pool, asset, chain, and current or requested collateral amount. */
  collateral: {
    poolId: string;
    asset: MarketAsset;
    chain: MarketChain;
    amount: bigint;
  };
  /** Borrow-side pool, asset, chain, requested amount, and destination. */
  borrow: {
    poolId: string;
    asset: MarketAsset;
    chain: MarketChain;
    amount: bigint;
    destination: InstantLoanAccount;
  };
  /** Destination used for collateral refunds or withdrawals. */
  refundDestination: InstantLoanAccount;
  /** Address or ICRC account where the user deposits collateral. */
  depositTarget: SupplyTarget;
  /** Address or ICRC account where the user repays debt. */
  repayTarget: SupplyTarget;
  /** Current actionable repayment quote. */
  repayment: InstantLoanRepayment;
  /** Current lending position state for the generated profile. */
  position: InstantLoanPositionSummary;
}

/**
 * Discovery result returned by address lookup.
 *
 * Candidates are intentionally lightweight; call `instantLoans.get(...)` with
 * `loanId` or `ref` to load canonical canister state and transfer targets.
 */
export interface InstantLoanCandidate {
  /** Canister-assigned loan id. */
  loanId: bigint;
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
  /** Generated lending profile principal used by the instant loan. */
  profileId: string;
  /** API-observed creation time, if provided by the indexer. */
  createdAt?: Date;
  /** Principal text of the collateral pool. */
  collateralPoolId: string;
  /** Principal text of the borrow pool. */
  borrowPoolId: string;
  /** Collateral asset symbol. */
  collateralAsset: MarketAsset;
  /** Borrow asset symbol. */
  borrowAsset: MarketAsset;
  /** Collateral amount hint in base units. */
  collateralAmountHint: bigint;
}
