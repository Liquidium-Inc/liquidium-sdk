import { decodeIcrcAccountAddress } from "../../../core/accounts";
import {
  type EvmAddress,
  normalizeAndValidateEvmAddress,
} from "../../../core/address-validation";
import { getDepositAmountMinimumValidationError } from "../../../core/deposit-minimums";
import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import {
  CK_ETH_DEPOSIT_CONTRACT_ADDRESS,
  ERC20_ABI,
  MAX_UINT256,
} from "../../../core/evm";
import { getPoolLedgerAssetRoute } from "../../../core/pool-ledger-assets";
import { createLiquidiumStatus } from "../../../core/status";
import type { CanisterContext } from "../../../core/transports/canister-context";
import {
  Asset,
  Chain,
  type EvmReadClient,
  SupplyAction,
} from "../../../core/types";
import { retryWithBackoff } from "../../../core/utils/retry";
import type {
  EthTransactionRequest,
  IcrcTransferDetails,
  WalletAdapter,
} from "../../../core/wallet-actions";
import {
  createApproveTransaction,
  createDepositErc20Transaction,
  createDepositEthTransaction,
  createTransferErc20Transaction,
} from "../evm-transactions";
import type {
  ContractInteractionSupplyFlowRequest,
  EvmSupplyApprovalStrategy,
  EvmSupplyContext,
  GetEvmSupplyContextRequest,
  InflowOperation,
  SubmitInflowRequest,
  SubmitInflowResponse,
  SubmitSupplyFlowInflowRequest,
  SupplyFlow,
  SupplyFlowRequest,
  SupplyPlanType,
  SupplyTarget,
  WalletTransferSupplyFlowRequest,
} from "../types";
import {
  EvmSupplyApprovalStrategy as ApprovalStrategy,
  SupplyPlanType as PlanType,
} from "../types";
import {
  getEthStablecoinContractAddress,
  getPoolById,
  isEthStablecoin,
  resolveSupplyTargetForPool,
} from "./supply-targets";

const SUBMIT_INFLOW_MAX_ATTEMPTS = 4;
const SUBMIT_INFLOW_INITIAL_RETRY_DELAY_MS = 1_500;
const SUBMIT_INFLOW_RETRY_BACKOFF_MULTIPLIER = 2;
const ETH_APPROVAL_POLL_INTERVAL_MS = 2_000;
const ETH_APPROVAL_MAX_POLLS = 30;
type SubmitInflowDefaults = Omit<SubmitInflowRequest, "txid">;
type AllowanceExpectation = "zero" | "sufficient";

interface SupplyFlowExecutorParams {
  canisterContext: CanisterContext;
  evmReadClient: EvmReadClient | undefined;
  requireApi(): void;
  submitInflow(request: SubmitInflowRequest): Promise<SubmitInflowResponse>;
}

interface GetEvmSupplyContextForPoolParams {
  request: GetEvmSupplyContextRequest;
  asset: string;
  chain: string;
}

interface SendAndSubmitTransferSupplyInflowParams {
  request: WalletTransferSupplyFlowRequest;
  target: SupplyTarget;
  defaultSubmitInflowRequest: SubmitInflowDefaults | null;
}

interface SubmitSupplyFlowInflowParams {
  target: SupplyTarget;
  mechanism: SupplyPlanType;
  defaultSubmitInflowRequest: SubmitInflowDefaults | null;
  submitRequest: SubmitSupplyFlowInflowRequest;
}

interface ExecuteContractSupplyParams {
  request: ContractInteractionSupplyFlowRequest;
  target: SupplyTarget;
  defaultSubmitInflowRequest: SubmitInflowDefaults | null;
}

interface SendChainAddressSupplyTransactionParams {
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
}

interface SendIcrcSupplyTransactionParams {
  walletAdapter: Pick<WalletAdapter, "sendIcrcTransfer">;
  asset: Asset;
  chain: typeof Chain.ICP;
  transfer: IcrcTransferDetails;
  senderAccount: string;
  action: SupplyAction;
}

interface WaitForExpectedAllowanceParams {
  walletAddress: string;
  tokenAddress: string;
  spenderAddress: string;
  amount: bigint;
  expectation: AllowanceExpectation;
}

interface ReadErc20AllowanceParams {
  evmReadClient: EvmReadClient;
  tokenAddress: string;
  ownerAddress: string;
  spenderAddress: string;
}

