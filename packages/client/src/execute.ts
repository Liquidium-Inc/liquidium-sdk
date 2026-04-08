import { LiquidiumError, LiquidiumErrorCode } from "./core/errors";
import type { Chain } from "./core/types";
import type { WalletAction, WalletAdapter } from "./core/wallet-actions";

export interface ExecuteWithOptions {
  walletAdapter: WalletAdapter;
  chain?: Chain;
  account?: string;
}

export function executeWith(options: ExecuteWithOptions) {
  return async function execute<TResult>(
    action: WalletAction<TResult>
  ): Promise<TResult> {
    switch (action.executionKind) {
      case "sign-message": {
        if (!options.walletAdapter.signMessage) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "Wallet adapter does not support message signing"
          );
        }

        if (!options.chain) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "Message-signing actions require a chain"
          );
        }

        const signature = await options.walletAdapter.signMessage({
          chain: options.chain,
          message: action.message,
          account: options.account ?? action.account,
          actionType: action.actionType,
          transferMode: action.transferMode,
        });

        return action.submit({
          signature,
          chain: options.chain,
          account: options.account ?? action.account,
        });
      }
      case "sign-psbt": {
        if (!options.walletAdapter.signPsbt) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "Wallet adapter does not support PSBT signing"
          );
        }

        const signedPsbtBase64 = await options.walletAdapter.signPsbt({
          chain: "BTC",
          psbtBase64: action.psbtBase64,
          account: options.account ?? action.account,
          actionType: action.actionType,
          transferMode: action.transferMode,
        });

        return action.submit({ signedPsbtBase64 });
      }
      case "send-eth-transaction": {
        if (!options.walletAdapter.sendEthTransaction) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "Wallet adapter does not support ETH transaction sending"
          );
        }

        const txHash = await options.walletAdapter.sendEthTransaction({
          chain: "ETH",
          transaction: action.transaction,
          account: options.account ?? action.account,
          actionType: action.actionType,
          transferMode: action.transferMode,
        });

        return action.submit({ txHash });
      }
    }
  };
}
