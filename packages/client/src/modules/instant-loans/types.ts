import type { Chain, MarketAsset, MarketChain } from "../../core/types";
import type { SupplyTarget } from "../lending";

/** Asset symbols supported by the instant-loans canister. */
export type InstantLoanAsset = "BTC" | "SOL" | "USDC" | "USDT";

/** External chain account used for borrow delivery or collateral refunds. */
export interface ExternalAccount {
  /** Account kind discriminator. */
  type: "External";
  /** Optional chain metadata for display; the canister only receives `address`. */
  chain?: Chain | MarketChain;
  /** Destination address on the external chain. */
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
 * Amount fields are in each asset's smallest/base units. For example, BTC uses
 * satoshis and ERC-20 assets use token base units according to their decimals.
 */
export interface CreateInstantLoanRequest {
  /** Principal text of the pool that receives the collateral deposit. */
  collateralPoolId: string;
  /** Principal text of the pool the loan borrows from. */
  borrowPoolId: string;
  /** Asset deposited as collateral. */
  collateralAsset: InstantLoanAsset;
  /** Asset borrowed from the borrow pool. */
  borrowAsset: InstantLoanAsset;
  /** Collateral amount hint in the collateral asset's base units. */
  collateralAmount: bigint;
  /** Requested borrow amount in the borrow asset's base units. */
  borrowAmount: bigint;
  /** Maximum loan-to-value ratio in basis points. `6_000n` means 60%. */
  ltvMaxBps: bigint;
  /**
   * Seconds allowed for the collateral deposit before the instant-loan flow
   * times out. Internally this is sent to the canister as `ltv_timer_s`.
   */
  depositWindowSeconds: bigint;
  /** External address that receives the borrowed asset. */
  borrowDestination: string | ExternalAccount;
  /** External address that receives collateral refunds or withdrawals. */
  refundDestination: string | ExternalAccount;
}

/** Lookup request for loading canonical instant-loan state. */
export type InstantLoanGetRequest = { loanId: bigint } | { ref: string };

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

/** Hydrated instant-loan state plus generated deposit and repayment targets. */
export interface InstantLoan {
  /** Canister-assigned loan id. */
  loanId: bigint;
  /** Short user-facing reference derived from `loanId`. */
  ref: string;
  /** Generated lending profile principal used by the instant loan. */
  profileId: string;
  /** Maximum loan-to-value ratio in basis points. */
  ltvMaxBps: bigint;
  /** Seconds allowed for the collateral deposit before timeout. */
  depositWindowSeconds: bigint;
  /** Collateral-side pool, asset, chain, and requested deposit amount. */
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
