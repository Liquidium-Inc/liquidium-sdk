import {
  createInstantLoansActor,
  type HeadlessLoanEvent,
  type HeadlessLoanEventType,
  type InstantLoanAccountType,
  type InstantLoanAuthorisation,
  type InstantLoanLeg as InstantLoanCanisterLeg,
  type InstantLoanCanisterRecord,
  type InstantLoansCanisterError,
  type WarmedProfile,
} from "../../core/canisters/instant-loans/actor";
import { mapCanisterCallErrorToLiquidiumError } from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  buildInstantLoanAddressLookupPath,
  buildInstantLoanCollateralHintPath,
  SdkApiPath,
} from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import { type Asset, type Chain, SupplyAction } from "../../core/types";
import { getAssetNativeDecimals } from "../../core/utils/asset-decimals";
import { getVariantKey } from "../../core/utils/variant";
import { resolveSupplyTarget } from "../lending/_internal/supply-targets";
import type { LendingModule } from "../lending/lending";
import { SupplyPlanType, type SupplyTarget } from "../lending/types";
import type { PositionsModule } from "../positions";
import type { Position } from "../positions/types";
import { QuoteModule } from "../quote";
import { QuoteValidationErrorCode } from "../quote/types";
import {
  validateInstantLoanBorrowDestination,
  validateInstantLoanRefundDestination,
} from "./_internal/address-validation";
import { intFromPublicId, publicIdFromInt } from "./ref-code";
import type {
  CreateInstantLoanRequest,
  ExternalAccount,
  InstantLoan,
  InstantLoanAccount,
  InstantLoanAsset,
  InstantLoanAuthorization,
  InstantLoanCandidate,
  InstantLoanConfig,
  InstantLoanEvent,
  InstantLoanEventType,
  InstantLoanGetRequest,
  InstantLoanInitialDeposit,
  InstantLoanLeg,
  InstantLoanListEventsRequest,
  InstantLoanStatus,
  InstantLoanWarmedProfile,
} from "./types";

const REPAYMENT_BUFFER_SECONDS = 86_400n;
const RATE_SCALE = 10n ** 27n;
const SECONDS_PER_YEAR = 31_536_000n;
const ETH_STABLECOIN_INFLOW_FEE_FALLBACK = 1_500_000n;
const INSTANT_LOAN_MIN_SLIPPAGE_BUFFER_BPS = 200n;
const NANOSECONDS_PER_MILLISECOND = 1_000_000n;

type InstantLoanLtvPolicy = {
  ltvBps: bigint;
  minLtvMaxBps: bigint;
  maxLtvMaxBps: bigint;
};

type InstantLoanCandidateWire = {
  loanId?: string;
  loan_id?: string;
  ref?: string;
  short_ref?: string;
  profileId?: string;
  lending_profile?: string;
  createdAt?: string;
  created_at?: string;
  collateralPoolId?: string;
  lend_pool_ic_id?: string;
  borrowPoolId?: string;
  borrow_pool_ic_id?: string;
  collateralAsset?: string;
  lend_asset?: string;
  borrowAsset?: string;
  borrow_asset?: string;
  collateralAmountHint?: string;
  min_deposit_hint?: string;
};

type InstantLoanCreateRequestWire = {
  collateralPoolId: string;
  borrowPoolId: string;
  collateralAsset: InstantLoanAsset;
  borrowAsset: InstantLoanAsset;
  collateralAmount: string;
  borrowAmount: string;
  ltvMaxBps: string;
  depositWindowSeconds: string;
  borrowDestination: InstantLoanCreateAccountWire;
  refundDestination: InstantLoanCreateAccountWire;
};

type InstantLoanCollateralHintWire = {
  collateralAmountHint: string;
};

type InstantLoanCreateAccountWire = { External: string };
type InstantLoanAccountVariantWire =
  | InstantLoanCreateAccountWire
  | { Native: string };

type InstantLoanAccountWire =
  | { address: string; type: "External" }
  | { principal: string; type: "Native" }
  | InstantLoanAccountVariantWire;

type InstantLoanStatusHydrationInput = {
  collateralAmount: bigint;
  totalDebtAmount: bigint;
};

