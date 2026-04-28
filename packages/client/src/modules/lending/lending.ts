import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { createCkBtcMinterActor } from "../../core/canisters/ckbtc/minter";
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
import { MAX_UINT256 } from "../../core/evm";
import {
  buildEvmSupplyContextPath,
  SdkApiPath,
  SdkApiQueryParam,
} from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import { Asset, Chain, InflowSubmitType, SupplyAction } from "../../core/types";
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
  createApproveTransaction,
  createDepositErc20Transaction,
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
  EvmSupplyApprovalStrategy,
  type EvmSupplyContext,
  type GetEvmSupplyContextRequest,
  type IcrcAccountSupplyTarget,
  type NativeAddressSupplyTarget,
  type OutflowDetails,
  type SubmitInflowRequest,
  type SubmitInflowResponse,
  type SupplyFlow,
  type SupplyFlowRequest,
  type SupplyInstruction,
  SupplyPlanType,
  type SupplyRequest,
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

type SupplyTargetRequest = {
  poolId: string;
  asset: string;
  chain: string;
  action: SupplyAction;
};

type SupplyMechanism = SupplyFlow["type"];

export class LendingModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined
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
   * Prepares supply instructions for a deposit or repayment flow.
   *
   * The returned instruction describes where funds should be sent.
   *
   * @param request - Profile, pool, and supply action.
   * @returns Resolved deposit/repay target and metadata for the pool.
   */
  async prepareSupply(request: SupplyRequest): Promise<SupplyInstruction> {
    const supplyTarget = await this.resolveSupplyTarget(request);

    return {
      poolId: request.poolId,
      asset: supplyTarget.asset,
      chain: supplyTarget.chain,
      action: request.action,
      target: supplyTarget,
    };
  }

  /**
   * Resolves a supply target for a deposit or repayment and optionally broadcasts it.
   *
   * When `walletAdapter`, `account`, and `amount` are provided, the SDK broadcasts
   * the transfer or contract-interaction transactions and returns the resulting
   * `txid` on the receipt. Otherwise the caller broadcasts themselves and uses
   * {@link LendingModule.submitInflow} to register the txid. Contract-interaction
   * paths require `apiBaseUrl` on the client.
   *
   * The SDK does not poll for inflow status. When a `txid` is returned, it is the
   * caller's responsibility to track confirmation state using their own polling.
   *
   * @returns A {@link SupplyFlow} receipt with `type`, `instruction`, `target`,
   *   `submit`, and an optional `txid` present when the SDK broadcast for you.
   */
  async supply(request: SupplyFlowRequest): Promise<SupplyFlow> {
    const instruction = await this.prepareSupply(request);
    const mechanism = resolveSupplyMechanism({
      asset: instruction.asset,
      chain: instruction.chain,
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
      instruction,
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
   * Fetches ERC-20 supply planning data from the SDK API (allowance, approval strategy, deposit calldata inputs).
   *
   * Requires `apiBaseUrl` on the client. Used internally by contract-interaction `supply`.
   *
   * @param request - Profile, pool, wallet, amount (token base units), and action.
   * @returns Backend-computed {@link EvmSupplyContext} for approvals and deposit.
   */
  async getEvmSupplyContext(
    request: GetEvmSupplyContextRequest
  ): Promise<EvmSupplyContext> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams({
      [SdkApiQueryParam.profileId]: request.profileId,
      [SdkApiQueryParam.poolId]: request.poolId,
      [SdkApiQueryParam.walletAddress]: request.walletAddress,
      [SdkApiQueryParam.amount]: request.amount.toString(),
      [SdkApiQueryParam.action]: request.action,
    });

    return await apiClient.get<EvmSupplyContext>(
      buildEvmSupplyContextPath(query)
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
      action: request.action,
    });

    await this.submitInflowWithRetry(txid, defaultSubmitInflowRequest);

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

    const walletAddress = request.account?.trim();
    if (!walletAddress) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply requires an account"
      );
    }

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

    const evmSupplyContext = await this.getEvmSupplyContext({
      profileId: request.profileId,
      poolId: request.poolId,
      walletAddress,
      amount: request.amount,
      action: request.action,
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
        profileId: request.profileId,
        poolId: request.poolId,
        walletAddress,
        amount: supplyAmount,
        action: request.action,
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
        profileId: request.profileId,
        poolId: request.poolId,
        walletAddress,
        amount: supplyAmount,
        action: request.action,
        expectation: "sufficient",
      });
    }

    const depositTxid = await this.sendEthContractTransaction(
      walletAdapter,
      walletAddress,
      createDepositErc20Transaction({
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
   * Requires `apiBaseUrl` on the client.
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
        LiquidiumErrorCode.SERVICE_UNAVAILABLE,
        "Lending API actions require an API base URL in client config"
      );
    }

    return this.apiClient;
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

  private async resolveSupplyTarget(
    request: SupplyRequest
  ): Promise<SupplyTarget> {
    const selectedPool = await this.getPoolById(request.poolId);
    const asset = getVariantKey(selectedPool.asset);
    const chain = getVariantKey(selectedPool.chain);
    const mechanism = resolveSupplyMechanism({
      asset,
      chain,
    });

    switch (mechanism) {
      case SupplyPlanType.transfer:
        return await this.getNativeAddressSupplyTarget(request.profileId, {
          poolId: request.poolId,
          asset,
          chain,
          action: request.action,
        });
      case SupplyPlanType.contractInteraction:
        return this.getIcrcAccountSupplyTarget(request.profileId, {
          poolId: request.poolId,
          asset,
          chain,
          action: request.action,
        });
    }
  }

  private async getNativeAddressSupplyTarget(
    profileId: string,
    request: SupplyTargetRequest
  ): Promise<NativeAddressSupplyTarget> {
    assertSupportsNativeAddressInflowTarget(request.asset, request.chain);

    const configuredBtcPoolId = this.canisterContext.canisterIds.btcPool;
    if (request.poolId !== configuredBtcPoolId) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Native BTC inflow targets require the configured BTC pool ${configuredBtcPoolId}, received ${request.poolId}`
      );
    }

    const subaccount = encodeInflowSubaccount({
      action: request.action,
      principal: Principal.fromText(profileId),
    });
    const address = await createCkBtcMinterActor(
      this.canisterContext
    ).get_btc_address({
      owner: [Principal.fromText(configuredBtcPoolId)],
      subaccount: [subaccount],
    });

    return {
      type: "nativeAddress",
      poolId: request.poolId,
      asset: request.asset,
      chain: request.chain,
      action: request.action,
      address,
    };
  }

  private getIcrcAccountSupplyTarget(
    profileId: string,
    request: SupplyTargetRequest
  ): IcrcAccountSupplyTarget {
    assertSupportsIcrcAccountInflowTarget(request.asset);

    const poolPrincipal = Principal.fromText(request.poolId);
    const subaccount = encodeInflowSubaccount({
      action: request.action,
      principal: Principal.fromText(profileId),
    });

    return {
      type: "icrcAccount",
      poolId: request.poolId,
      asset: request.asset,
      chain: request.chain,
      action: request.action,
      owner: poolPrincipal.toText(),
      subaccount,
      account: encodeIcrcAccount({
        owner: Principal.fromText(poolPrincipal.toText()),
        subaccount,
      }),
    };
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
    profileId: string;
    poolId: string;
    walletAddress: string;
    amount: bigint;
    action: SupplyAction;
    expectation: "zero" | "sufficient";
  }): Promise<void> {
    for (
      let pollIndex = 0;
      pollIndex < ETH_APPROVAL_MAX_POLLS;
      pollIndex += 1
    ) {
      const nextContext = await this.getEvmSupplyContext({
        profileId: params.profileId,
        poolId: params.poolId,
        walletAddress: params.walletAddress,
        amount: params.amount,
        action: params.action,
      });
      const allowance = BigInt(nextContext.allowance);
      const matchesExpectation =
        params.expectation === "zero"
          ? allowance === 0n
          : allowance >= params.amount;

      if (matchesExpectation) {
        return;
      }

      await delay(ETH_APPROVAL_POLL_INTERVAL_MS);
    }

    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      `Timed out waiting for ${params.expectation} ETH allowance update`
    );
  }
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

function resolveSupplyMechanism(params: {
  asset: string;
  chain: string;
}): SupplyMechanism {
  if (params.asset === Asset.BTC && params.chain === Chain.BTC) {
    return SupplyPlanType.transfer;
  }

  if (
    (params.asset === Asset.USDC || params.asset === Asset.USDT) &&
    params.chain === Chain.ETH
  ) {
    return SupplyPlanType.contractInteraction;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `No supply mechanism is configured for ${params.asset} on ${params.chain}`
  );
}

function assertSupportsNativeAddressInflowTarget(
  asset: string,
  chain: string
): void {
  if (asset === Asset.BTC && chain === Chain.BTC) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Native address inflow targets are not supported for ${asset} on ${chain}`
  );
}

function assertSupportsIcrcAccountInflowTarget(asset: string): void {
  if (asset === Asset.BTC || asset === Asset.USDT || asset === Asset.USDC) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `ICRC account inflow targets are not supported for ${asset}`
  );
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
