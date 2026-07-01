import { CK_CANISTER_IDS } from "./config";
import { LiquidiumError, LiquidiumErrorCode } from "./errors";
import { Asset, Chain } from "./types";
import { TransferMode } from "./wallet-actions";

export type PoolLedgerTransferAsset = Extract<
  Asset,
  "BTC" | "ICP" | "USDC" | "USDT"
>;
export type PoolLedgerTransferChain = Extract<Chain, "BTC" | "ETH" | "ICP">;

export interface PoolLedgerAssetRoute {
  ledgerCanisterId: string;
  asset: PoolLedgerTransferAsset;
  chain: PoolLedgerTransferChain;
  transferMode: typeof TransferMode.ck | typeof TransferMode.native;
}

// Public asset symbols identify pool assets. On the IC side, BTC/USDT/USDC
// resolve directly to their ck ledger canisters; native-chain transfers are
// ingress paths into those same ledger-backed pool assets.
export function getPoolLedgerAssetRoute(params: {
  asset: string;
  chain: string;
}): PoolLedgerAssetRoute {
  if (params.asset === Asset.BTC && params.chain === Chain.BTC) {
    return {
      ledgerCanisterId: CK_CANISTER_IDS.ckBTC.ledger,
      asset: Asset.BTC,
      chain: Chain.BTC,
      transferMode: TransferMode.ck,
    };
  }

  if (params.asset === Asset.USDT && params.chain === Chain.ETH) {
    return {
      ledgerCanisterId: CK_CANISTER_IDS.ckUSDT.ledger,
      asset: Asset.USDT,
      chain: Chain.ETH,
      transferMode: TransferMode.ck,
    };
  }

  if (params.asset === Asset.USDC && params.chain === Chain.ETH) {
    return {
      ledgerCanisterId: CK_CANISTER_IDS.ckUSDC.ledger,
      asset: Asset.USDC,
      chain: Chain.ETH,
      transferMode: TransferMode.ck,
    };
  }

  if (params.asset === Asset.ICP && params.chain === Chain.ICP) {
    return {
      ledgerCanisterId: CK_CANISTER_IDS.icp.ledger,
      asset: Asset.ICP,
      chain: Chain.ICP,
      transferMode: TransferMode.native,
    };
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `IC ledger transfers are not supported for ${params.asset} on ${params.chain}`
  );
}

export function isPoolLedgerAsset(params: {
  asset: string;
  chain: string;
}): boolean {
  try {
    getPoolLedgerAssetRoute(params);
    return true;
  } catch (error) {
    if (error instanceof LiquidiumError) {
      return false;
    }

    throw error;
  }
}
