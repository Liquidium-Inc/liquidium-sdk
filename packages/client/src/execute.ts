import { LiquidiumError, LiquidiumErrorCode } from "./core/errors";
import type { Chain } from "./core/types";
import type { WalletAction, WalletAdapter } from "./core/wallet-actions";

/**
 * Wallet wiring for {@link executeWith}.
 *
 * `chain` and `account` override values embedded on the action when present;
 * message signing uses `options.account ?? action.account`.
 */
export interface ExecuteWithOptions {
  /** Must expose the methods required by the action's `executionKind`. */
  walletAdapter: WalletAdapter;
  /** Required for `sign-message` actions; forwarded to the adapter and submit payload. */
  chain?: Chain;
  /** Optional signing/sending account override. */
  account?: string;
}

/**
 * Returns an async function that runs a {@link WalletAction} end-to-end.
 *
 * - `sign-message`: needs `walletAdapter.signMessage` and `options.chain`.
 * - `sign-psbt`: needs `walletAdapter.signPsbt`.
 * - `send-eth-transaction`: needs `walletAdapter.sendEthTransaction`.
 *
 * @param options - Adapter and optional chain/account overrides.
 * @returns A function that accepts a `WalletAction` and resolves with its submit result.
 */
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
