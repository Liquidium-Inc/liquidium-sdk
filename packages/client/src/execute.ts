import { LiquidiumError, LiquidiumErrorCode } from "./core/errors";
import type { SigningChain } from "./core/types";
import {
  type WalletAction,
  type WalletAdapter,
  WalletExecutionKind,
} from "./core/wallet-actions";

interface WalletExecutionKindCarrier {
  executionKind?: unknown;
}

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
  chain?: SigningChain;
  /** Optional signing/sending account override. */
  account?: string;
}

/**
 * Returns an async function that runs a {@link WalletAction} end-to-end.
 *
 * - `sign-message`: needs `walletAdapter.signMessage` and `options.chain`.
 *
 * @param options - Adapter and optional chain/account overrides.
 * @returns A function that accepts a `WalletAction` and resolves with its submit result.
 */
export function executeWith(options: ExecuteWithOptions) {
  return async function execute<TResult>(
    action: WalletAction<TResult>
  ): Promise<TResult> {
    switch (action.executionKind) {
      case WalletExecutionKind.signMessage: {
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
        });

        return action.submit({
          signature,
          chain: options.chain,
          account: options.account ?? action.account,
        });
      }
      default:
        throw new LiquidiumError(
          LiquidiumErrorCode.VALIDATION_ERROR,
          `Unsupported wallet execution kind: ${String(
            (action as WalletExecutionKindCarrier).executionKind
          )}`
        );
    }
  };
}