type InstantLoanWire = {
  loanId: string;
  ref?: string;
  profileId: string;
  ltvMaxBps: string;
  depositWindowSeconds: string;
  collateral: {
    poolId: string;
    asset: string;
    amountHint: string;
  };
  borrow: {
    poolId: string;
    asset: string;
    amount: string;
    destination: InstantLoanAccountWire;
  };
  refundDestination: InstantLoanAccountWire;
};

type InstantLoanHydrationInput = {
  loanId: bigint;
  profileId: string;
  ltvMaxBps: bigint;
  depositWindowSeconds: bigint;
  collateralPoolId: string;
  collateralAmountHint: bigint;
  borrowPoolId: string;
  collateralAsset: string;
  borrowAsset: string;
  borrowAmount: bigint;
  borrowDestination: InstantLoanAccount;
  refundDestination: InstantLoanAccount;
  deriveStatus: (input: InstantLoanStatusHydrationInput) => InstantLoanStatus;
};

/** Accountless instant-loan creation, lookup, recovery, and canister query helpers. */
export class InstantLoansModule {
  constructor(
    private readonly canisterContext: CanisterContext,
    private readonly apiClient: ApiClient | undefined,
    private readonly lending: LendingModule,
    private readonly positions: PositionsModule
  ) {}

  /**
   * Creates a profileless instant loan and returns canonical canister state plus
   * generated initial-deposit and repayment quote targets.
   *
   * Choose `collateralPoolId` and `borrowPoolId` from
   * `client.market.listPools()`, convert UI amounts to base units with the
   * selected pool decimals, and call `client.quote.calculateLtv(...)` before
   * creation to block invalid LTV input.
   *
   * `borrowDestination` receives the borrowed asset after the loan starts.
   * `refundDestination` receives collateral refunds or withdrawals. Use
   * `depositWindowSeconds` for the user-facing collateral deposit timeout; the
   * SDK maps it to the canister's internal `ltv_timer_s` field.
   *
   * @param request - Pool ids, assets, base-unit amounts, LTV limit, timeout, and destinations.
   * @returns Hydrated loan state plus generated initial-deposit and repayment quote targets.
   */
  async create(request: CreateInstantLoanRequest): Promise<InstantLoan> {
    validateCreateRequest(request);
    const borrowDestination = {
      External: validateInstantLoanBorrowDestination(
        addressFromAccountInput(request.borrowDestination),
        request.borrowAsset
      ),
    };
    const refundDestination = {
      External: validateInstantLoanRefundDestination(
        addressFromAccountInput(request.refundDestination),
        request.collateralAsset
      ),
    };
    const apiClient = this.requireApi("Instant loan creation");

    await this.validateInstantLoanLtvPolicy(request);

    const response = await apiClient.post<
      { loan: InstantLoanWire; success?: true },
      InstantLoanCreateRequestWire
    >(SdkApiPath.instantLoans, {
      collateralPoolId: request.collateralPoolId,
      borrowPoolId: request.borrowPoolId,
      collateralAsset: request.collateralAsset,
      borrowAsset: request.borrowAsset,
      collateralAmount: request.collateralAmount.toString(),
      borrowAmount: request.borrowAmount.toString(),
      ltvMaxBps: request.ltvMaxBps.toString(),
      depositWindowSeconds: request.depositWindowSeconds.toString(),
      borrowDestination,
      refundDestination,
    });

    return await this.mapLoanWire(response.loan);
  }

  /**
   * Resolves canonical canister state by loan id or short reference.
   *
   * References are decoded locally, then the corresponding loan id is loaded
   * from the instant-loans canister.
   *
   * @param request - Canister loan id or short public reference.
   * @returns Hydrated loan state plus generated initial-deposit and repayment quote targets.
   */
  async get(request: InstantLoanGetRequest): Promise<InstantLoan> {
    const loanId =
      "loanId" in request ? request.loanId : decodeRef(request.ref);

    try {
      const result = await createInstantLoansActor(
        this.canisterContext
      ).get_loan(loanId);

      if ("Err" in result) {
        throw mapInstantLoansErrorToLiquidiumError(result.Err);
      }

      const collateralAmountHint = await this.getCollateralAmountHint(loanId);

      return await this.mapLoanRecord(result.Ok, collateralAmountHint);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_loan", error);
    }
  }

