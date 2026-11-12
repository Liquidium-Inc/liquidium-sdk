import { type Address, isAddressEqual } from "viem";
import { feeSplitterAbi } from "../generated/fee-splitter";
import { loanCoreAbi } from "../generated/loan-core";
import { P2pEvmError, P2pEvmErrorCode } from "./errors";
import { assertPartnerId } from "./typed-data";
import type { P2pEvmPublicClient } from "./types";

interface CreateProtocolContextOptions {
  chainId: number;
  loanCoreAddress: Address;
  publicClient: P2pEvmPublicClient;
  partnerId?: number;
}

/** The one LoanCore deployment a client is bound to, and how to read it. */
export interface ProtocolContext {
  readonly chainId: number;
  readonly loanCoreAddress: Address;
  readonly publicClient: P2pEvmPublicClient;
  /** The configured partner id, or a clear error when the call needs one. */
  requirePartnerId(override?: number): number;
  /** Fails unless the public client is connected to the configured chain. */
  assertChain(): Promise<void>;
  /**
   * The fee splitter LoanCore currently pays, read from LoanCore and cross-checked: the
   * splitter must name this LoanCore back. Never cached, because an admin can repoint it and
   * a signature for the old splitter is worthless.
   */
  getFeeSplitterAddress(): Promise<Address>;
}

export function createProtocolContext(
  options: CreateProtocolContextOptions
): ProtocolContext {
  const { chainId, loanCoreAddress, publicClient } = options;
  if (options.partnerId !== undefined) {
    assertPartnerId(options.partnerId);
  }

  return {
    chainId,
    loanCoreAddress,
    publicClient,

    requirePartnerId(override?: number): number {
      const partnerId = override ?? options.partnerId;
      if (partnerId === undefined) {
        throw new P2pEvmError(
          P2pEvmErrorCode.VALIDATION_ERROR,
          "This call needs a partner id: set `partnerId` on the client or pass one"
        );
      }
      assertPartnerId(partnerId);
      return partnerId;
    },

    async assertChain(): Promise<void> {
      const connectedChainId = await publicClient.getChainId();
      if (connectedChainId !== chainId) {
        throw new P2pEvmError(
          P2pEvmErrorCode.CHAIN_MISMATCH,
          `Public client is on chain ${connectedChainId}, expected ${chainId}`
        );
      }
    },

    async getFeeSplitterAddress(): Promise<Address> {
      const feeRecipient = await publicClient.readContract({
        address: loanCoreAddress,
        abi: loanCoreAbi,
        functionName: "feeRecipient",
      });
      // Before revenue sharing is switched on the fee recipient is a plain treasury address,
      // and this read reverts or returns nothing.
      const splitterLoanCore = await publicClient
        .readContract({
          address: feeRecipient,
          abi: feeSplitterAbi,
          functionName: "loanCore",
        })
        .catch(() => undefined);
      if (
        !splitterLoanCore ||
        !isAddressEqual(splitterLoanCore, loanCoreAddress)
      ) {
        throw new P2pEvmError(
          P2pEvmErrorCode.FEE_SPLITTER_NOT_CONFIGURED,
          `LoanCore's fee recipient ${feeRecipient} is not a fee splitter for this LoanCore`
        );
      }
      return feeRecipient;
    },
  };
}
