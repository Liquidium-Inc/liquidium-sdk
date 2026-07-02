import {
  type EvmAddress,
  normalizeAndValidateEvmAddress,
} from "../../../core/address-validation";
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
  type Asset,
  Chain,
  type EvmReadClient,
  SupplyAction,
} from "../../../core/types";
import { retryWithBackoff } from "../../../core/utils/retry";
import {
  type EthTransactionRequest,
  type IcrcTransferDetails,
  TransferMode,
  type WalletAdapter,
} from "../../../core/wallet-actions";
import {
  createApproveTransaction,
  createDepositErc20Transaction,
  createTransferErc20Transaction,
} from "../evm-transactions";
import type {
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
  TransferSupplyFlowRequest,
} from "../types";
import {
  EvmSupplyApprovalStrategy as ApprovalStrategy,
  SupplyPlanType as PlanType,
} from "../types";
import {
  getEthStablecoinContractAddress,
  isEthStablecoin,
  resolveSupplyMechanism,
  resolveSupplyTarget,
} from "./supply-targets";

const SUBMIT_INFLOW_MAX_ATTEMPTS = 4;
const SUBMIT_INFLOW_INITIAL_RETRY_DELAY_MS = 1_500;
const SUBMIT_INFLOW_RETRY_BACKOFF_MULTIPLIER = 2;
const ETH_APPROVAL_POLL_INTERVAL_MS = 2_000;
const ETH_APPROVAL_MAX_POLLS = 30;

type SubmitInflowDefaults = Omit<SubmitInflowRequest, "txid">;
type AllowanceExpectation = "zero" | "sufficient";

interface PoolAssetAndChain {
  asset: string;
  chain: string;
}

interface SupplyFlowExecutorParams {
  canisterContext: CanisterContext;
  evmReadClient: EvmReadClient | undefined;
  getPoolById(poolId: string): Promise<PoolAssetAndChain>;
  requireApi(): void;
  submitInflow(request: SubmitInflowRequest): Promise<SubmitInflowResponse>;
}

interface SupplyInstruction {
  poolId: string;
  asset: string;
  chain: string;
  action: SupplyAction;
  target: SupplyTarget;
}

interface GetEvmSupplyContextForPoolParams {
  request: GetEvmSupplyContextRequest;
  asset: string;
  chain: string;
}

interface SendAndSubmitTransferSupplyInflowParams {
  request: TransferSupplyFlowRequest;
  instruction: SupplyInstruction;
  defaultSubmitInflowRequest?: SubmitInflowDefaults;
}

interface SubmitSupplyFlowInflowParams {
  instruction: SupplyInstruction;
  mechanism: SupplyPlanType;
  defaultSubmitInflowRequest?: SubmitInflowDefaults;
  submitRequest: SubmitSupplyFlowInflowRequest;
}

interface ExecuteContractSupplyParams {
  request: SupplyFlowRequest;
  instruction: SupplyInstruction;
  defaultSubmitInflowRequest?: SubmitInflowDefaults;
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
  asset: string;
  chain: string;
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
  instruction: SupplyInstruction;
  mechanism: SupplyPlanType;
}

export class SupplyFlowExecutor {
  constructor(private readonly params: SupplyFlowExecutorParams) {}

  async create(request: SupplyFlowRequest): Promise<SupplyFlow> {
    const target = await resolveSupplyTarget(
      this.params.canisterContext,
      request
    );
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
      transferMode: request.transferMode,
    });
    const defaultSubmitInflowRequest = getDefaultSubmitInflowRequest({
      action: request.action,
      chain:
        mechanism === PlanType.contractInteraction
          ? Chain.ETH
          : instruction.chain,
    });

    let txid: string | undefined;
    switch (mechanism) {
      case PlanType.transfer:
        if (request.walletAdapter) {
          txid = await this.sendAndSubmitTransferSupplyInflow({
            request: request as TransferSupplyFlowRequest,
            instruction,
            defaultSubmitInflowRequest,
          });
        }
        break;
      case PlanType.contractInteraction:
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
      status: createLiquidiumStatus({
        operation: mapSupplyActionToStatusOperation(request.action),
        state: txid ? "confirming" : "action_required",
      }),
      submit: async (submitRequest) => {
        return await this.submitSupplyFlowInflow({
          instruction,
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
    const selectedPool = await this.params.getPoolById(request.poolId);

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
    const { request, instruction, defaultSubmitInflowRequest } = params;

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

    const txid =
      instruction.target.type === "chainAddress"
        ? await this.sendChainAddressSupplyTransaction({
            walletAdapter: request.walletAdapter,
            chain: instruction.chain,
            toAddress: instruction.target.address,
            amount: request.amount,
            senderAccount: account,
            asset: instruction.asset,
            action: request.action,
          })
        : await this.sendIcrcSupplyTransaction({
            walletAdapter: request.walletAdapter,
            asset: instruction.asset,
            chain: instruction.chain,
            transfer: {
              ledgerCanisterId: getPoolLedgerAssetRoute({
                asset: instruction.asset,
                chain: instruction.chain,
              }).ledgerCanisterId,
              to: getIcrcSupplyTargetAccount(instruction.target),
              amount: request.amount,
            },
            senderAccount: account,
            action: request.action,
          });

    if (shouldSubmitInflow({ instruction, mechanism: PlanType.transfer })) {
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

    this.params.requireApi();
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
        destinationAccount: instruction.target.account.address,
        action: request.action,
      }),
      `supply-${request.action}-deposit-erc20`
    );

    try {
      await this.submitInflowWithRetry(depositTxid, defaultSubmitInflowRequest);
    } catch {
      // The deposit transaction is already broadcast and cannot be rolled back.
      // Return the txid so callers can track it even if the indexing hint fails.
    }

    return depositTxid;
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
      chain: route.chain,
      asset: route.asset,
      transfer: {
        ...params.transfer,
        ledgerCanisterId: route.ledgerCanisterId,
      },
      account: params.senderAccount,
      actionType: `supply-${params.action}`,
      transferMode: route.transferMode,
    });
  }

  private async submitInflowWithRetry(
    txid: string,
    extraRequest?: SubmitInflowDefaults
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
      transferMode: TransferMode.native,
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
): SubmitInflowDefaults | undefined {
  if (params.chain !== Chain.BTC && params.chain !== Chain.ETH) {
    return undefined;
  }

  return {
    chain: params.chain,
    operation: mapSupplyActionToStatusOperation(params.action),
  };
}

function getIcrcSupplyTargetAccount(
  target: SupplyTarget
): IcrcTransferDetails["to"] {
  switch (target.type) {
    case "icrcAccount":
      return target.account;
    case "icpLedgerAccount":
      return target.account.icrc;
    case "chainAddress":
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "ICRC wallet execution requires an ICRC-compatible supply target"
      );
  }
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

  if (params.instruction.target.type !== "chainAddress") {
    return false;
  }

  return !isEthStablecoin(params.instruction.asset, params.instruction.chain);
}