  /**
   * Returns the active instant-loans canister config via direct query.
   *
   * @returns Active canister configuration.
   */
  async getConfig(): Promise<InstantLoanConfig> {
    try {
      const config = await createInstantLoansActor(
        this.canisterContext
      ).get_config();

      return {
        lendingCanisterId: config.lending_canister.toText(),
      };
    } catch (error) {
      throw mapCanisterCallErrorToLiquidiumError("get_config", error);
    }
  }

  /**
   * Returns a single canister event by id via direct query.
   *
   * @param eventId - Event id to load.
   * @returns The event when found, otherwise `null`.
   */
  async getEvent(eventId: bigint): Promise<InstantLoanEvent | null> {
    try {
      const event = await createInstantLoansActor(
        this.canisterContext
      ).get_event(eventId);

      return event[0] ? mapInstantLoanEvent(event[0]) : null;
    } catch (error) {
      throw mapCanisterCallErrorToLiquidiumError("get_event", error);
    }
  }

  /**
   * Returns a page of canister events via direct query.
   *
   * @param request - Start event id and maximum number of events to return.
   * @returns Canister events in ascending id order.
   */
  async listEvents(
    request: InstantLoanListEventsRequest
  ): Promise<InstantLoanEvent[]> {
    try {
      const events = await createInstantLoansActor(
        this.canisterContext
      ).list_events(request.start, request.limit);

      return events.map(([, event]) => mapInstantLoanEvent(event));
    } catch (error) {
      throw mapCanisterCallErrorToLiquidiumError("list_events", error);
    }
  }

  /**
   * Returns principals authorized for protected update callbacks.
   *
   * @returns Principal text values on the canister access list.
   */
  async listAccessList(): Promise<string[]> {
    try {
      const principals = await createInstantLoansActor(
        this.canisterContext
      ).list_access_list();

      return principals.map((principal) => principal.toText());
    } catch (error) {
      throw mapCanisterCallErrorToLiquidiumError("list_access_list", error);
    }
  }

  /**
   * Returns the current size of the warmed-profile pool via direct query.
   *
   * @returns Number of warmed profiles available on the canister.
   */
  async countWarmedProfiles(): Promise<bigint> {
    try {
      return await createInstantLoansActor(
        this.canisterContext
      ).count_warmed_profiles();
    } catch (error) {
      throw mapCanisterCallErrorToLiquidiumError(
        "count_warmed_profiles",
        error
      );
    }
  }

  /**
   * Returns warmed profiles currently available for future instant loans.
   *
   * @returns Warmed profile records available for assignment.
   */
  async listWarmedProfiles(): Promise<InstantLoanWarmedProfile[]> {
    try {
      const profiles = await createInstantLoansActor(
        this.canisterContext
      ).list_warmed_profiles();

      return profiles.map(mapWarmedProfile);
    } catch (error) {
      throw mapCanisterCallErrorToLiquidiumError("list_warmed_profiles", error);
    }
  }

