import { encodeIcrcAccount } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { encodeFunctionData } from "viem";
import { createCkBtcMinterActor } from "../../core/canisters/ckbtc/minter";
import {
  createLendingActor,
  type LendingPoolRecord,
} from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  CK_DEPOSIT_ABI,
  CK_DEPOSIT_CONTRACT_ADDRESS,
  ERC20_ABI,
  MAX_UINT256,
} from "../../core/evm";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import type { SupplyAction } from "../../core/types";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";
import { retryWithBackoff } from "../../core/utils/retry";
import { computeExpiryTimestampFromNow } from "../../core/utils/time";
import { getVariantKey } from "../../core/utils/variant";
import type { WalletAdapter } from "../../core/wallet-actions";
import { executeWith } from "../../execute";
import type {
  BorrowAction,
  BorrowSubmitSignatureInfo,
  CreateBorrowRequest,
  CreateWithdrawRequest,
  EvmSupplyContext,
  GetEvmSupplyContextRequest,
  GetInflowStatusRequest,
  GetInflowStatusResponse,
  IcrcAccountSupplyTarget,
  NativeAddressSupplyTarget,
  OutflowDetails,
  SubmitInflowRequest,
  SubmitInflowResponse,
  SupplyFlow,
  SupplyFlowRequest,
  SupplyInstruction,
  SupplyRequest,
  SupplyTarget,
  SupplyTrackingStatus,
  WithdrawAction,
  WithdrawSubmitSignatureInfo,
} from "./types";

const BITCOIN_BLOCK_TIME_MS = 10 * 60 * 1000;
const SUBMIT_INFLOW_MAX_ATTEMPTS = 4;
const SUBMIT_INFLOW_INITIAL_RETRY_DELAY_MS = 1_500;
const SUBMIT_INFLOW_RETRY_BACKOFF_MULTIPLIER = 2;
const ETH_APPROVAL_POLL_INTERVAL_MS = 2_000;
const ETH_APPROVAL_MAX_POLLS = 30;

type LendingModuleOptions = {
  supplyStatusPollIntervalMs: number;
};

type WalletChain = "BTC" | "ETH";

