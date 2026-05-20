import { Principal } from "@dfinity/principal";
import { getAddress, isAddress } from "viem";
import { createDepositAccountsActor } from "../../core/canisters/deposit-accounts/actor";
import {
  createLendingActor,
  type LendingPoolRecord,
} from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import {
  createBorrowAssetMessage,
  createWithdrawAssetMessage,
} from "../../core/canisters/lending/messages";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  CK_ETH_DEPOSIT_CONTRACT_ADDRESS,
  ERC20_ABI,
  MAX_UINT256,
} from "../../core/evm";
import { SdkApiPath } from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import {
  Asset,
  Chain,
  type EvmReadClient,
  InflowSubmitType,
  SupplyAction,
} from "../../core/types";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";
import { retryWithBackoff } from "../../core/utils/retry";
import { computeExpiryTimestampFromNow } from "../../core/utils/time";
import { getVariantKey } from "../../core/utils/variant";
import {
  TransferMode,
  WalletActionKind,
  type WalletAdapter,
  WalletExecutionKind,
} from "../../core/wallet-actions";
import { executeWith } from "../../execute";
import {
  getEthStablecoinContractAddress,
  isEthStablecoin,
  mapDepositAccountErrorToLiquidiumError,
  resolveSupplyMechanism,
  resolveSupplyTarget,
} from "./_internal/supply-targets";
import {
  createApproveTransaction,
  createDepositErc20Transaction,
  createTransferErc20Transaction,
} from "./evm-transactions";
import {
  mapCanisterOutflowDetails,
  mapWalletChainToLendingChain,
} from "./mappers";
import {
  type BorrowAction,
  type BorrowSubmitSignatureInfo,
  type CreateBorrowRequest,
  type CreateWithdrawRequest,
  type EstimateInflowFeeRequest,
  EvmSupplyApprovalStrategy,
  type EvmSupplyContext,
  type GetEvmSupplyContextRequest,
  type InflowFeeEstimate,
  type OutflowDetails,
  type SubmitInflowRequest,
  type SubmitInflowResponse,
  type SupplyFlow,
  type SupplyFlowRequest,
  SupplyPlanType,
  type SupplyTarget,
  type WithdrawAction,
  type WithdrawSubmitSignatureInfo,
} from "./types";

const SUBMIT_INFLOW_MAX_ATTEMPTS = 4;
const SUBMIT_INFLOW_INITIAL_RETRY_DELAY_MS = 1_500;
const SUBMIT_INFLOW_RETRY_BACKOFF_MULTIPLIER = 2;
const ETH_APPROVAL_POLL_INTERVAL_MS = 2_000;
const ETH_APPROVAL_MAX_POLLS = 30;

type WalletExecutionParams = {
  signerChain: Chain;
  signerWalletAdapter: WalletAdapter;
};

type OutflowRequestData = {
  profileId: string;
  poolId: string;
  amount: bigint;
  receiverAddress: string;
  signerWalletAddress: string;
  expiryTimestamp: bigint;
};

type SupplyInstruction = {
  poolId: string;
  asset: string;
  chain: string;
  action: SupplyAction;
  target: SupplyTarget;
};

type EvmAddress = `0x${string}`;