  /**
   * Finds candidate loans associated with an address through the Liquidium SDK
   * API. Returns discovery candidates only; call `get(...)` to hydrate canister state.
   *
   * Candidates are useful for recovery flows where the user knows a borrow or
   * refund address but not the loan reference.
   *
   * @param address - Borrow or refund address to search for.
   * @returns Lightweight loan candidates associated with the address.
   */
  async findByAddress(address: string): Promise<InstantLoanCandidate[]> {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Address lookup requires a non-empty address"
      );
    }

    const apiClient = this.requireApi("Instant loan address lookup");
    const response = await apiClient.get<{
      success?: true;
      loans?: InstantLoanCandidateWire[];
      candidates?: InstantLoanCandidateWire[];
    }>(buildInstantLoanAddressLookupPath({ address: trimmedAddress }));

    return (response.candidates ?? response.loans ?? []).map(mapCandidateWire);
  }

  private async mapLoanRecord(
    record: InstantLoanCanisterRecord,
    collateralAmountHint: bigint
  ): Promise<InstantLoan> {
    return await this.hydrateLoan({
      loanId: record.id,
      profileId: record.lending_profile.toText(),
      ltvMaxBps: record.ltv_max_bps,
      depositWindowSeconds: record.ltv_timer_s,
      collateralPoolId: record.lend_pool_id.toText(),
      collateralAmountHint,
      borrowPoolId: record.borrow_pool_id.toText(),
      collateralAsset: getVariantKey(record.lend_asset),
      borrowAsset: getVariantKey(record.borrow_asset),
      borrowAmount: record.borrow_amount,
      borrowDestination: accountFromCanister(record.borrow_destination),
      refundDestination: accountFromCanister(record.refund_destination),
      deriveStatus: (input) =>
        deriveInstantLoanRecordStatus({
          ...input,
          expiresAt: record.expires_at[0],
          started: record.started,
        }),
    });
  }

  private async getCollateralAmountHint(loanId: bigint): Promise<bigint> {
    const apiClient = this.requireApi("Instant loan lookup");
    const response = await apiClient.get<
      {
        success?: true;
      } & InstantLoanCollateralHintWire
    >(buildInstantLoanCollateralHintPath({ loanId }));

    return parseBigintWire(
      response.collateralAmountHint,
      "collateral amount hint"
    );
  }

  private async mapLoanWire(loan: InstantLoanWire): Promise<InstantLoan> {
    const loanId = parseBigintWire(loan.loanId, "loan ID");

    return await this.hydrateLoan({
      loanId,
      profileId: loan.profileId,
      ltvMaxBps: parseBigintWire(loan.ltvMaxBps, "max LTV"),
      depositWindowSeconds: parseBigintWire(
        loan.depositWindowSeconds,
        "deposit window"
      ),
      collateralPoolId: loan.collateral.poolId,
      collateralAmountHint: parseBigintWire(
        loan.collateral.amountHint,
        "collateral amount hint"
      ),
      borrowPoolId: loan.borrow.poolId,
      collateralAsset: loan.collateral.asset,
      borrowAsset: loan.borrow.asset,
      borrowAmount: parseBigintWire(loan.borrow.amount, "borrow amount"),
      borrowDestination: accountFromWire(loan.borrow.destination),
      refundDestination: accountFromWire(loan.refundDestination),
      deriveStatus: deriveInstantLoanWireStatus,
    });
  }

  private async hydrateLoan(
    input: InstantLoanHydrationInput
  ): Promise<InstantLoan> {
    const profileId = input.profileId;
    const collateralPoolId = input.collateralPoolId;
    const borrowPoolId = input.borrowPoolId;
    const collateralAsset = input.collateralAsset;
    const borrowAsset = input.borrowAsset;

    const [
      depositTarget,
      repayTarget,
      collateralPosition,
      borrowPosition,
      borrowPoolRate,
    ] = await Promise.all([
      resolveSupplyTarget(this.canisterContext, {
        profileId,
        poolId: collateralPoolId,
        action: SupplyAction.deposit,
        mechanism: SupplyPlanType.transfer,
      }),
      resolveSupplyTarget(this.canisterContext, {
        profileId,
        poolId: borrowPoolId,
        action: SupplyAction.repayment,
        mechanism: SupplyPlanType.transfer,
      }),
      this.positions.getPosition(profileId, collateralPoolId),
      this.positions.getPosition(profileId, borrowPoolId),
      this.positions.market.getPoolRate(borrowPoolId),
    ]);

    const totalDebtAmount = calculateTotalDebtAmount(borrowPosition);
    const interestBufferAmount = calculateInterestBufferAmount(
      borrowPosition,
      borrowPoolRate.borrowRate
    );

    const repaymentInflowFee =
      totalDebtAmount > 0n
        ? await this.estimateRepaymentInflowFee(borrowAsset, repayTarget.chain)
        : { totalFee: 0n, estimateAvailable: false };

    const repaymentAmount =
      totalDebtAmount + interestBufferAmount + repaymentInflowFee.totalFee;

    const currentCollateralAmount = collateralPosition?.deposited ?? 0n;

    const collateralAmount = input.collateralAmountHint;
    const collateralDecimals =
      collateralPosition?.depositedDecimals ??
      getAssetNativeDecimals(collateralAsset);
    const collateralInterestAmount = collateralPosition?.earnedInterest ?? 0n;

    const borrowedAmount = borrowPosition?.borrowed ?? 0n;
    const borrowedDecimals =
      borrowPosition?.borrowedDecimals ?? getAssetNativeDecimals(borrowAsset);

    const debtInterestAmount = borrowPosition?.debtInterest ?? 0n;

    const status = input.deriveStatus({
      collateralAmount: currentCollateralAmount,
      totalDebtAmount,
    });

    const initialDeposit = await this.createInitialDepositQuote({
      collateralAmount,
      decimals: collateralDecimals,
      asset: collateralAsset,
      target: depositTarget,
    });

    const repayment =
      totalDebtAmount > 0n
        ? {
            amount: repaymentAmount,
            decimals: borrowedDecimals,
            debtAmount: totalDebtAmount,
            interestBufferAmount,
            interestBufferSeconds: REPAYMENT_BUFFER_SECONDS,
            inflowFeeAmount: repaymentInflowFee.totalFee,
            inflowFeeEstimateAvailable: repaymentInflowFee.estimateAvailable,
            asset: borrowAsset,
            chain: repayTarget.chain,
            target: repayTarget,
          }
        : null;

    return {
      loanId: input.loanId,
      ref: publicIdFromInt(input.loanId),
      status,
      profileId,
      terms: {
        ltvMaxBps: input.ltvMaxBps,
        depositWindowSeconds: input.depositWindowSeconds,
      },
      collateral: {
        poolId: collateralPoolId,
        asset: collateralAsset,
        chain: depositTarget.chain,
        decimals: collateralDecimals,
        amount: collateralAmount,
      },
      borrow: {
        poolId: borrowPoolId,
        asset: borrowAsset,
        chain: repayTarget.chain,
        decimals: borrowedDecimals,
        amount: input.borrowAmount,
        destination: input.borrowDestination,
      },
      refundDestination: input.refundDestination,
      initialDeposit,
      repayment,
      position: {
        collateralAmount: currentCollateralAmount,
        collateralDecimals,
        collateralInterestAmount,
        borrowedAmount,
        borrowedDecimals,
        debtInterestAmount,
        totalDebtAmount,
      },
    };
  }

  private async createInitialDepositQuote(input: {
    collateralAmount: bigint;
    decimals: bigint;
    asset: string;
    target: SupplyTarget;
  }): Promise<InstantLoanInitialDeposit> {
    const inflowFee = await this.lending.estimateInflowFee({
      asset: input.asset as Asset,
      chain: input.target.chain as Chain,
    });

    return {
      amount: input.collateralAmount + inflowFee.totalFee,
      decimals: input.decimals,
      collateralAmount: input.collateralAmount,
      inflowFeeAmount: inflowFee.totalFee,
      asset: input.asset,
      chain: input.target.chain,
      target: input.target,
    };
  }

  private async estimateRepaymentInflowFee(
    asset: string,
    chain: string
  ): Promise<{ totalFee: bigint; estimateAvailable: boolean }> {
    try {
      const fee = await this.lending.estimateInflowFee({
        asset: asset as Asset,
        chain: chain as Chain,
      });
      return { totalFee: fee.totalFee, estimateAvailable: true };
    } catch {
      return {
        totalFee: getRepaymentInflowFeeFallback(asset, chain),
        estimateAvailable: false,
      };
    }
  }

  private requireApi(action: string): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `${action} requires an API client`
      );
    }

    return this.apiClient;
  }

  private async validateInstantLoanLtvPolicy(
    request: CreateInstantLoanRequest
  ): Promise<void> {
    const ltvCalculation = await this.calculateInstantLoanLtv(request);

    if (request.ltvMaxBps < ltvCalculation.minLtvMaxBps) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        `Instant loan max LTV ${formatBpsAsPercent(request.ltvMaxBps)} is below minimum allowed ${formatBpsAsPercent(ltvCalculation.minLtvMaxBps)} (current implied LTV ${formatBpsAsPercent(ltvCalculation.ltvBps)} + ${formatBpsAsPercent(INSTANT_LOAN_MIN_SLIPPAGE_BUFFER_BPS)} buffer)`
      );
    }

    if (request.ltvMaxBps > ltvCalculation.maxLtvMaxBps) {
      throw new LiquidiumError(
        LiquidiumErrorCode.MAX_LTV_EXCEEDED,
        `Instant loan max LTV ${formatBpsAsPercent(request.ltvMaxBps)} exceeds collateral pool max ${formatBpsAsPercent(ltvCalculation.maxLtvMaxBps)}`
      );
    }
  }

  private async calculateInstantLoanLtv(
    request: CreateInstantLoanRequest
  ): Promise<InstantLoanLtvPolicy> {
    const [pools, assetPrices] = await Promise.all([
      this.positions.market.listPools(),
      this.positions.market.getAssetPrices(),
    ]);
    const ltvCalculation = new QuoteModule().calculateLtv(
      {
        borrowAmount: request.borrowAmount,
        borrowPoolId: request.borrowPoolId,
        collateralAmount: request.collateralAmount,
        collateralPoolId: request.collateralPoolId,
      },
      pools,
      assetPrices
    );

    if (ltvCalculation.validationErrors.length > 0) {
      throwLtvCalculationError(ltvCalculation.validationErrors[0]);
    }

    const minLtvMaxBps =
      ltvCalculation.ltvBps + INSTANT_LOAN_MIN_SLIPPAGE_BUFFER_BPS;

    return {
      ltvBps: ltvCalculation.ltvBps,
      minLtvMaxBps,
      maxLtvMaxBps: ltvCalculation.maxAllowedLtvBps,
    };
  }
}