type WalletExecutionParams = {
  signerChain: WalletChain;
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

type MessageAccount = {
  type: "Native" | "External";
  data: string;
};

type OutflowMessageRequest = {
  pool_id: string;
  amount: string;
  account: MessageAccount;
  expiry_timestamp: bigint;
};

type LendingChainVariant = { BTC: null } | { ETH: null };

type CanisterOutflowReceiver = { Native: Principal } | { External: string };

type CanisterOutflowRecord = {
  id: string;
  txid: [] | [string];
  outflow_type: Record<string, null>;
  outflow_ref: [] | [string];
  amount: bigint;
  receiver: CanisterOutflowReceiver;
};

export class LendingModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined,
    readonly options: LendingModuleOptions
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
        kind: "create-withdraw",
        executionKind: "sign-message",
        actionType: "create-withdraw",
        transferMode: "native",
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
        kind: "create-borrow",
        executionKind: "sign-message",
        actionType: "create-borrow",
        transferMode: "native",
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
   * Creates a tracked supply flow for a deposit or repayment.
   *
   * This resolves a deposit address target and returns helpers for txid
   * submission and status tracking. The SDK resolves the pool's supply
   * mechanism automatically, then either returns a transfer target or executes
   * the required contract interaction when a wallet adapter is provided.
   *
   * @param request - When `walletAdapter`, `account`, and `amount` are set, the SDK may
   *   broadcast the transfer or contract-interaction transactions automatically.
   *   Contract-interaction paths require `apiBaseUrl` on the client.
   * @returns A {@link SupplyFlow} with `type` `"transfer"` or `"contractInteraction"`,
   *   plus `submit`, `getStatus`, and `watchStatus`.
   */
  async supply(request: SupplyFlowRequest): Promise<SupplyFlow> {
    const instruction = await this.prepareSupply(request);
    const mechanism = resolveSupplyMechanism({
      asset: instruction.asset,
      chain: instruction.chain,
    });
    const defaultSubmitInflowRequest = getDefaultSubmitInflowRequest({
      action: request.action,
      chain: mechanism === "contractInteraction" ? "ETH" : instruction.chain,
    });
    const flow = this.createSupplyFlow({
      type: mechanism,
      profileId: request.profileId,
      instruction,
      defaultSubmitInflowRequest,
    });

    switch (mechanism) {
      case "transfer":
        if (request.walletAdapter) {
          flow.setTrackedTxid(
            await this.sendAndSubmitNativeSupplyInflow({
              request,
              instruction,
              defaultSubmitInflowRequest,
            })
          );
        }
        break;
      case "contractInteraction":
        flow.setTrackedTxid(
          await this.executeContractSupply({
            request,
            instruction,
            defaultSubmitInflowRequest,
          })
        );
        break;
    }

    return flow;
  }

  private createSupplyFlow(params: {
    type: SupplyFlow["type"];
    profileId: string;
    instruction: SupplyInstruction;
    defaultSubmitInflowRequest?: Omit<SubmitInflowRequest, "txid">;
  }): SupplyFlow & { setTrackedTxid(txid: string): void } {
    const { type, profileId, instruction, defaultSubmitInflowRequest } = params;
    const defaultPollIntervalMs = this.options.supplyStatusPollIntervalMs;
    let trackedTxid: string | undefined;
    const getStatus = async (
      statusRequest?: SupplyFlow["getStatus"] extends (
        request?: infer T
      ) => Promise<unknown>
        ? T
        : never
    ): Promise<SupplyTrackingStatus | null> => {
      const txid = statusRequest?.txid ?? trackedTxid;
      const statusResponse = await this.getInflowStatus({
        profileId,
        txid,
      });

      const matchedInflow = txid
        ? (statusResponse.inflows.find((inflow) => inflow.txid === txid) ??
          null)
        : (statusResponse.inflows[0] ?? null);

      if (!matchedInflow) {
        return null;
      }

      trackedTxid = matchedInflow.txid;

      return mapBtcInflowToSupplyTrackingStatus(matchedInflow);
    };

    return {
      type,
      instruction,
      target: instruction.target,
      setTrackedTxid(txid: string) {
        trackedTxid = txid;
      },
      submit: async (request) => {
        trackedTxid = request.txid;

        return await this.submitInflow({
          ...defaultSubmitInflowRequest,
          ...request,
        });
      },
      getStatus,
      watchStatus: async function* (
        options?: Parameters<SupplyFlow["watchStatus"]>[0]
      ) {
        const pollIntervalMs = options?.pollIntervalMs ?? defaultPollIntervalMs;
        const signal = options?.signal;
        let nextTxid = options?.txid ?? trackedTxid;

        while (true) {
          throwIfAborted(signal);

          const currentStatus = await getStatus({ txid: nextTxid });
          if (currentStatus) {
            nextTxid = currentStatus.txid;
            trackedTxid = currentStatus.txid;

            yield {
              ...currentStatus,
            };

            if (currentStatus.isAvailable) {
              return;
            }
          }

          await delay(pollIntervalMs, signal);
        }
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
      profileId: request.profileId,
      poolId: request.poolId,
      walletAddress: request.walletAddress,
      amount: request.amount.toString(),
      action: request.action,
    });

    return await apiClient.get<EvmSupplyContext>(
      `/v1/evm/supply-context?${query.toString()}`
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
      instruction.chain !== "ETH"
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

    if (evmSupplyContext.approvalStrategy === "reset-then-approve-max") {
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

    if (evmSupplyContext.approvalStrategy !== "none") {
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
      case "BTC": {
        if (!params.walletAdapter.sendBtcTransaction) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "BTC wallet adapter does not support transaction sending"
          );
        }

        return await params.walletAdapter.sendBtcTransaction({
          chain: "BTC",
          toAddress: params.toAddress,
          amountSats: params.amount,
          account: params.senderAccount,
          actionType: `supply-${params.action}`,
          transferMode: "native",
        });
      }
      case "ETH": {
        if (!params.walletAdapter.sendEthTransaction) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "ETH wallet adapter does not support transaction sending"
          );
        }

        return await params.walletAdapter.sendEthTransaction({
          chain: "ETH",
          account: params.senderAccount,
          actionType: `supply-${params.action}`,
          transferMode: "native",
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
      shouldRetryError: isRetriableInflowNotFoundError,
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
      "/v1/inflow",
      request
    );
  }

  /**
   * Returns the current inflow status for a profile, optionally filtered by txid.
   *
   * Requires `apiBaseUrl` on the client.
   *
   * @param request - `profileId` and optional `txid` filter.
   * @returns Matching inflow rows from the SDK API.
   */
  async getInflowStatus(
    request: GetInflowStatusRequest
  ): Promise<GetInflowStatusResponse> {
    const apiClient = this.requireApi();
    const query = new URLSearchParams({
      profileId: request.profileId,
    });

    if (request.txid) {
      query.set("txid", request.txid);
    }

    return await apiClient.get<GetInflowStatusResponse>(
      `/v1/inflow-status?${query.toString()}`
    );
  }

  /**
   * Returns the configured deposit fee.
   *
   * @returns Deposit fee in protocol units.
   *
   * @remarks Not implemented yet; currently throws with `LiquidiumErrorCode.INTERNAL`.
   */
  async getDepositFee(): Promise<bigint> {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
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
      case "transfer":
        return await this.getNativeAddressSupplyTarget(request.profileId, {
          poolId: request.poolId,
          asset,
          chain,
          action: request.action,
        });
      case "contractInteraction":
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
      chain: "ETH",
      account: walletAddress,
      actionType,
      transferMode: "native",
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

function mapBtcInflowToSupplyTrackingStatus(
  inflow: GetInflowStatusResponse["inflows"][number]
): SupplyTrackingStatus {
  const remainingConfirmations =
    inflow.confirmations === null
      ? inflow.requiredConfirmations
      : Math.max(inflow.requiredConfirmations - inflow.confirmations, 0);
  const estimatedMsUntilAvailable =
    remainingConfirmations * BITCOIN_BLOCK_TIME_MS;

  return {
    txid: inflow.txid,
    inflowId: inflow.inflowId,
    poolId: inflow.poolId,
    type: inflow.type,
    stage: inflow.stage,
    amountSats: inflow.amountSats,
    timestampMs: inflow.timestampMs,
    confirmations: inflow.confirmations,
    requiredConfirmations: inflow.requiredConfirmations,
    remainingConfirmations,
    isDetected: inflow.stage !== "LOGGED",
    isAvailable: inflow.stage === "CONFIRMED",
    estimatedMsUntilAvailable,
    expectedAvailableAtMs: Date.now() + estimatedMsUntilAvailable,
  };
}

async function delay(timeoutMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", abortListener);
      resolve();
    }, timeoutMs);

    function abortListener(): void {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abortListener);
      reject(signal?.reason ?? new DOMException("Aborted", "AbortError"));
    }

    signal?.addEventListener("abort", abortListener, { once: true });
  });
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException("Aborted", "AbortError");
  }
}