export class LendingModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined,
    readonly evmReadClient: EvmReadClient | undefined
  ) {}

  /**
   * Prepares a withdraw action that can be signed and submitted later.
   *
   * Use this when you need explicit control over signing and submission.
   *
   * @param request - Profile, pool, amount (pool asset base units), outflow address, and signer wallet.
   * @returns A signable {@link WithdrawAction} with `submit` wired to the canister.
   */
  async prepareWithdraw(
    request: CreateWithdrawRequest
  ): Promise<WithdrawAction> {
    const destinationAccount = request.receiverAddress.trim();
    const signerAccount = request.signerWalletAddress.trim();
    if (!destinationAccount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Withdraw requires a custom outflow account"
      );
    }
    if (!signerAccount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Withdraw requires a signer account"
      );
    }

    const lendingActor = createLendingActor(this.canisterContext);

    try {
      const expiryTimestamp = computeExpiryTimestampFromNow();
      const nonce = await lendingActor.get_nonce(signerAccount);
      const withdrawRequestData = {
        profileId: request.profileId,
        poolId: request.poolId,
        amount: request.amount,
        receiverAddress: destinationAccount,
        signerWalletAddress: signerAccount,
        expiryTimestamp,
      };

      return {
        kind: WalletActionKind.createWithdraw,
        executionKind: WalletExecutionKind.signMessage,
        actionType: WalletActionKind.createWithdraw,
        transferMode: TransferMode.native,
        account: signerAccount,
        message: createWithdrawAssetMessage(
          {
            pool_id: request.poolId,
            amount: request.amount.toString(),
            account: { type: "External", data: destinationAccount },
            expiry_timestamp: expiryTimestamp,
          },
          nonce
        ),
        data: withdrawRequestData,
        submit: async (signatureInfo: WithdrawSubmitSignatureInfo) => {
          return await this.submitWithdraw(withdrawRequestData, signatureInfo);
        },
      };
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_nonce", error);
    }
  }

  private async submitWithdraw(
    request: OutflowRequestData,
    signatureInfo: WithdrawSubmitSignatureInfo
  ): Promise<OutflowDetails> {
    try {
      const result = await createLendingActor(this.canisterContext).withdraw(
        Principal.fromText(request.profileId),
        {
          data: {
            expiry_timestamp: request.expiryTimestamp,
            account: { External: request.receiverAddress },
            pool_id: Principal.fromText(request.poolId),
            amount: request.amount,
          },
          signature_info: {
            Wallet: {
              signature: signatureInfo.signature,
              chain: mapWalletChainToLendingChain(signatureInfo.chain),
              account: request.signerWalletAddress,
            },
          },
        }
      );

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapCanisterOutflowDetails(result.Ok);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("withdraw", error);
    }
  }

  /**
   * Creates a withdraw outflow using the provided wallet adapter.
   *
   * This is the convenience form of `prepareWithdraw(...)` plus execution.
   *
   * @param params - Withdraw request fields plus `signerChain` and `signerWalletAdapter`.
   * @returns The canister {@link OutflowDetails} for the completed withdraw.
   */
  async withdraw(
    params: CreateWithdrawRequest & WalletExecutionParams
  ): Promise<OutflowDetails> {
    const action = await this.prepareWithdraw(params);

    return await executeWith({
      walletAdapter: params.signerWalletAdapter,
      chain: params.signerChain,
      account: params.signerWalletAddress,
    })(action);
  }

  /**
   * Prepares a borrow action that can be signed and submitted later.
   *
   * Use this when you need explicit control over signing and submission.
   *
   * @param request - Profile, pool, amount (borrow asset base units), outflow address, and signer wallet.
   * @returns A signable {@link BorrowAction} with `submit` wired to the canister.
   */
  async prepareBorrow(request: CreateBorrowRequest): Promise<BorrowAction> {
    const destinationAccount = request.receiverAddress.trim();
    const signerAccount = request.signerWalletAddress.trim();
    if (!destinationAccount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Borrow requires a custom outflow account"
      );
    }
    if (!signerAccount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Borrow requires a signer account"
      );
    }

    const lendingActor = createLendingActor(this.canisterContext);

    try {
      const expiryTimestamp = computeExpiryTimestampFromNow();
      const nonce = await lendingActor.get_nonce(signerAccount);
      const borrowRequestData = {
        profileId: request.profileId,
        poolId: request.poolId,
        amount: request.amount,
        receiverAddress: destinationAccount,
        signerWalletAddress: signerAccount,
        expiryTimestamp,
      };

      return {
        kind: WalletActionKind.createBorrow,
        executionKind: WalletExecutionKind.signMessage,
        actionType: WalletActionKind.createBorrow,
        transferMode: TransferMode.native,
        account: signerAccount,
        message: createBorrowAssetMessage(
          {
            pool_id: request.poolId,
            amount: request.amount.toString(),
            account: { type: "External", data: destinationAccount },
            expiry_timestamp: expiryTimestamp,
          },
          nonce
        ),
        data: borrowRequestData,
        submit: async (signatureInfo: BorrowSubmitSignatureInfo) => {
          return await this.submitBorrow(borrowRequestData, signatureInfo);
        },
      };
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_nonce", error);
    }
  }

  private async submitBorrow(
    request: OutflowRequestData,
    signatureInfo: BorrowSubmitSignatureInfo
  ): Promise<OutflowDetails> {
    try {
      const result = await createLendingActor(
        this.canisterContext
      ).borrow_assets(Principal.fromText(request.profileId), {
        data: {
          expiry_timestamp: request.expiryTimestamp,
          account: { External: request.receiverAddress },
          pool_id: Principal.fromText(request.poolId),
          amount: request.amount,
        },
        signature_info: {
          Wallet: {
            signature: signatureInfo.signature,
            chain: mapWalletChainToLendingChain(signatureInfo.chain),
            account: request.signerWalletAddress,
          },
        },
      });

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapCanisterOutflowDetails(result.Ok);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("borrow_assets", error);
    }
  }

  /**
   * Creates a borrow outflow using the provided wallet adapter.
   *
   * This is the convenience form of `prepareBorrow(...)` plus execution.
   *
   * @param params - Borrow request fields plus `signerChain` and `signerWalletAdapter`.
   * @returns The instant canister receipt as {@link OutflowDetails}.
   *
   * @remarks
   * `id` is always present. `txid` may be missing on the first response; the SDK does not
   * poll for it. Use history or app-level polling if you need the chain transaction id.
   */
  async borrow(
    params: CreateBorrowRequest & WalletExecutionParams
  ): Promise<OutflowDetails> {
    const action = await this.prepareBorrow(params);

    return await executeWith({
      walletAdapter: params.signerWalletAdapter,
      chain: params.signerChain,
      account: params.signerWalletAddress,
    })(action);
  }

  /**
   * Resolves a supply target for a deposit or repayment and optionally broadcasts it.
   *
   * Transfer mode can return manual broadcast instructions when wallet fields are
   * omitted. Contract-interaction mode always requires `walletAdapter`, `account`,
   * and `amount` because it must prepare and submit approval/deposit calls.
   *
   * The SDK does not poll for inflow status. When a `txid` is returned, it is the
   * caller's responsibility to track confirmation state using their own polling.
   *
   * @returns A {@link SupplyFlow} receipt with `type`, `target`, `submit`, and
   *   an optional `txid` present when the SDK broadcast for you.
   */
  async supply(request: SupplyFlowRequest): Promise<SupplyFlow> {
    const target = await resolveSupplyTarget(this.canisterContext, request);
    const instruction: SupplyInstruction = {
      poolId: request.poolId,
      asset: target.asset,
      chain: target.chain,
      action: request.action,
      target,
    };
    const mechanism = resolveSupplyMechanism({
      asset: instruction.asset,
      chain: instruction.chain,
      requestedMechanism: request.mechanism,
    });
    const defaultSubmitInflowRequest = getDefaultSubmitInflowRequest({
      action: request.action,
      chain:
        mechanism === SupplyPlanType.contractInteraction
          ? Chain.ETH
          : instruction.chain,
    });

    let txid: string | undefined;
    switch (mechanism) {
      case SupplyPlanType.transfer:
        if (request.walletAdapter) {
          txid = await this.sendAndSubmitNativeSupplyInflow({
            request,
            instruction,
            defaultSubmitInflowRequest,
          });
        }
        break;
      case SupplyPlanType.contractInteraction:
        txid = await this.executeContractSupply({
          request,
          instruction,
          defaultSubmitInflowRequest,
        });
        break;
    }

    return {
      type: mechanism,
      target: instruction.target,
      txid,
      submit: async (submitRequest) => {
        return await this.submitInflow({
          ...defaultSubmitInflowRequest,
          ...submitRequest,
        });
      },
    };
  }

  /**
   * Fetches ERC-20 supply planning data with the configured EVM read client.
   *
   * Requires `evmRpcUrl` or `evmPublicClient` on the client. Used internally by
   * contract-interaction `supply`.
   *
   * @param request - Profile, pool, wallet, amount (token base units), and action.
   * @returns Locally computed {@link EvmSupplyContext} for approvals and deposit.
   */
  async getEvmSupplyContext(
    request: GetEvmSupplyContextRequest
  ): Promise<EvmSupplyContext> {
    const selectedPool = await this.getPoolById(request.poolId);

    return await this.getEvmSupplyContextForPool({
      request,
      asset: getVariantKey(selectedPool.asset),
      chain: getVariantKey(selectedPool.chain),
    });
  }

  private async getEvmSupplyContextForPool(params: {
    request: GetEvmSupplyContextRequest;
    asset: string;
    chain: string;
  }): Promise<EvmSupplyContext> {
    const { request, asset, chain } = params;
    const evmReadClient = this.requireEvmReadClient(
      "EVM supply context requires an EVM RPC URL or public client"
    );
    const walletAddress = normalizeAndValidateEvmAddress(
      request.walletAddress,
      "Invalid EVM wallet address"
    );

    if (request.amount <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "EVM supply context requires a positive amount"
      );
    }

    if (!isEthStablecoin(asset, chain)) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `EVM supply context only supports ETH stablecoin pools, received ${asset} on ${chain}`
      );
    }

    const tokenAddress = getEthStablecoinContractAddress(asset);
    const spenderAddress = CK_ETH_DEPOSIT_CONTRACT_ADDRESS;
    const [allowance, balance] = await Promise.all([
      readErc20Allowance({
        evmReadClient,
        tokenAddress,
        ownerAddress: walletAddress,
        spenderAddress,
      }),
      readErc20Balance({
        evmReadClient,
        tokenAddress,
        ownerAddress: walletAddress,
      }),
    ]);
    const approvalStrategy = getApprovalStrategy({
      allowance,
      amount: request.amount,
    });

    return {
      success: true,
      profileId: request.profileId,
      poolId: request.poolId,
      walletAddress,
      action: request.action,
      asset: asset as typeof Asset.USDC | typeof Asset.USDT,
      chain: Chain.ETH,
      amount: request.amount.toString(),
      tokenAddress,
      spenderAddress,
      depositContractAddress: CK_ETH_DEPOSIT_CONTRACT_ADDRESS,
      balance: balance.toString(),
      allowance: allowance.toString(),
      requiresApproval: approvalStrategy !== EvmSupplyApprovalStrategy.none,
      approvalStrategy,
    };
  }

  /**
   * Returns the read-only deposit address for an ETH stablecoin inflow target.
   *
   * This is a query call that does not create or mutate state. Use it when you
   * need the deposit address without hitting the authorization-gated update path.
   *
   * @param request - Profile, pool, asset, and supply action.
   * @returns The EVM deposit address for the derived account.
   */
  async getDepositAddress(request: {
    profileId: string;
    poolId: string;
    asset: string;
    action: SupplyAction;
  }): Promise<string> {
    if (!isEthStablecoin(request.asset, Chain.ETH)) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "getDepositAddress is only supported for ETH stablecoins"
      );
    }

    const tokenAddress = getEthStablecoinContractAddress(request.asset);
    const subaccount = encodeInflowSubaccount({
      action: request.action,
      principal: Principal.fromText(request.profileId),
    });

    const result = await createDepositAccountsActor(
      this.canisterContext
    ).get_deposit_address(
      {
        owner: Principal.fromText(request.poolId),
        subaccount: [subaccount],
      },
      [tokenAddress]
    );

    if ("Err" in result) {
      throw mapDepositAccountErrorToLiquidiumError(result.Err);
    }

    return result.Ok;
  }

  /**
   * Estimates the network/deposit fee for an inflow target.
   *
   * ETH stablecoin deposit-address estimates are served by the deposit-address
   * canister. BTC estimates are not exposed by this SDK yet and return zero.
   */
  async estimateInflowFee(
    request: EstimateInflowFeeRequest
  ): Promise<InflowFeeEstimate> {
    if (isEthStablecoin(request.asset, request.chain)) {
      const result = await createDepositAccountsActor(
        this.canisterContext
      ).estimate_deposit_fee([getEthStablecoinContractAddress(request.asset)]);

      if ("Err" in result) {
        throw mapDepositAccountErrorToLiquidiumError(result.Err);
      }

      return { totalFee: result.Ok };
    }

    if (request.asset === Asset.BTC && request.chain === Chain.BTC) {
      return { totalFee: 0n };
    }

    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Inflow fee estimates are not supported for ${request.asset} on ${request.chain}`
    );
  }

  private async sendAndSubmitNativeSupplyInflow(params: {
    request: SupplyFlowRequest;
    instruction: SupplyInstruction;
    defaultSubmitInflowRequest?: Omit<SubmitInflowRequest, "txid">;
  }): Promise<string> {
    const { request, instruction, defaultSubmitInflowRequest } = params;

    if (instruction.target.type !== "nativeAddress") {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed supply requires a native-address target"
      );
    }

    if (!request.walletAdapter) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed supply requires a wallet adapter"
      );
    }

    const account = request.account?.trim();
    if (!account) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed transfer supply requires an account"
      );
    }

    if (!request.amount || request.amount <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed supply requires a positive amount"
      );
    }

    const txid = await this.sendNativeSupplyTransaction({
      walletAdapter: request.walletAdapter,
      chain: instruction.chain,
      toAddress: instruction.target.address,
      amount: request.amount,
      senderAccount: account,
      asset: instruction.asset,
      action: request.action,
    });

    if (
      !(instruction.asset === Asset.USDT && instruction.chain === Chain.ETH)
    ) {
      await this.submitInflowWithRetry(txid, defaultSubmitInflowRequest);
    }

    return txid;
  }

  private async executeContractSupply(params: {
    request: SupplyFlowRequest;
    instruction: SupplyInstruction;
    defaultSubmitInflowRequest?: Omit<SubmitInflowRequest, "txid">;
  }): Promise<string> {
    const { request, instruction, defaultSubmitInflowRequest } = params;

    if (
      instruction.target.type !== "icrcAccount" ||
      instruction.chain !== Chain.ETH
    ) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply is only supported for ETH ICRC-account targets"
      );
    }

    const walletAddressInput = request.account?.trim();
    if (!walletAddressInput) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply requires an account"
      );
    }
    const walletAddress = normalizeAndValidateEvmAddress(
      walletAddressInput,
      "Invalid EVM wallet address"
    );

    if (!request.amount || request.amount <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply requires a positive amount"
      );
    }

    const walletAdapter = request.walletAdapter;
    if (!walletAdapter?.sendEthTransaction) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply requires an ETH wallet adapter"
      );
    }

    this.requireApi();
    this.requireEvmReadClient(
      "Contract-interaction supply requires an EVM RPC URL or public client"
    );

    const evmSupplyContext = await this.getEvmSupplyContextForPool({
      request: {
        profileId: request.profileId,
        poolId: request.poolId,
        walletAddress,
        amount: request.amount,
        action: request.action,
      },
      asset: instruction.asset,
      chain: instruction.chain,
    });
    const supplyAmount = BigInt(evmSupplyContext.amount);

    if (BigInt(evmSupplyContext.balance) < supplyAmount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.INSUFFICIENT_FUNDS,
        `Insufficient ${evmSupplyContext.asset} balance for ${request.action}`
      );
    }

    if (
      evmSupplyContext.approvalStrategy ===
      EvmSupplyApprovalStrategy.resetThenApproveMax
    ) {
      await this.sendEthContractTransaction(
        walletAdapter,
        walletAddress,
        createApproveTransaction({
          tokenAddress: evmSupplyContext.tokenAddress,
          spenderAddress: evmSupplyContext.spenderAddress,
          amount: 0n,
        }),
        `supply-${request.action}-approve-reset`
      );

      await this.waitForExpectedAllowance({
        walletAddress,
        tokenAddress: evmSupplyContext.tokenAddress,
        spenderAddress: evmSupplyContext.spenderAddress,
        amount: supplyAmount,
        expectation: "zero",
      });
    }

    if (evmSupplyContext.approvalStrategy !== EvmSupplyApprovalStrategy.none) {
      await this.sendEthContractTransaction(
        walletAdapter,
        walletAddress,
        createApproveTransaction({
          tokenAddress: evmSupplyContext.tokenAddress,
          spenderAddress: evmSupplyContext.spenderAddress,
          amount: MAX_UINT256,
        }),
        `supply-${request.action}-approve-max`
      );

      await this.waitForExpectedAllowance({
        walletAddress,
        tokenAddress: evmSupplyContext.tokenAddress,
        spenderAddress: evmSupplyContext.spenderAddress,
        amount: supplyAmount,
        expectation: "sufficient",
      });
    }

    const depositTxid = await this.sendEthContractTransaction(
      walletAdapter,
      walletAddress,
      createDepositErc20Transaction({
        depositContractAddress: evmSupplyContext.depositContractAddress,
        tokenAddress: evmSupplyContext.tokenAddress,
        amount: supplyAmount,
        poolId: request.poolId,
        profileId: request.profileId,
        destinationAccount: instruction.target.account,
        action: request.action,
      }),
      `supply-${request.action}-deposit-erc20`
    );

    await this.submitInflowWithRetry(depositTxid, defaultSubmitInflowRequest);

    return depositTxid;
  }

  private async sendNativeSupplyTransaction(params: {
    walletAdapter: Pick<
      WalletAdapter,
      "sendBtcTransaction" | "sendEthTransaction"
    >;
    chain: string;
    asset: string;
    toAddress: string;
    amount: bigint;
    senderAccount: string;
    action: SupplyAction;
  }): Promise<string> {
    switch (params.chain) {
      case Chain.BTC: {
        if (!params.walletAdapter.sendBtcTransaction) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "BTC wallet adapter does not support transaction sending"
          );
        }

        return await params.walletAdapter.sendBtcTransaction({
          chain: Chain.BTC,
          toAddress: params.toAddress,
          amountSats: params.amount,
          account: params.senderAccount,
          actionType: `supply-${params.action}`,
          transferMode: TransferMode.native,
        });
      }
      case Chain.ETH: {
        if (!params.walletAdapter.sendEthTransaction) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "ETH wallet adapter does not support transaction sending"
          );
        }

        if (isEthStablecoin(params.asset, params.chain)) {
          return await params.walletAdapter.sendEthTransaction({
            chain: Chain.ETH,
            account: params.senderAccount,
            actionType: `supply-${params.action}`,
            transferMode: TransferMode.native,
            transaction: createTransferErc20Transaction({
              tokenAddress: getEthStablecoinContractAddress(params.asset),
              recipientAddress: params.toAddress,
              amount: params.amount,
            }),
          });
        }

        return await params.walletAdapter.sendEthTransaction({
          chain: Chain.ETH,
          account: params.senderAccount,
          actionType: `supply-${params.action}`,
          transferMode: TransferMode.native,
          transaction: {
            to: params.toAddress,
            value: params.amount.toString(),
          },
        });
      }
      default:
        throw new LiquidiumError(
          LiquidiumErrorCode.VALIDATION_ERROR,
          `Native-address wallet execution is not supported for ${params.chain}`
        );
    }
  }

  private async submitInflowWithRetry(
    txid: string,
    extraRequest?: Omit<SubmitInflowRequest, "txid">
  ): Promise<void> {
    await retryWithBackoff({
      execute: async () => {
        await this.submitInflow({ txid, ...extraRequest });
      },
      maxAttempts: SUBMIT_INFLOW_MAX_ATTEMPTS,
      initialRetryDelayMs: SUBMIT_INFLOW_INITIAL_RETRY_DELAY_MS,
      backoffMultiplier: SUBMIT_INFLOW_RETRY_BACKOFF_MULTIPLIER,
      shouldRetryError: isRetriableInflowSubmitError,
    });
  }

  /**
   * Submits an inflow transaction id for faster indexing.
   *
   * Uses the Liquidium SDK API.
   *
   * @param request - Broadcast `txid` plus optional `chain` and inflow `type`.
   * @returns Acknowledgement including the submitted `txid`.
   */
  async submitInflow(
    request: SubmitInflowRequest
  ): Promise<SubmitInflowResponse> {
    const apiClient = this.requireApi();

    return await apiClient.post<SubmitInflowResponse, SubmitInflowRequest>(
      SdkApiPath.inflow,
      request
    );
  }

  /**
   * Returns whether borrowing is currently disabled by the protocol.
   *
   * @returns `true` when the lending canister reports borrowing disabled.
   */
  async isBorrowingDisabled(): Promise<boolean> {
    try {
      return await createLendingActor(
        this.canisterContext
      ).get_borrowing_disabled();
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError(
        "get_borrowing_disabled",
        error
      );
    }
  }

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Lending API actions require an API client"
      );
    }

    return this.apiClient;
  }

  private requireEvmReadClient(message: string): EvmReadClient {
    if (!this.evmReadClient) {
      throw new LiquidiumError(LiquidiumErrorCode.VALIDATION_ERROR, message);
    }

    return this.evmReadClient;
  }

  private async getPoolById(poolId: string): Promise<LendingPoolRecord> {
    const pools = await createLendingActor(this.canisterContext).list_pools();
    const selectedPool = pools.find(
      (pool) => pool.principal.toText() === poolId
    );

    if (!selectedPool) {
      throw new LiquidiumError(
        LiquidiumErrorCode.POOL_NOT_FOUND,
        `Pool not found: ${poolId}`
      );
    }

    return selectedPool;
  }

  private async sendEthContractTransaction(
    walletAdapter: Pick<WalletAdapter, "sendEthTransaction">,
    walletAddress: string,
    request: { to: string; data: string },
    actionType: string
  ): Promise<string> {
    if (!walletAdapter.sendEthTransaction) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "ETH wallet adapter does not support transaction sending"
      );
    }

    return await walletAdapter.sendEthTransaction({
      chain: Chain.ETH,
      account: walletAddress,
      actionType,
      transferMode: TransferMode.native,
      transaction: request,
    });
  }

  private async waitForExpectedAllowance(params: {
    walletAddress: string;
    tokenAddress: string;
    spenderAddress: string;
    amount: bigint;
    expectation: "zero" | "sufficient";
  }): Promise<void> {
    const evmReadClient = this.requireEvmReadClient(
      "Contract-interaction supply requires an EVM RPC URL or public client"
    );
    let lastPollingError: unknown;

    for (
      let pollIndex = 0;
      pollIndex < ETH_APPROVAL_MAX_POLLS;
      pollIndex += 1
    ) {
      try {
        const allowance = await readErc20Allowance({
          evmReadClient,
          tokenAddress: params.tokenAddress,
          ownerAddress: params.walletAddress,
          spenderAddress: params.spenderAddress,
        });
        const matchesExpectation =
          params.expectation === "zero"
            ? allowance === 0n
            : allowance >= params.amount;

        if (matchesExpectation) {
          return;
        }
      } catch (error) {
        lastPollingError = error;
      }

      await delay(ETH_APPROVAL_POLL_INTERVAL_MS);
    }

    const lastPollingErrorMessage = getUnknownErrorMessage(lastPollingError);
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      lastPollingErrorMessage
        ? `Timed out waiting for ${params.expectation} ETH allowance update. Last polling error: ${lastPollingErrorMessage}`
        : `Timed out waiting for ${params.expectation} ETH allowance update`
    );
  }
}

async function readErc20Allowance(params: {
  evmReadClient: EvmReadClient;
  tokenAddress: string;
  ownerAddress: string;
  spenderAddress: string;
}): Promise<bigint> {
  const allowance = await params.evmReadClient.readContract({
    address: params.tokenAddress as EvmAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [
      params.ownerAddress as EvmAddress,
      params.spenderAddress as EvmAddress,
    ],
  });

  return BigInt(allowance);
}

async function readErc20Balance(params: {
  evmReadClient: EvmReadClient;
  tokenAddress: string;
  ownerAddress: string;
}): Promise<bigint> {
  const balance = await params.evmReadClient.readContract({
    address: params.tokenAddress as EvmAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [params.ownerAddress as EvmAddress],
  });

  return BigInt(balance);
}

function getApprovalStrategy(params: {
  allowance: bigint;
  amount: bigint;
}): EvmSupplyApprovalStrategy {
  if (params.allowance >= params.amount) {
    return EvmSupplyApprovalStrategy.none;
  }

  if (params.allowance === 0n) {
    return EvmSupplyApprovalStrategy.approveMax;
  }

  return EvmSupplyApprovalStrategy.resetThenApproveMax;
}

function normalizeAndValidateEvmAddress(
  address: string,
  errorMessage: string
): EvmAddress {
  if (!isAddress(address)) {
    throw new LiquidiumError(LiquidiumErrorCode.INVALID_ADDRESS, errorMessage);
  }

  return getAddress(address) as EvmAddress;
}

async function delay(timeoutMs: number): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
}

function isRetriableInflowSubmitError(error: unknown): boolean {
  if (!(error instanceof LiquidiumError)) {
    return false;
  }

  return error.code === LiquidiumErrorCode.SERVICE_UNAVAILABLE;
}

function getUnknownErrorMessage(error: unknown): string | null {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return null;
}

function getDefaultSubmitInflowRequest(params: {
  action: SupplyAction;
  chain: string;
}): Omit<SubmitInflowRequest, "txid"> | undefined {
  if (params.chain !== Chain.BTC && params.chain !== Chain.ETH) {
    return undefined;
  }

  return {
    chain: params.chain,
    type:
      params.action === SupplyAction.repayment
        ? InflowSubmitType.REPAY
        : InflowSubmitType.DEPOSIT,
  };
}