function getRepaymentInflowFeeFallback(asset: string, chain: string): bigint {
  if (chain === "ETH" && (asset === "USDT" || asset === "USDC")) {
    return ETH_STABLECOIN_INFLOW_FEE_FALLBACK;
  }

  return 0n;
}

function calculateInterestBufferAmount(
  borrowPosition: Position | null,
  annualBorrowRate: bigint
): bigint {
  const totalDebtAmount = calculateTotalDebtAmount(borrowPosition);
  if (totalDebtAmount <= 0n || annualBorrowRate <= 0n) {
    return 0n;
  }

  const interestBuffer =
    (totalDebtAmount * annualBorrowRate * REPAYMENT_BUFFER_SECONDS) /
    RATE_SCALE /
    SECONDS_PER_YEAR;

  return interestBuffer > 1n ? interestBuffer : 1n;
}

function calculateTotalDebtAmount(borrowPosition: Position | null): bigint {
  if (!borrowPosition) {
    return 0n;
  }

  return borrowPosition.borrowed + borrowPosition.debtInterest;
}

function deriveInstantLoanWireStatus(
  input: InstantLoanStatusHydrationInput
): InstantLoanStatus {
  return deriveInstantLoanStatus({ ...input, started: undefined });
}

function deriveInstantLoanRecordStatus(
  input: InstantLoanStatusHydrationInput & {
    expiresAt: bigint | undefined;
    started: boolean;
  }
): InstantLoanStatus {
  const status = deriveInstantLoanStatus({
    collateralAmount: input.collateralAmount,
    started: input.started,
    totalDebtAmount: input.totalDebtAmount,
  });

  if (status !== "awaiting_deposit") {
    return status;
  }

  return hasExpiredDepositWindow(input.expiresAt) ? "expired" : status;
}

