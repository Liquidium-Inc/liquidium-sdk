import type { Identity } from "@icp-sdk/core/agent";
import type { PublicClient } from "viem";

/** Minimal viem-compatible client shape required for SDK EVM read calls. */
export type EvmReadClient = Pick<PublicClient, "readContract">;

/**
 * Runtime options for `new LiquidiumClient(config)`.
 *
 * Canister-backed reads and SDK HTTP features work with `{}` defaults. Set
 * `apiBaseUrl` only when overriding the Liquidium production API root.
 */
export interface LiquidiumClientConfig {
  /** Preset canister IDs. Only `mainnet` is bundled. */
  environment?: Environment;
  /** ICP replica host override (defaults follow `@icp-sdk/core/agent`). */
  icHost?: string;
  /** Agent identity for signed canister calls. */
  identity?: Identity;
  /**
   * Base URL for the Liquidium SDK HTTP API root (e.g. `https://app.example.com/api/sdk`).
   * Defaults to the Liquidium production API root. Endpoint versions are owned
   * by this SDK package version.
   */
  apiBaseUrl?: string;
  /** Extra headers sent with every SDK API request. */
  headers?: Record<string, string>;
  /** Override individual canister principals for custom deployments. */
  canisterIds?: CanisterIdOverrides;
  /** Custom `fetch` implementation for SDK API requests. */
  fetch?: typeof fetch;
  /** Per-request timeout for SDK API calls in milliseconds. */
  timeoutMs?: number;
  /** Ethereum RPC URL used for public ERC-20 reads in EVM supply flows. */
  evmRpcUrl?: string;
  /** Optional headers for RPC providers that authenticate via HTTP headers. */
  evmRpcHeaders?: Record<string, string>;
  /** Existing viem public client or compatible read client for EVM reads. */
  evmPublicClient?: EvmReadClient;
}

/** Pool canister principal text values grouped by pool asset. */
export interface PoolCanisterIds {
  /** BTC pool canister principal. */
  btc: string;
  /** ETH pool canister principal. */
  eth: string;
  /** USDT pool canister principal. */
  usdt: string;
  /** USDC pool canister principal. */
  usdc: string;
  /** ICP pool canister principal. */
  icp: string;
}

/** Principal text values for canisters used by the client. */
export interface CanisterIds {
  /** Liquidium lending canister principal. */
  lending: string;
  /** Pool canister principals grouped by pool asset. */
  pools: PoolCanisterIds;
  /** ckETH minter deposit helper canister principal. */
  ethDeposit: string;
  /** Accountless Simple Loans canister principal. */
  simpleLoans: string;
}

/** Custom canister principal overrides accepted by client configuration. */
export type CanisterIdOverrides = Omit<Partial<CanisterIds>, "pools"> & {
  /** Partial grouped pool canister principal overrides. */
  pools?: Partial<PoolCanisterIds>;
};

/** Supported deployment environments with bundled canister ids. */
export const Environment = {
  mainnet: "mainnet",
} as const;
/** Supported deployment environment name. */
export type Environment = (typeof Environment)[keyof typeof Environment];

/** Canonical asset symbols supported by state-mutating protocol flows. */
export const Asset = {
  BTC: "BTC",
  ETH: "ETH",
  ICP: "ICP",
  USDC: "USDC",
  USDT: "USDT",
} as const;
/** Canonical asset symbol supported by state-mutating protocol flows. */
export type Asset = (typeof Asset)[keyof typeof Asset];

/** Canonical chain identifiers used by wallet and protocol actions. */
export const Chain = {
  BTC: "BTC",
  ETH: "ETH",
  ICP: "ICP",
} as const;
/** Canonical chain identifier used by wallet and protocol actions. */
export type Chain = (typeof Chain)[keyof typeof Chain];

/** Chains whose wallets can authorize Liquidium protocol actions. */
export type SigningChain = typeof Chain.BTC | typeof Chain.ETH;

/** BTC transferred on the Bitcoin chain. */
export interface BtcOnBtcAssetIdentifier {
  chain: typeof Chain.BTC;
  asset: typeof Asset.BTC;
}

/** ETH transferred on the Ethereum chain. */
export interface EthOnEthAssetIdentifier {
  chain: typeof Chain.ETH;
  asset: typeof Asset.ETH;
}

/** USDC transferred on the Ethereum chain. */
export interface UsdcOnEthAssetIdentifier {
  chain: typeof Chain.ETH;
  asset: typeof Asset.USDC;
}

/** USDT transferred on the Ethereum chain. */
export interface UsdtOnEthAssetIdentifier {
  chain: typeof Chain.ETH;
  asset: typeof Asset.USDT;
}

/** BTC transferred on the Internet Computer chain. */
export interface BtcOnIcpAssetIdentifier {
  chain: typeof Chain.ICP;
  asset: typeof Asset.BTC;
}

/** ETH transferred on the Internet Computer chain. */
export interface EthOnIcpAssetIdentifier {
  chain: typeof Chain.ICP;
  asset: typeof Asset.ETH;
}

/** ICP transferred on the Internet Computer chain. */
export interface IcpOnIcpAssetIdentifier {
  chain: typeof Chain.ICP;
  asset: typeof Asset.ICP;
}

/** USDC transferred on the Internet Computer chain. */
export interface UsdcOnIcpAssetIdentifier {
  chain: typeof Chain.ICP;
  asset: typeof Asset.USDC;
}

/** USDT transferred on the Internet Computer chain. */
export interface UsdtOnIcpAssetIdentifier {
  chain: typeof Chain.ICP;
  asset: typeof Asset.USDT;
}

/** Supported asset and transfer-chain combinations. */
export type AssetIdentifier =
  | BtcOnBtcAssetIdentifier
  | EthOnEthAssetIdentifier
  | UsdcOnEthAssetIdentifier
  | UsdtOnEthAssetIdentifier
  | BtcOnIcpAssetIdentifier
  | EthOnIcpAssetIdentifier
  | IcpOnIcpAssetIdentifier
  | UsdcOnIcpAssetIdentifier
  | UsdtOnIcpAssetIdentifier;

/** Returns whether an asset and chain form a supported SDK identifier. */
export function isAssetIdentifier(identifier: {
  chain: string;
  asset: string;
}): identifier is AssetIdentifier {
  switch (identifier.chain) {
    case Chain.BTC:
      return identifier.asset === Asset.BTC;
    case Chain.ETH:
      return (
        identifier.asset === Asset.ETH ||
        identifier.asset === Asset.USDC ||
        identifier.asset === Asset.USDT
      );
    case Chain.ICP:
      return (
        identifier.asset === Asset.BTC ||
        identifier.asset === Asset.ETH ||
        identifier.asset === Asset.ICP ||
        identifier.asset === Asset.USDC ||
        identifier.asset === Asset.USDT
      );
    default:
      return false;
  }
}

/** Inflow operation performed by a supply target. */
export const SupplyAction = {
  deposit: "deposit",
  repayment: "repayment",
} as const;
/** Inflow operation performed by a supply target. */
export type SupplyAction = (typeof SupplyAction)[keyof typeof SupplyAction];

/** Outflow operation reported by the lending canister. */
export const OutflowType = {
  borrow: "borrow",
  feeClaim: "feeClaim",
  withdrawal: "withdrawal",
} as const;
/** Outflow operation reported by the lending canister. */
export type OutflowType = (typeof OutflowType)[keyof typeof OutflowType];

/** Wallet address and chain pair linked to a Liquidium profile. */
export interface Wallet {
  /** Chain where the wallet address is valid. */
  chain: SigningChain;
  /** Wallet address as stored by the protocol. */
  address: string;
}
