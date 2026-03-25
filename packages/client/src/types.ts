import type { Identity } from "@dfinity/agent";

export interface LiquidiumClientConfig {
  /** ICP replica host. Defaults to the Liquidium mainnet host. */
  host?: string;

  /** Optional `@dfinity/agent` identity for authenticated canister calls. */
  identity?: Identity;

  /** Base URL of the Liquidium API (e.g. `https://app.liquidium.fi/api`). */
  apiBaseUrl?: string;

  /** Override individual canister IDs. */
  canisterIds?: Partial<CanisterIds>;

  /** Request timeout in milliseconds. Defaults to 30 000. */
  timeoutMs?: number;
}

export interface CanisterIds {
  lending: string;
  btcPool: string;
  ercPool: string;
}

export interface SignatureInfo {
  signature: string;
  chain: Chain;
  account: string;
}

export interface CreateAccountData {
  expiryTimestamp: bigint;
}

export interface SignableAction<TData, TResult> {
  kind: string;
  account: string;
  message: string;
  data: TData;
  submit(signatureInfo: SignatureInfo): Promise<TResult>;
}

export interface CreateAccountAction
  extends SignableAction<CreateAccountData, string> {
  kind: "create-account";
}

export interface CreateAccountRequest {
  data: CreateAccountData;
  signatureInfo: SignatureInfo;
}

// ---------------------------------------------------------------------------
// Domain enums
// ---------------------------------------------------------------------------

export type Asset = "BTC" | "USDT" | "USDC";
export type Chain = "BTC" | "ETH";
export type Inflowtype = "Deposit" | "Repayment";
export type Outflowtype = "Withdraw" | "Borrow" | "FeeClaim";

// ---------------------------------------------------------------------------
// Domain models
// ---------------------------------------------------------------------------

export interface Pool {
  id: string;
  asset: Asset;
  chain: Chain;
  frozen: boolean;

  totalSupply: bigint;
  totalDebt: bigint;
  supplyCap?: bigint;
  borrowCap?: bigint;

  /** Basis points (e.g. 7500 = 75%) */
  maxLtv: bigint;
  liquidationThreshold: bigint;
  liquidationBonus: bigint;
  protocolLiquidationFee: bigint;
  reserveFactor: bigint;

  /** All rates as raw RAY values (1e27 scale). */
  lendingRate: bigint;
  borrowingRate: bigint;
  utilizationRate: bigint;
  baseRate: bigint;
  optimalUtilizationRate: bigint;
  rateSlopeBefore: bigint;
  rateSlopeAfter: bigint;

  lendingIndex: bigint;
  borrowIndex: bigint;

  sameAssetBorrowing: boolean;
  lastUpdated?: bigint;
}

export interface Position {
  poolId: string;
  asset: Asset;
  deposited: bigint;
  depositedDecimals: bigint;
  borrowed: bigint;
  borrowedDecimals: bigint;
  earnedInterest: bigint;
  debtInterest: bigint;
  lastUpdate: bigint;
}

export interface Wallet {
  chain: Chain;
  address: string;
}

export interface BorrowingPower {
  weightedMaxLtv: bigint;
  maxBorrowableUsd: bigint;
  maxBorrowableUsdDecimals: bigint;
}

export interface UserStats {
  debt: bigint;
  debtDecimals: bigint;
  collateral: bigint;
  collateralDecimals: bigint;
  weightedLiquidationThreshold: bigint;
  borrowingPower: BorrowingPower;
}

export interface HealthFactor {
  healthFactor: bigint;
  userStats: UserStats;
}

export interface OutflowDetails {
  id: string;
  outflowType: Outflowtype;
  outflowRef?: string;
  amount: bigint;
}

export interface CkInflowAccount {
  account: string;
  owner: string;
  subaccount: Uint8Array;
}

export interface PendingInflow {
  type: Inflowtype;
  amount: bigint;
  chain: Chain;
  asset: Asset;
  poolId: string;
}

export interface PendingOutflow {
  amount: bigint;
  account: string;
  chain: Chain;
  asset: Asset;
  txid?: string;
  poolId: string;
}

export interface PendingMovements {
  inflows: PendingInflow[];
  outflows: PendingOutflow[];
}

export interface AssetPrices {
  BTC: number;
  USDC: number;
  USDT: number;
}

export interface BtcDepositAddresses {
  deposit: string;
  repayment: string;
}