function deriveInstantLoanStatus(input: {
  collateralAmount: bigint;
  started: boolean | undefined;
  totalDebtAmount: bigint;
}): InstantLoanStatus {
  if (input.totalDebtAmount > 0n) {
    return "active";
  }

  if (input.collateralAmount > 0n) {
    return input.started ? "settling" : "deposit_detected";
  }

  if (input.started) {
    return "closed";
  }

  return "awaiting_deposit";
}

function hasExpiredDepositWindow(expiresAt: bigint | undefined): boolean {
  if (expiresAt === undefined) {
    return false;
  }

  return expiresAt <= currentProtocolTimestamp();
}

function currentProtocolTimestamp(): bigint {
  return BigInt(Date.now()) * NANOSECONDS_PER_MILLISECOND;
}

function validateCreateRequest(request: CreateInstantLoanRequest): void {
  if (request.collateralAmount <= 0n) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan collateral amount must be greater than zero"
    );
  }
  if (request.borrowAmount <= 0n) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan borrow amount must be greater than zero"
    );
  }
  if (request.ltvMaxBps <= 0n) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan max LTV must be greater than zero"
    );
  }
  if (request.depositWindowSeconds <= 0n) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan deposit window must be greater than zero seconds"
    );
  }
}

function throwLtvCalculationError(
  error: { code: QuoteValidationErrorCode; message: string } | undefined
): never {
  throw new LiquidiumError(
    error?.code === QuoteValidationErrorCode.POOL_NOT_FOUND
      ? LiquidiumErrorCode.POOL_NOT_FOUND
      : LiquidiumErrorCode.VALIDATION_ERROR,
    error?.message ?? "Unable to calculate instant loan LTV"
  );
}

