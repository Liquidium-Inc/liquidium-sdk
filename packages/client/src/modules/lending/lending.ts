import { Principal } from "@icp-sdk/core/principal";
import { normalizeExternalAddress } from "../../core/address-validation";
import { getBorrowAmountMinimumValidationError } from "../../core/borrow-minimums";
import { createCkBtcLedgerActor } from "../../core/canisters/ckbtc/ledger";
import { createCkBtcMinterActor } from "../../core/canisters/ckbtc/minter";
import { createDepositAccountsActor } from "../../core/canisters/deposit-accounts/actor";
import { createLendingActor } from "../../core/canisters/lending/actor";
import {
  mapCanisterCallErrorToLiquidiumError,
  mapLendingProtocolErrorToLiquidiumError,
} from "../../core/canisters/lending/error-mappers";
import {
  createFlexibleLendingActor,
  type DecodedPool,
  decodeFlexiblePool,
} from "../../core/canisters/lending/flexible-actor";
import {
  createBorrowAssetMessage,
  createWithdrawAssetMessage,
} from "../../core/canisters/lending/messages";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { normalizeEvmAddress } from "../../core/evm";
import { SdkApiPath } from "../../core/sdk-api-paths";
import {
  createLiquidiumStatus,
  type LiquidiumOperation,
} from "../../core/status";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import {
  Asset,
  Chain,
  type EvmReadClient,
  OutflowType,
} from "../../core/types";
import { encodeInflowSubaccount } from "../../core/utils/inflow-subaccount";
import { normalizeWalletSignature } from "../../core/utils/signature";
import { computeExpiryTimestampFromNow } from "../../core/utils/time";
import {
  TransferMode,
  WalletActionKind,
  WalletExecutionKind,
} from "../../core/wallet-actions";
import { executeWith } from "../../execute";
import { roundInflowFeeEstimate } from "./_internal/inflow-fee-rounding";
import { SupplyFlowExecutor } from "./_internal/supply-flow";
import {
  getEthStablecoinContractAddress,
  isEthStablecoin,
  mapDepositAccountErrorToLiquidiumError,
} from "./_internal/supply-targets";
import {
  mapCanisterOutflowDetails,
  mapWalletChainToLendingChain,
} from "./mappers";
import type {
  BorrowAction,
  BorrowOutflowDetails,
  BorrowSubmitSignatureInfo,
  CreateBorrowRequest,
  CreateWithdrawRequest,
  EstimateInflowFeeRequest,
  EvmSupplyContext,
  GetDepositAddressRequest,
  GetEvmSupplyContextRequest,
  InflowFeeEstimate,
  OutflowDetails,
  SubmitInflowRequest,
  SubmitInflowResponse,
  SupplyFlow,
  SupplyFlowRequest,
  WalletExecutionParams,
  WithdrawAction,
  WithdrawOutflowDetails,
  WithdrawSubmitSignatureInfo,
} from "./types";

interface OutflowRequestData {
  profileId: string;
  poolId: string;
  amount: bigint;
  receiverAddress: string;
  signerWalletAddress: string;
  expiryTimestamp: bigint;
}

interface NormalizeOutflowReceiverAddressParams {
  poolId: string;
  receiverAddress: string;
}