function isRetriableInflowNotFoundError(error: unknown): boolean {
  if (!(error instanceof LiquidiumError)) {
    return false;
  }

  if (error.code !== LiquidiumErrorCode.SERVICE_UNAVAILABLE) {
    return false;
  }

  return /not found/i.test(error.message);
}

function getDefaultSubmitInflowRequest(params: {
  action: SupplyAction;
  chain: string;
}): Omit<SubmitInflowRequest, "txid"> | undefined {
  if (params.chain !== "ETH") {
    return undefined;
  }

  return {
    chain: "ETH",
    type: params.action === "repayment" ? "REPAY" : "DEPOSIT",
  };
}

function resolveSupplyMechanism(params: {
  asset: string;
  chain: string;
}): SupplyMechanism {
  if (params.asset === "BTC" && params.chain === "BTC") {
    return "transfer";
  }

  if (
    (params.asset === "USDC" || params.asset === "USDT") &&
    params.chain === "ETH"
  ) {
    return "contractInteraction";
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
  if (asset === "BTC" && chain === "BTC") {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Native address inflow targets are not supported for ${asset} on ${chain}`
  );
}

function assertSupportsIcrcAccountInflowTarget(asset: string): void {
  if (asset === "BTC" || asset === "USDT" || asset === "USDC") {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `ICRC account inflow targets are not supported for ${asset}`
  );
}

function createApproveTransaction(params: {
  tokenAddress: string;
  spenderAddress: string;
  amount: bigint;
}): { to: string; data: string } {
  return {
    to: params.tokenAddress,
    data: encodeFunctionData({
      abi: ERC20_ABI,
      functionName: "approve",
      args: [params.spenderAddress as `0x${string}`, params.amount],
    }),
  };
}

function createDepositErc20Transaction(params: {
  tokenAddress: string;
  amount: bigint;
  poolId: string;
  profileId: string;
  destinationAccount: string;
  action: SupplyAction;
}): { to: string; data: string } {
  const expectedDestinationAccount = encodeIcrcAccount({
    owner: Principal.fromText(params.poolId),
    subaccount: encodeInflowSubaccount({
      action: params.action,
      principal: Principal.fromText(params.profileId),
    }),
  });

  if (params.destinationAccount !== expectedDestinationAccount) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "ETH supply destination account does not match the expected inflow account"
    );
  }

  const principalBytes32 = encodePrincipalToBytes32(
    Principal.fromText(params.poolId)
  );
  const subaccountHex = encodeBytes32Hex(
    encodeInflowSubaccount({
      action: params.action,
      principal: Principal.fromText(params.profileId),
    })
  );

  return {
    to: CK_DEPOSIT_CONTRACT_ADDRESS,
    data: encodeFunctionData({
      abi: CK_DEPOSIT_ABI,
      functionName: "depositErc20",
      args: [
        params.tokenAddress as `0x${string}`,
        params.amount,
        principalBytes32,
        subaccountHex,
      ],
    }),
  };
}

function encodePrincipalToBytes32(principal: Principal): `0x${string}` {
  const principalBytes = principal.toUint8Array();
  if (principalBytes.length > 29) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Principal length exceeds Ethereum bytes32 capacity"
    );
  }

  const fixedBytes = new Uint8Array(32);
  fixedBytes[0] = principalBytes.length;
  fixedBytes.set(principalBytes, 1);

  return encodeBytes32Hex(fixedBytes);
}

function encodeBytes32Hex(bytes: Uint8Array): `0x${string}` {
  return `0x${Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("")}`;
}

function createBorrowAssetMessage(
  request: OutflowMessageRequest,
  nonce: bigint
): string {
  return `Liquidium: Borrow Assets

Action: Borrow from pool
Pool ID: ${request.pool_id}
Amount: ${request.amount}
${accountTypeToString(request.account)}
Expires: ${request.expiry_timestamp}
Nonce: ${nonce}`;
}

function createWithdrawAssetMessage(
  request: OutflowMessageRequest,
  nonce: bigint
): string {
  return `Liquidium: Withdraw Assets

Action: Withdraw from pool
Pool ID: ${request.pool_id}
Amount: ${request.amount}
${accountTypeToString(request.account)}
Expires: ${request.expiry_timestamp}
Nonce: ${nonce}`;
}

function accountTypeToString(accountType: MessageAccount): string {
  switch (accountType.type) {
    case "External":
      return `Address:${accountType.data}`;
    case "Native":
      return `Principal:${accountType.data}`;
  }
}

function mapWalletChainToLendingChain(chain: WalletChain): LendingChainVariant {
  switch (chain) {
    case "BTC":
      return { BTC: null };
    case "ETH":
      return { ETH: null };
  }
}

function mapCanisterOutflowDetails(
  outflow: CanisterOutflowRecord
): OutflowDetails {
  const rawOutflowType = getVariantKey(outflow.outflow_type);

  return {
    id: outflow.id,
    outflowType: normalizeOutflowType(rawOutflowType),
    outflowRef: outflow.outflow_ref[0],
    txid: outflow.txid[0],
    amount: outflow.amount,
    receiver: mapCanisterAccountType(outflow.receiver),
  };
}

function normalizeOutflowType(
  rawOutflowType: string
): OutflowDetails["outflowType"] {
  switch (rawOutflowType) {
    case "Withdraw":
      return "withdraw";
    case "Borrow":
      return "borrow";
    case "FeeClaim":
      return "feeClaim";
    default:
      throw new Error(`Unsupported outflow type: ${rawOutflowType}`);
  }
}

function mapCanisterAccountType(
  receiver: CanisterOutflowReceiver
): OutflowDetails["receiver"] {
  if ("Native" in receiver) {
    return {
      type: "Native",
      account: receiver.Native.toText(),
    };
  }

  return {
    type: "External",
    account: receiver.External,
  };
}