function addressFromAccountInput(account: string | ExternalAccount): string {
  const address =
    typeof account === "string" ? account.trim() : account.address.trim();
  if (!address) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan account address must be non-empty"
    );
  }

  return address;
}

function accountFromCanister(
  account: InstantLoanAccountType
): InstantLoanAccount {
  if ("Native" in account) {
    return { type: "Native", principal: account.Native.toText() };
  }

  return { type: "External", address: account.External };
}

function accountFromWire(account: InstantLoanAccountWire): InstantLoanAccount {
  if ("Native" in account) {
    return { type: "Native", principal: account.Native };
  }

  if ("External" in account) {
    return { type: "External", address: account.External };
  }

  if (account.type === "Native") {
    return { type: "Native", principal: account.principal };
  }

  return { type: "External", address: account.address };
}

function mapInstantLoanEvent(event: HeadlessLoanEvent): InstantLoanEvent {
  return {
    id: event.id,
    schemaVersion: event.schema_version,
    timestamp: event.timestamp,
    eventType: mapInstantLoanEventType(event.event_type),
  };
}

function mapInstantLoanEventType(
  eventType: HeadlessLoanEventType
): InstantLoanEventType {
  if ("LoanCreated" in eventType) {
    const event = eventType.LoanCreated;
    return {
      type: "LoanCreated",
      loanId: event.loan_id,
      borrowDestination: accountFromCanister(event.borrow_destination),
      collateralAsset: assetFromCanister(event.lend_asset),
      borrowAmount: event.borrow_amount,
      collateralPoolId: event.lend_pool_id.toText(),
      refundDestination: accountFromCanister(event.refund_destination),
      ltvMaxBps: event.ltv_max_bps,
      depositWindowSeconds: event.ltv_timer_s,
      profileId: event.lending_profile.toText(),
      borrowPoolId: event.borrow_pool_id.toText(),
      borrowAsset: assetFromCanister(event.borrow_asset),
    };
  }

  if ("FullLendWithdrawalRequested" in eventType) {
    const event = eventType.FullLendWithdrawalRequested;
    return {
      type: "FullLendWithdrawalRequested",
      loanId: event.loan_id,
      account: accountFromCanister(event.account),
      poolId: event.pool_id.toText(),
    };
  }

  if ("BorrowRequested" in eventType) {
    const event = eventType.BorrowRequested;
    return {
      type: "BorrowRequested",
      loanId: event.loan_id,
      account: accountFromCanister(event.account),
      poolId: event.pool_id.toText(),
      amount: event.amount,
    };
  }

  if ("DepositTimerExceeded" in eventType) {
    return {
      type: "DepositTimerExceeded",
      loanId: eventType.DepositTimerExceeded.loan_id,
    };
  }

  if ("StuckFundsWithdrawalRequested" in eventType) {
    const event = eventType.StuckFundsWithdrawalRequested;
    return {
      type: "StuckFundsWithdrawalRequested",
      leg: legFromCanister(event.leg),
      loanId: event.loan_id,
      account: accountFromCanister(event.account),
      poolId: event.pool_id.toText(),
      amount: event.amount,
    };
  }

  if ("ProfileWarmed" in eventType) {
    const event = eventType.ProfileWarmed;
    return {
      type: "ProfileWarmed",
      derivationIndex: event.derivation_index,
      warmedProfileId: event.warmed_profile_id,
      ethAddress: event.eth_address,
      profileId: event.lending_profile.toText(),
    };
  }

  if ("RepayComplete" in eventType) {
    return {
      type: "RepayComplete",
      loanId: eventType.RepayComplete.loan_id,
      profileId: eventType.RepayComplete.lending_profile.toText(),
    };
  }

  return {
    type: "DepositTimerStarted",
    loanId: eventType.DepositTimerStarted.loan_id,
    timestamp: eventType.DepositTimerStarted.timestamp,
  };
}

function mapWarmedProfile(profile: WarmedProfile): InstantLoanWarmedProfile {
  return {
    id: profile.id,
    authorization: authorizationFromCanister(profile.authorisation),
    createdAt: profile.created_at,
    profileId: profile.lending_profile.toText(),
  };
}

function authorizationFromCanister(
  authorization: InstantLoanAuthorisation
): InstantLoanAuthorization {
  return {
    type: "EthSignature",
    derivationIndex: authorization.EthSignature.derivation_index,
    publicKey: authorization.EthSignature.pubkey,
    address: authorization.EthSignature.address,
  };
}