/** Borrow, withdraw, supply, inflow reporting, and fee-estimation helpers. */
export class LendingModule {
  constructor(
    private readonly canisterContext: CanisterContext,
    private readonly apiClient: ApiClient | undefined,
    private readonly evmReadClient: EvmReadClient | undefined
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
    const signerAccount = normalizeEvmAddress(
      request.signerWalletAddress.trim()
    );
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
    const receiverAddress = await this.normalizeOutflowReceiverAddress({
      poolId: request.poolId,
      receiverAddress: destinationAccount,
    });

    const lendingActor = createLendingActor(this.canisterContext);

    try {
      const expiryTimestamp = computeExpiryTimestampFromNow();
      const nonce = await lendingActor.get_nonce(signerAccount);
      const withdrawRequestData = {
        profileId: request.profileId,
        poolId: request.poolId,
        amount: request.amount,
        receiverAddress,
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
            account: { type: "External", data: receiverAddress },
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
  ): Promise<WithdrawOutflowDetails> {
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
              signature: normalizeWalletSignature(
                signatureInfo.signature,
                signatureInfo.chain
              ),
              chain: mapWalletChainToLendingChain(signatureInfo.chain),
              account: request.signerWalletAddress,
            },
          },
        }
      );

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapExpectedOutflowDetails(
        mapCanisterOutflowDetails(result.Ok),
        OutflowType.withdrawal,
        "withdraw"
      );
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
  ): Promise<WithdrawOutflowDetails> {
    const action = await this.prepareWithdraw(params);

    return await executeWith({
      walletAdapter: params.signerWalletAdapter,
      chain: params.signerChain,
      account: action.account,
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
    const signerAccount = normalizeEvmAddress(
      request.signerWalletAddress.trim()
    );
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
    if (request.amount <= 0n) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Borrow amount must be greater than 0"
      );
    }
    const selectedPool = await this.getPoolById(request.poolId);
    const selectedAsset = selectedPool.asset;
    const minimumBorrowAmountError = getBorrowAmountMinimumValidationError({
      amount: request.amount,
      asset: selectedAsset,
    });
    if (minimumBorrowAmountError) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        minimumBorrowAmountError.message
      );
    }
    const receiverAddress = normalizeExternalAddress({
      address: destinationAccount,
      asset: selectedAsset,
      chain: selectedPool.chain,
    });

    const lendingActor = createLendingActor(this.canisterContext);

    try {
      const expiryTimestamp = computeExpiryTimestampFromNow();
      const nonce = await lendingActor.get_nonce(signerAccount);
      const borrowRequestData = {
        profileId: request.profileId,
        poolId: request.poolId,
        amount: request.amount,
        receiverAddress,
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
            account: { type: "External", data: receiverAddress },
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
  ): Promise<BorrowOutflowDetails> {
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
            signature: normalizeWalletSignature(
              signatureInfo.signature,
              signatureInfo.chain
            ),
            chain: mapWalletChainToLendingChain(signatureInfo.chain),
            account: request.signerWalletAddress,
          },
        },
      });

      if ("Err" in result) {
        throw mapLendingProtocolErrorToLiquidiumError(result.Err);
      }

      return mapExpectedOutflowDetails(
        mapCanisterOutflowDetails(result.Ok),
        OutflowType.borrow,
        "borrow_assets"
      );
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
   * @returns The lending canister receipt as {@link OutflowDetails}.
   *
   * @remarks
   * `id` is always present. `txid` may be missing on the first response; the SDK does not
   * poll for it. Use history or app-level polling if you need the chain transaction id.
   */
  async borrow(
    params: CreateBorrowRequest & WalletExecutionParams
  ): Promise<BorrowOutflowDetails> {
    const action = await this.prepareBorrow(params);

    return await executeWith({
      walletAdapter: params.signerWalletAdapter,
      chain: params.signerChain,
      account: action.account,
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
    return await this.createSupplyFlowExecutor().create(request);
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
    return await this.createSupplyFlowExecutor().getEvmSupplyContext(request);
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
  async getDepositAddress(request: GetDepositAddressRequest): Promise<string> {
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
   * canister. BTC estimates include the ckBTC minter deposit fee and ledger fee.
   *
   * @param request - Asset and chain pair to estimate for.
   * @returns Total fee estimate rounded up in the asset's base units.
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

      return {
        totalFee: roundInflowFeeEstimate(request, result.Ok),
      };
    }

    if (request.asset === Asset.BTC && request.chain === Chain.BTC) {
      const estimate = await this.estimateBtcInflowFee();
      return {
        totalFee: roundInflowFeeEstimate(request, estimate.totalFee),
      };
    }

    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Inflow fee estimates are not supported for ${request.asset} on ${request.chain}`
    );
  }

  private async estimateBtcInflowFee(): Promise<InflowFeeEstimate> {
    const [minterFee, ledgerFee] = await Promise.all([
      createCkBtcMinterActor(this.canisterContext).get_deposit_fee(),
      createCkBtcLedgerActor(this.canisterContext).icrc1_fee(),
    ]);

    return { totalFee: minterFee + ledgerFee };
  }

  /**
   * Submits an inflow transaction id for faster indexing.
   *
   * Uses the Liquidium SDK API.
   *
   * @param request - Broadcast `txid` plus inflow `operation` and optional `chain`.
   * @returns Acknowledgement including the submitted `txid`.
   */
  async submitInflow(
    request: SubmitInflowRequest
  ): Promise<SubmitInflowResponse> {
    const apiClient = this.requireApi();

    const response = await apiClient.post<
      SubmitInflowResponse,
      SubmitInflowRequest
    >(SdkApiPath.inflow, request);

    return {
      txid: response.txid,
    };
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

  private createSupplyFlowExecutor(): SupplyFlowExecutor {
    return new SupplyFlowExecutor({
      canisterContext: this.canisterContext,
      evmReadClient: this.evmReadClient,
      getPoolById: async (poolId) => await this.getPoolById(poolId),
      requireApi: () => {
        this.requireApi();
      },
      submitInflow: async (request) => await this.submitInflow(request),
    });
  }

  private async getPoolById(poolId: string): Promise<DecodedPool> {
    const pools = await createFlexibleLendingActor(
      this.canisterContext
    ).list_pools();
    const selectedPool = pools.find(
      (pool) => pool.principal.toText() === poolId
    );

    const decodedPool = selectedPool ? decodeFlexiblePool(selectedPool) : null;
    if (!decodedPool) {
      throw new LiquidiumError(
        LiquidiumErrorCode.POOL_NOT_FOUND,
        `Pool not found: ${poolId}`
      );
    }

    return decodedPool;
  }

  private async normalizeOutflowReceiverAddress(
    params: NormalizeOutflowReceiverAddressParams
  ): Promise<string> {
    const selectedPool = await this.getPoolById(params.poolId);

    return normalizeExternalAddress({
      address: params.receiverAddress,
      asset: selectedPool.asset,
      chain: selectedPool.chain,
    });
  }
}

function mapExpectedOutflowDetails(
  details: OutflowDetails,
  expectedOutflowType: typeof OutflowType.borrow,
  operation: string
): BorrowOutflowDetails;
function mapExpectedOutflowDetails(
  details: OutflowDetails,
  expectedOutflowType: typeof OutflowType.withdrawal,
  operation: string
): WithdrawOutflowDetails;
function mapExpectedOutflowDetails(
  details: OutflowDetails,
  expectedOutflowType:
    | typeof OutflowType.borrow
    | typeof OutflowType.withdrawal,
  operation: string
): BorrowOutflowDetails | WithdrawOutflowDetails {
  if (details.outflowType !== expectedOutflowType) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      `${operation} returned unexpected outflow type ${details.outflowType}`
    );
  }

  return {
    ...details,
    status: createLiquidiumStatus({
      operation: mapOutflowTypeToStatusOperation(expectedOutflowType),
      state: details.txid ? "confirming" : "processing",
    }),
  } as BorrowOutflowDetails | WithdrawOutflowDetails;
}

function mapOutflowTypeToStatusOperation(
  outflowType: typeof OutflowType.borrow | typeof OutflowType.withdrawal
): LiquidiumOperation {
  return outflowType;
}