interface ReadErc20BalanceParams {
  evmReadClient: EvmReadClient;
  tokenAddress: string;
  ownerAddress: string;
}

interface ApprovalStrategyParams {
  allowance: bigint;
  amount: bigint;
}

interface DefaultSubmitInflowRequestParams {
  action: SupplyAction;
  chain: string;
}

interface ShouldSubmitInflowParams {
  target: SupplyTarget;
  mechanism: SupplyPlanType;
}

export class SupplyFlowExecutor {
  constructor(private readonly params: SupplyFlowExecutorParams) {}

  async create(request: SupplyFlowRequest): Promise<SupplyFlow> {
    const requestedMechanism = request.mechanism ?? null;
    if (
      requestedMechanism !== null &&
      requestedMechanism !== PlanType.transfer &&
      requestedMechanism !== PlanType.contractInteraction
    ) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Unsupported supply mechanism: ${String(requestedMechanism)}`
      );
    }

    if (
      requestedMechanism !== PlanType.contractInteraction &&
      request.walletAdapter === undefined &&
      (request.account !== undefined || request.amount !== undefined)
    ) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed supply requires walletAdapter, account, and amount"
      );
    }

    const selectedPool = await getPoolById(
      this.params.canisterContext,
      request.poolId
    );
    if (
      request.action === SupplyAction.deposit &&
      request.amount !== undefined
    ) {
      const minimumDepositAmountError = getDepositAmountMinimumValidationError({
        amount: request.amount,
        asset: selectedPool.asset,
      });
      if (minimumDepositAmountError) {
        throw new LiquidiumError(
          LiquidiumErrorCode.VALIDATION_ERROR,
          minimumDepositAmountError.message
        );
      }
    }
    const target = await resolveSupplyTargetForPool(
      this.params.canisterContext,
      {
        profileId: request.profileId,
        poolId: request.poolId,
        action: request.action,
        mechanism: requestedMechanism,
        chain: request.chain,
      },
      selectedPool
    );
    const mechanism =
      requestedMechanism === PlanType.contractInteraction
        ? PlanType.contractInteraction
        : PlanType.transfer;
    const defaultSubmitInflowRequest = getDefaultSubmitInflowRequest({
      action: request.action,
      chain:
        mechanism === PlanType.contractInteraction ? Chain.ETH : target.chain,
    });

    let txid: string | undefined;
    switch (mechanism) {
      case PlanType.transfer:
        if (isWalletTransferSupplyRequest(request)) {
          txid = await this.sendAndSubmitTransferSupplyInflow({
            request,
            target,
            defaultSubmitInflowRequest,
          });
        }
        break;
      case PlanType.contractInteraction:
        if (!isContractInteractionSupplyRequest(request)) {
          throw new LiquidiumError(
            LiquidiumErrorCode.VALIDATION_ERROR,
            "Contract-interaction supply requires contract-interaction request fields"
          );
        }

        txid = await this.executeContractSupply({
          request,
          target,
          defaultSubmitInflowRequest,
        });
        break;
    }

    return {
      type: mechanism,
      target,
      txid,
      status: createLiquidiumStatus({
        operation: mapSupplyActionToStatusOperation(request.action),
        state: txid ? "confirming" : "action_required",
      }),
      submit: async (submitRequest) => {
        return await this.submitSupplyFlowInflow({
          target,
          mechanism,
          defaultSubmitInflowRequest,
          submitRequest,
        });
      },
    };
  }

  async getEvmSupplyContext(
    request: GetEvmSupplyContextRequest
  ): Promise<EvmSupplyContext> {
    const selectedPool = await getPoolById(
      this.params.canisterContext,
      request.poolId
    );

    return await this.getEvmSupplyContextForPool({
      request,
      asset: selectedPool.asset,
      chain: selectedPool.chain,
    });
  }

  private async getEvmSupplyContextForPool(
    params: GetEvmSupplyContextForPoolParams
  ): Promise<EvmSupplyContext> {
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
      requiresApproval: approvalStrategy !== ApprovalStrategy.none,
      approvalStrategy,
    };
  }

  private async sendAndSubmitTransferSupplyInflow(
    params: SendAndSubmitTransferSupplyInflowParams
  ): Promise<string> {
    const { request, target, defaultSubmitInflowRequest } = params;

    if (!request.walletAdapter) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed supply requires a wallet adapter"
      );
    }

    const accountInput = request.account?.trim();
    if (!accountInput) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed transfer supply requires an account"
      );
    }
    const senderAccount =
      target.chain === Chain.ETH
        ? normalizeAndValidateEvmAddress(
            accountInput,
            "Invalid EVM wallet address"
          )
        : accountInput;

    if (!request.amount || request.amount <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Wallet-executed supply requires a positive amount"
      );
    }

    const txid =
      target.chain === Chain.ICP
        ? await this.sendIcrcSupplyTransaction({
            walletAdapter: request.walletAdapter,
            asset: target.asset,
            chain: target.chain,
            transfer: {
              ledgerCanisterId:
                getPoolLedgerAssetRoute(target).ledgerCanisterId,
              to: decodeIcrcAccountAddress(target.address).account,
              amount: request.amount,
            },
            senderAccount,
            action: request.action,
          })
        : await this.sendChainAddressSupplyTransaction({
            walletAdapter: request.walletAdapter,
            chain: target.chain,
            toAddress: target.address,
            amount: request.amount,
            senderAccount,
            asset: target.asset,
            action: request.action,
          });

    if (shouldSubmitInflow({ target, mechanism: PlanType.transfer })) {
      try {
        await this.submitInflowWithRetry(txid, defaultSubmitInflowRequest);
      } catch {
        // The transfer is already broadcast and cannot be rolled back.
        // Return the txid so callers can track it even if the indexing hint fails.
      }
    }

    return txid;
  }

  private async submitSupplyFlowInflow(
    params: SubmitSupplyFlowInflowParams
  ): Promise<SubmitInflowResponse> {
    if (!shouldSubmitInflow(params)) {
      return {
        txid: params.submitRequest.txid,
      };
    }

    const defaultSubmitInflowRequest = params.defaultSubmitInflowRequest;
    if (!defaultSubmitInflowRequest) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Supply flow submit requires an inflow operation"
      );
    }

    return await this.params.submitInflow({
      ...defaultSubmitInflowRequest,
      ...params.submitRequest,
    });
  }

  private async executeContractSupply(
    params: ExecuteContractSupplyParams
  ): Promise<string> {
    const { request, target, defaultSubmitInflowRequest } = params;

    if (
      target.chain !== Chain.ETH ||
      (target.asset !== Asset.ETH &&
        !isEthStablecoin(target.asset, target.chain))
    ) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply is only supported for native ETH and ETH stablecoin targets"
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

    if (request.amount > MAX_UINT256) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply amount exceeds uint256 maximum"
      );
    }

    const walletAdapter = request.walletAdapter;
    if (!walletAdapter?.sendEthTransaction) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Contract-interaction supply requires an ETH wallet adapter"
      );
    }

    this.params.requireApi();

    if (target.asset === Asset.ETH) {
      const depositTxid = await this.sendEthContractTransaction(
        walletAdapter,
        walletAddress,
        createDepositEthTransaction({
          depositContractAddress: CK_ETH_DEPOSIT_CONTRACT_ADDRESS,
          amount: request.amount,
          poolId: request.poolId,
          profileId: request.profileId,
          destinationAccount: target.address,
          action: request.action,
        }),
        `supply-${request.action}-deposit-eth`
      );

      await this.registerContractSupplyInflow(
        depositTxid,
        defaultSubmitInflowRequest
      );

      return depositTxid;
    }

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
      asset: target.asset,
      chain: target.chain,
    });
    const supplyAmount = BigInt(evmSupplyContext.amount);

    if (BigInt(evmSupplyContext.balance) < supplyAmount) {
      throw new LiquidiumError(
        LiquidiumErrorCode.INSUFFICIENT_FUNDS,
        `Insufficient ${evmSupplyContext.asset} balance for ${request.action}`
      );
    }

    if (
      evmSupplyContext.approvalStrategy === ApprovalStrategy.resetThenApproveMax
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

    if (evmSupplyContext.approvalStrategy !== ApprovalStrategy.none) {
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
        destinationAccount: target.address,
        action: request.action,
      }),
      `supply-${request.action}-deposit-erc20`
    );

    await this.registerContractSupplyInflow(
      depositTxid,
      defaultSubmitInflowRequest
    );

    return depositTxid;
  }

  private async registerContractSupplyInflow(
    txid: string,
    defaultSubmitInflowRequest: SubmitInflowDefaults | null
  ): Promise<void> {
    try {
      await this.submitInflowWithRetry(txid, defaultSubmitInflowRequest);
    } catch {
      // The transaction is already broadcast and cannot be rolled back.
    }
  }

  private async sendChainAddressSupplyTransaction(
    params: SendChainAddressSupplyTransactionParams
  ): Promise<string> {
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
          transaction: {
            to: params.toAddress,
            value: params.amount.toString(),
          },
        });
      }
      default:
        throw new LiquidiumError(
          LiquidiumErrorCode.VALIDATION_ERROR,
          `Chain-address wallet execution is not supported for ${params.chain}`
        );
    }
  }

  private async sendIcrcSupplyTransaction(
    params: SendIcrcSupplyTransactionParams
  ): Promise<string> {
    if (!params.walletAdapter.sendIcrcTransfer) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "ICRC wallet adapter does not support ledger transfers"
      );
    }

    const route = getPoolLedgerAssetRoute({
      asset: params.asset,
      chain: params.chain,
    });

    return await params.walletAdapter.sendIcrcTransfer({
      chain: Chain.ICP,
      asset: route.asset,
      transfer: {
        ...params.transfer,
        ledgerCanisterId: route.ledgerCanisterId,
      },
      account: params.senderAccount,
      actionType: `supply-${params.action}`,
    });
  }

  private async submitInflowWithRetry(
    txid: string,
    extraRequest: SubmitInflowDefaults | null
  ): Promise<void> {
    if (!extraRequest) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Inflow submission requires an operation"
      );
    }

    await retryWithBackoff({
      execute: async () => {
        await this.params.submitInflow({ txid, ...extraRequest });
      },
      maxAttempts: SUBMIT_INFLOW_MAX_ATTEMPTS,
      initialRetryDelayMs: SUBMIT_INFLOW_INITIAL_RETRY_DELAY_MS,
      backoffMultiplier: SUBMIT_INFLOW_RETRY_BACKOFF_MULTIPLIER,
      shouldRetryError: isRetriableInflowSubmitError,
    });
  }

  private async sendEthContractTransaction(
    walletAdapter: Pick<WalletAdapter, "sendEthTransaction">,
    walletAddress: string,
    request: EthTransactionRequest,
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
      transaction: request,
    });
  }

  private async waitForExpectedAllowance(
    params: WaitForExpectedAllowanceParams
  ): Promise<void> {
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

  private requireEvmReadClient(message: string): EvmReadClient {
    if (!this.params.evmReadClient) {
      throw new LiquidiumError(LiquidiumErrorCode.VALIDATION_ERROR, message);
    }

    return this.params.evmReadClient;
  }
}

async function readErc20Allowance(
  params: ReadErc20AllowanceParams
): Promise<bigint> {
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

async function readErc20Balance(
  params: ReadErc20BalanceParams
): Promise<bigint> {
  const balance = await params.evmReadClient.readContract({
    address: params.tokenAddress as EvmAddress,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [params.ownerAddress as EvmAddress],
  });

  return BigInt(balance);
}

function getApprovalStrategy(
  params: ApprovalStrategyParams
): EvmSupplyApprovalStrategy {
  if (params.allowance >= params.amount) {
    return ApprovalStrategy.none;
  }

  if (params.allowance === 0n) {
    return ApprovalStrategy.approveMax;
  }

  return ApprovalStrategy.resetThenApproveMax;
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

function getDefaultSubmitInflowRequest(
  params: DefaultSubmitInflowRequestParams
): SubmitInflowDefaults | null {
  if (params.chain !== Chain.BTC && params.chain !== Chain.ETH) {
    return null;
  }

  return {
    chain: params.chain,
    operation: mapSupplyActionToStatusOperation(params.action),
  };
}

function isWalletTransferSupplyRequest(
  request: SupplyFlowRequest
): request is WalletTransferSupplyFlowRequest {
  return (
    request.mechanism !== PlanType.contractInteraction &&
    request.walletAdapter !== undefined
  );
}

function isContractInteractionSupplyRequest(
  request: SupplyFlowRequest
): request is ContractInteractionSupplyFlowRequest {
  return request.mechanism === PlanType.contractInteraction;
}

function mapSupplyActionToStatusOperation(
  action: SupplyAction
): InflowOperation {
  return action === SupplyAction.repayment ? "repayment" : "deposit";
}

function shouldSubmitInflow(params: ShouldSubmitInflowParams): boolean {
  if (params.mechanism !== PlanType.transfer) {
    return true;
  }

  if (params.target.chain === Chain.ICP) {
    return false;
  }

  return !isEthStablecoin(params.target.asset, params.target.chain);
}