function assetFromCanister(asset: { [key: string]: null }): InstantLoanAsset {
  return getVariantKey(asset) as InstantLoanAsset;
}

function legFromCanister(leg: InstantLoanCanisterLeg): InstantLoanLeg {
  return getVariantKey(leg) as InstantLoanLeg;
}

function decodeRef(ref: string): bigint {
  try {
    return intFromPublicId(ref.trim());
  } catch (error) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Invalid instant loan reference",
      error
    );
  }
}

function mapCandidateWire(
  wire: InstantLoanCandidateWire
): InstantLoanCandidate {
  const loanId = parseBigintWire(wire.loanId ?? wire.loan_id, "loan ID");
  const ref = wire.ref ?? wire.short_ref ?? publicIdFromInt(loanId);
  const createdAt = wire.createdAt ?? wire.created_at;

  return {
    loanId,
    ref,
    profileId: requiredString(
      wire.profileId ?? wire.lending_profile,
      "profile ID"
    ),
    ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
    collateralPoolId: requiredString(
      wire.collateralPoolId ?? wire.lend_pool_ic_id,
      "collateral pool ID"
    ),
    borrowPoolId: requiredString(
      wire.borrowPoolId ?? wire.borrow_pool_ic_id,
      "borrow pool ID"
    ),
    collateralAsset: requiredString(
      wire.collateralAsset ?? wire.lend_asset,
      "collateral asset"
    ),
    borrowAsset: requiredString(
      wire.borrowAsset ?? wire.borrow_asset,
      "borrow asset"
    ),
    collateralAmountHint: parseBigintWire(
      wire.collateralAmountHint ?? wire.min_deposit_hint,
      "collateral amount hint"
    ),
  };
}

function parseBigintWire(value: string | undefined, label: string): bigint {
  if (!value || !/^\d+$/.test(value)) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Invalid instant loan ${label}`
    );
  }

  return BigInt(value);
}

function requiredString(value: string | undefined, label: string): string {
  if (value?.trim()) return value;

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Missing instant loan ${label}`
  );
}

function mapInstantLoansErrorToLiquidiumError(
  error: InstantLoansCanisterError
): LiquidiumError {
  const [key, payload] = Object.entries(error)[0] as [string, unknown];

  switch (key) {
    case "LoanNotFound":
    case "NoCollateralPosition":
      return new LiquidiumError(
        LiquidiumErrorCode.POSITION_NOT_FOUND,
        stringifyErrorPayload(payload)
      );
    case "LtvMaxExceeded":
    case "LtvMaxOutOfRange":
      return new LiquidiumError(
        LiquidiumErrorCode.MAX_LTV_EXCEEDED,
        stringifyErrorPayload(payload)
      );
    case "LtvTimerOutOfRange":
    case "InvalidLtvTimerS":
      return new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        stringifyErrorPayload(payload) ?? key
      );
    case "AccountRequired":
      return new LiquidiumError(
        LiquidiumErrorCode.INVALID_ADDRESS,
        stringifyErrorPayload(payload)
      );
    case "BorrowAmountRequired":
      return new LiquidiumError(
        LiquidiumErrorCode.BORROW_CAP_EXCEEDED,
        stringifyErrorPayload(payload)
      );
    case "AuthorizationFailed":
    case "UnauthorizedAccessListCaller":
      return new LiquidiumError(
        LiquidiumErrorCode.NOT_ALLOWED,
        stringifyErrorPayload(payload)
      );
    default:
      return new LiquidiumError(
        LiquidiumErrorCode.INTERNAL,
        stringifyErrorPayload(payload) ?? key
      );
  }
}

function stringifyErrorPayload(payload: unknown): string | undefined {
  if (payload === null || payload === undefined) return undefined;
  if (typeof payload === "string") return payload;

  return JSON.stringify(payload, (_key, value) => {
    if (typeof value === "bigint") return value.toString();
    if (value && typeof value === "object" && "toText" in value) {
      return (value as { toText: () => string }).toText();
    }

    return value;
  });
}

function formatBpsAsPercent(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const absoluteValue = value < 0n ? -value : value;
  const wholePart = absoluteValue / 100n;
  const fractionalPart = (absoluteValue % 100n).toString().padStart(2, "0");

  return `${sign}${wholePart.toString()}.${fractionalPart}%`;
}
