import { Principal } from "@icp-sdk/core/principal";
import {
  decodeIcrcAccountAddress,
  mapCanisterAccountToLiquidiumAccount,
  normalizeIcpAccountIdentifier,
} from "../../core/accounts";
import type {
  InstantLoanAuthorisation,
  InstantLoanLeg as InstantLoanCanisterLeg,
  InstantLoansCanisterError,
  WarmedProfile,
} from "../../core/canisters/instant-loans/actor";
import {
  createFlexibleInstantLoansActor,
  type DecodedHeadlessLoanEvent,
  type DecodedHeadlessLoanEventType,
  type DecodedInstantLoanCanisterRecord,
  decodeFlexibleHeadlessLoanEvent,
  decodeFlexibleInstantLoanRecord,
} from "../../core/canisters/instant-loans/flexible-actor";
import { mapCanisterCallErrorToLiquidiumError } from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import {
  buildInstantLoanCollateralHintPath,
  buildInstantLoanFindPath,
  SdkApiPath,
} from "../../core/sdk-api-paths";
import { createLiquidiumStatus, type LiquidiumStatus } from "../../core/status";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import {
  type AssetIdentifier,
  type Chain,
  Asset as CoreAsset,
  Chain as CoreChain,
  isAssetIdentifier,
  SupplyAction,
} from "../../core/types";
import {
  parseApiStringUnion,
  parseIsoApiTimestampToUnixSeconds,
  parseNonEmptyApiString,
  parseUnsignedApiBigint,
} from "../../core/utils/api-response-parsers";
import { getAssetNativeDecimals } from "../../core/utils/asset-decimals";
import { getVariantKey } from "../../core/utils/variant";
import type { ActivitiesModule, Activity } from "../activities";
import { ActivityFilter } from "../activities";
import {
  getPoolById,
  resolveSupplyTargetForPool,
} from "../lending/_internal/supply-targets";
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
  InstantLoan,
  InstantLoanAccount,
  InstantLoanAsset,
  InstantLoanAuthorization,
  InstantLoanConfig,
  InstantLoanDestination,
  InstantLoanEvent,
  InstantLoanEventType,
  InstantLoanFindBorrow,
  InstantLoanFindCollateral,
  InstantLoanFindResult,
  InstantLoanGetRequest,
  InstantLoanInitialDeposit,
  InstantLoanInitialDepositTargetQuote,
  InstantLoanLeg,
  InstantLoanListEventsRequest,
  InstantLoanRepaymentTargetQuote,
  InstantLoanWarmedProfile,
} from "./types";

const REPAYMENT_BUFFER_SECONDS = 86_400n;
const RATE_SCALE = 10n ** 27n;
const SECONDS_PER_YEAR = 31_536_000n;
const MILLISECONDS_PER_SECOND = 1_000;
const ETH_STABLECOIN_INFLOW_FEE_FALLBACK = 1_500_000n;
const INSTANT_LOAN_MIN_SLIPPAGE_BUFFER_BPS = 200n;
const INSTANT_LOAN_FIND_QUERY_MAX_LENGTH = 256;
const INSTANT_LOAN_WIRE_CONTEXT = "instant loan";
const INSTANT_LOAN_ASSETS = [
  CoreAsset.BTC,
  CoreAsset.ICP,
  CoreAsset.USDC,
  CoreAsset.USDT,
] as const satisfies readonly InstantLoanAsset[];
const INSTANT_LOAN_CHAINS = [
  CoreChain.BTC,
  CoreChain.ETH,
  CoreChain.ICP,
] as const;

const ICP_ACCOUNT_IDENTIFIER_HEX_LENGTH = 64;

interface InstantLoanLtvPolicy {
  ltvBps: bigint;
  minLtvMaxBps: bigint;
  maxLtvMaxBps: bigint;
}

interface InstantLoanFindCandidateWire {
  loan_id: string;
  short_ref: string;
  created_at: string;
  lend_asset: string;
  borrow_asset: string;
  collateral_amount: string;
  lend_pool_ic_id: string;
  borrow_pool_ic_id: string;
  profile: string;
}

interface InstantLoanFindCandidate {
  loanId: bigint;
  ref: string;
  createdAt: bigint;
  collateral: InstantLoanFindCollateral;
  borrow: InstantLoanFindBorrow;
  profileId: string;
}

interface InstantLoanCreateRequestWire {
  collateralPoolId: string;
  borrowPoolId: string;
  collateralAsset: InstantLoanAsset;
  borrowAsset: InstantLoanAsset;
  collateralAmount: string;
  borrowAmount: string;
  ltvMaxBps: string;
  depositWindowSeconds: string;
  borrowDestination: InstantLoanApiAccountType;
  refundDestination: InstantLoanApiAccountType;
}

interface InstantLoanApiExternalAccountType {
  External: string;
}

interface InstantLoanApiNativeAccountType {
  Native: string;
}

interface InstantLoanApiAccountIdentifierAccountType {
  AccountIdentifier: string;
}

interface InstantLoanApiIcrcAccountType {
  Icrc: string;
}

type InstantLoanApiAccountType =
  | InstantLoanApiExternalAccountType
  | InstantLoanApiNativeAccountType
  | InstantLoanApiAccountIdentifierAccountType
  | InstantLoanApiIcrcAccountType;

interface InstantLoanCollateralHintWire {
  collateralAmountHint: string;
}

interface V1InstantLoanFindResponseWire {
  success: true;
  candidates: InstantLoanFindCandidateWire[];
}

interface LegacyInstantLoanFindResponseWire {
  success: true;
  loans: InstantLoanFindCandidateWire[];
}

type InstantLoanFindResponseWire =
  | V1InstantLoanFindResponseWire
  | LegacyInstantLoanFindResponseWire;

interface V1InstantLoanCollateralHintResponseWire
  extends InstantLoanCollateralHintWire {
  success: true;
}

interface V1InstantLoanCreateResponseWire {
  success: true;
  loan: InstantLoanWire;
}

interface InstantLoanWireCollateral {
  amountHint: string;
}

interface InstantLoanWire {
  loanId: string;
  collateral: InstantLoanWireCollateral;
}

interface InstantLoanHydrationInput {
  loanId: bigint;
  profileId: string;
  ltvMaxBps: bigint;
  depositWindowSeconds: bigint;
  collateralPoolId: string;
  collateralAmount: bigint;
  borrowPoolId: string;
  collateralAsset: InstantLoanAsset;
  borrowAsset: InstantLoanAsset;
  borrowAmount: bigint;
  borrowDestination: InstantLoanAccount;
  refundDestination: InstantLoanAccount;
  started: boolean;
  depositDetectedTimestamp: bigint | null;
  expiryTimestamp: bigint | null;
  borrowChain: Chain;
}

interface InstantLoanHydrationChainOptions {
  borrowChain?: Chain;
}

interface InstantLoanInitialDepositQuoteInput {
  collateralAmount: bigint;
  decimals: bigint;
  asset: InstantLoanAsset;
  targets: Partial<Record<Chain, SupplyTarget>>;
  detectedTimestamp: bigint | null;
  expiryTimestamp: bigint | null;
}

interface ResolveInstantLoanInflowTargetsRequest {
  profileId: string;
  poolId: string;
  action: SupplyAction;
}

interface ResolvedInstantLoanInflowTargets {
  targets: Partial<Record<Chain, SupplyTarget>>;
}

interface RepaymentInflowFeeEstimate {
  totalFee: bigint;
  estimateAvailable: boolean;
}

interface DeriveInstantLoanStatusInput {
  started: boolean;
  depositDetectedTimestamp: bigint | null;
  expiryTimestamp: bigint | null;
  collateralAmount: bigint;
  totalDebtAmount: bigint;
  activeActivities: Activity[];
}

interface DeriveDepositExpiryTimestampInput {
  depositDetectedTimestamp: bigint | null;
  depositWindowSeconds: bigint;
}

interface LtvCalculationErrorDetails {
  code: QuoteValidationErrorCode;
  message: string;
}

type ExternalDestinationNormalizer = (
  address: string,
  asset: InstantLoanAsset,
  chain: Chain
) => string;

type InstantLoanOutflowRole = "borrow" | "refund";

interface ResolveInstantLoanDestinationParams {
  destination: InstantLoanDestination;
  asset: InstantLoanAsset;
  role: InstantLoanOutflowRole;
  chain: Chain;
  normalizeExternalDestination: ExternalDestinationNormalizer;
}

/**
 * A loan was created remotely, but the SDK could not load its enriched state.
 * Retry with `instantLoans.get({ loanId })`; do not create the loan again.
 */
export class InstantLoanCreatedError extends Error {
  readonly code = "INSTANT_LOAN_HYDRATION_FAILED" as const;
  readonly loanId: bigint;
  readonly ref: string;
  override readonly cause: unknown;

  constructor(loanId: bigint, cause: unknown) {
    const ref = publicIdFromInt(loanId);
    super(
      `Instant loan ${ref} was created, but its enriched state could not be loaded`
    );
    this.name = "InstantLoanCreatedError";
    this.loanId = loanId;
    this.ref = ref;
    this.cause = cause;
  }
}

/** Accountless instant-loan creation, lookup, recovery, and canister query helpers. */
export class InstantLoansModule {
  constructor(
    private readonly canisterContext: CanisterContext,
    private readonly apiClient: ApiClient | undefined,
    private readonly activities: ActivitiesModule,
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
   * `borrow.destination` receives the borrowed asset after the loan starts.
   * `refund.destination` receives collateral refunds or withdrawals. Use
   * `depositWindowSeconds` for the user-facing collateral deposit timeout; the
   * SDK maps it to the canister's internal `ltv_timer_s` field.
   *
   * @param request - Collateral, borrow, refund, LTV limit, timeout, and inflow options.
   * @returns Hydrated loan state plus generated initial-deposit and repayment quote targets.
   */
  async create(request: CreateInstantLoanRequest): Promise<InstantLoan> {
    validateCreateRequest(request);
    const borrowDestination = resolveInstantLoanDestination({
      destination: request.borrow.destination,
      asset: request.borrow.asset,
      role: "borrow",
      chain: request.borrow.chain,
      normalizeExternalDestination: validateInstantLoanBorrowDestination,
    });
    const refundDestination = resolveInstantLoanDestination({
      destination: request.refund.destination,
      asset: request.collateral.asset,
      role: "refund",
      chain: request.refund.chain,
      normalizeExternalDestination: validateInstantLoanRefundDestination,
    });
    const apiClient = this.requireApi("Instant loan creation");

    await this.validateInstantLoanLtvPolicy(request);

    const response = await apiClient.post<
      V1InstantLoanCreateResponseWire,
      InstantLoanCreateRequestWire
    >(SdkApiPath.instantLoans, {
      collateralPoolId: request.collateral.poolId,
      borrowPoolId: request.borrow.poolId,
      collateralAsset: request.collateral.asset,
      borrowAsset: request.borrow.asset,
      collateralAmount: request.collateral.amount.toString(),
      borrowAmount: request.borrow.amount.toString(),
      ltvMaxBps: request.ltvMaxBps.toString(),
      depositWindowSeconds: request.depositWindowSeconds.toString(),
      borrowDestination,
      refundDestination,
    });

    const loanId = parseUnsignedApiBigint(response.loan.loanId, {
      context: INSTANT_LOAN_WIRE_CONTEXT,
      label: "loan ID",
    });

    try {
      const collateralAmount = parseUnsignedApiBigint(
        response.loan.collateral.amountHint,
        {
          context: INSTANT_LOAN_WIRE_CONTEXT,
          label: "collateral amount",
        }
      );
      const record = await this.getLoanRecord(loanId);

      return await this.mapLoanRecord(record, collateralAmount, {
        borrowChain: request.borrow.chain,
      });
    } catch (cause) {
      throw new InstantLoanCreatedError(loanId, cause);
    }
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

    const record = await this.getLoanRecord(loanId);
    const collateralAmount = await this.getCollateralAmountHint(loanId);

    return await this.mapLoanRecord(record, collateralAmount);
  }

  /**
   * Finds instant loans by short reference, numeric loan id string, address, or transaction id.
   *
   * Search returns lightweight matches. Call `get({ loanId })` or `get({ ref })`
   * when the user selects a match and you need hydrated loan state.
   *
   * @param query - Short reference, address, transaction id/hash, or numeric loan id string.
   * @returns Matching loan ids and references from the search index.
   */
  async find(query: string): Promise<InstantLoanFindResult[]> {
    const validatedQuery = validateInstantLoanFindQuery(query);
    const candidates = await this.findCandidateLoansByQuery(validatedQuery);

    return uniqueInstantLoanFindCandidates(candidates).map((candidate) => ({
      loanId: candidate.loanId,
      ref: candidate.ref,
      createdAt: candidate.createdAt,
      collateral: candidate.collateral,
      borrow: candidate.borrow,
      profileId: candidate.profileId,
    }));
  }

  /**
   * Returns the active instant-loans canister config via direct query.
   *
   * @returns Active canister configuration.
   */
  async getConfig(): Promise<InstantLoanConfig> {
    try {
      const config = await createFlexibleInstantLoansActor(
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
      const event = await createFlexibleInstantLoansActor(
        this.canisterContext
      ).get_event(eventId);

      const decoded = event[0]
        ? decodeFlexibleHeadlessLoanEvent(event[0])
        : null;

      return decoded ? mapInstantLoanEvent(decoded) : null;
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
      const events = await createFlexibleInstantLoansActor(
        this.canisterContext
      ).list_events(request.start, request.limit);

      return events
        .map(([, event]) => decodeFlexibleHeadlessLoanEvent(event))
        .filter((event): event is DecodedHeadlessLoanEvent => event !== null)
        .map((event) => mapInstantLoanEvent(event));
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
      const principals = await createFlexibleInstantLoansActor(
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
      return await createFlexibleInstantLoansActor(
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
      const profiles = await createFlexibleInstantLoansActor(
        this.canisterContext
      ).list_warmed_profiles();

      return profiles.map(mapWarmedProfile);
    } catch (error) {
      throw mapCanisterCallErrorToLiquidiumError("list_warmed_profiles", error);
    }
  }

  private async findCandidateLoansByQuery(
    query: string
  ): Promise<InstantLoanFindCandidate[]> {
    const apiClient = this.requireApi("Instant loan find");
    const response = await apiClient.get<InstantLoanFindResponseWire>(
      buildInstantLoanFindPath({ query })
    );

    const candidates =
      "candidates" in response ? response.candidates : response.loans;

    return candidates.map(mapCandidateWire);
  }

  private async getLoanRecord(
    loanId: bigint
  ): Promise<DecodedInstantLoanCanisterRecord> {
    try {
      const result = await createFlexibleInstantLoansActor(
        this.canisterContext
      ).get_loan(loanId);

      if ("Err" in result) {
        throw mapInstantLoansErrorToLiquidiumError(result.Err);
      }

      const decoded = decodeFlexibleInstantLoanRecord(result.Ok);
      if (!decoded) {
        throw new LiquidiumError(
          LiquidiumErrorCode.POOL_NOT_FOUND,
          `Instant loan ${loanId.toString()} uses an unsupported asset`
        );
      }

      return decoded;
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_loan", error);
    }
  }

  private async mapLoanRecord(
    record: DecodedInstantLoanCanisterRecord,
    collateralAmount: bigint,
    chainOptions: InstantLoanHydrationChainOptions = {}
  ): Promise<InstantLoan> {
    const borrowDestination = accountFromCanister(record.borrow_destination);
    const collateralAsset = parseInstantLoanAsset(
      record.lend_asset,
      "collateral asset"
    );
    const borrowAsset = parseInstantLoanAsset(
      record.borrow_asset,
      "borrow asset"
    );

    return await this.hydrateLoan({
      loanId: record.id,
      profileId: record.lending_profile.toText(),
      ltvMaxBps: record.ltv_max_bps,
      depositWindowSeconds: record.ltv_timer_s,
      collateralPoolId: record.lend_pool_id.toText(),
      collateralAmount,
      borrowPoolId: record.borrow_pool_id.toText(),
      collateralAsset,
      borrowAsset,
      borrowAmount: record.borrow_amount,
      borrowDestination,
      refundDestination: accountFromCanister(record.refund_destination),
      started: record.started,
      depositDetectedTimestamp: record.deposit_detected_ts[0] ?? null,
      expiryTimestamp:
        record.expires_at[0] ??
        deriveDepositExpiryTimestamp({
          depositDetectedTimestamp: record.deposit_detected_ts[0] ?? null,
          depositWindowSeconds: record.ltv_timer_s,
        }),
      borrowChain:
        chainOptions.borrowChain ??
        inferInstantLoanDeliveryChain(borrowDestination, borrowAsset),
    });
  }

  private async getCollateralAmountHint(loanId: bigint): Promise<bigint> {
    const apiClient = this.requireApi("Instant loan collateral hint");
    const response =
      await apiClient.get<V1InstantLoanCollateralHintResponseWire>(
        buildInstantLoanCollateralHintPath({ loanId })
      );

    return parseUnsignedApiBigint(response.collateralAmountHint, {
      context: INSTANT_LOAN_WIRE_CONTEXT,
      label: "collateral amount",
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
      depositTargetSet,
      repaymentTargetSet,
      collateralPosition,
      borrowPosition,
      borrowPoolRate,
      activeActivities,
    ] = await Promise.all([
      this.resolveInstantLoanInflowTargets({
        profileId,
        poolId: collateralPoolId,
        action: SupplyAction.deposit,
      }),
      this.resolveInstantLoanInflowTargets({
        profileId,
        poolId: borrowPoolId,
        action: SupplyAction.repayment,
      }),
      this.positions.getPosition(profileId, collateralPoolId),
      this.positions.getPosition(profileId, borrowPoolId),
      this.positions.market.getPoolRate(borrowPoolId),
      this.activities.list({ profileId, filter: ActivityFilter.active }),
    ]);

    const totalDebtAmount = calculateTotalDebtAmount(borrowPosition);
    const interestBufferAmount = calculateInterestBufferAmount(
      borrowPosition,
      borrowPoolRate.borrowRate
    );

    const currentCollateralAmount = collateralPosition?.deposited ?? 0n;

    const collateralAmount = input.collateralAmount;
    const collateralDecimals =
      collateralPosition?.depositedDecimals ??
      getAssetNativeDecimals(collateralAsset);
    const collateralInterestAmount = collateralPosition?.earnedInterest ?? 0n;

    const borrowedAmount = borrowPosition?.borrowed ?? 0n;
    const borrowedDecimals =
      borrowPosition?.borrowedDecimals ?? getAssetNativeDecimals(borrowAsset);

    const debtInterestAmount = borrowPosition?.debtInterest ?? 0n;

    const status = deriveInstantLoanStatus({
      started: input.started,
      depositDetectedTimestamp: input.depositDetectedTimestamp,
      expiryTimestamp: input.expiryTimestamp,
      collateralAmount: currentCollateralAmount,
      totalDebtAmount,
      activeActivities,
    });

    const initialDeposit = await this.createInitialDepositQuote({
      collateralAmount,
      decimals: collateralDecimals,
      asset: collateralAsset,
      targets: depositTargetSet.targets,
      detectedTimestamp: input.depositDetectedTimestamp,
      expiryTimestamp: input.expiryTimestamp,
    });

    const repaymentTargets = await this.createRepaymentTargetQuotes({
      baseRepaymentAmount: totalDebtAmount + interestBufferAmount,
      asset: borrowAsset,
      targets: repaymentTargetSet.targets,
    });

    const repayment = {
      decimals: borrowedDecimals,
      debtAmount: totalDebtAmount,
      interestBufferAmount,
      interestBufferSeconds: REPAYMENT_BUFFER_SECONDS,
      asset: borrowAsset,
      targets: repaymentTargets,
    };
    const borrowIdentifier = getInstantLoanAssetIdentifier(
      borrowAsset,
      input.borrowChain,
      "borrow"
    );

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
        asset: collateralAsset,
        poolId: collateralPoolId,
        decimals: collateralDecimals,
        amount: collateralAmount,
      },
      borrow: {
        ...borrowIdentifier,
        poolId: borrowPoolId,
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

  private async createInitialDepositQuote(
    input: InstantLoanInitialDepositQuoteInput
  ): Promise<InstantLoanInitialDeposit> {
    const targets: Partial<
      Record<Chain, InstantLoanInitialDepositTargetQuote>
    > = {};

    for (const chain of INSTANT_LOAN_CHAINS) {
      const target = input.targets[chain];
      if (!target) continue;
      assertTargetAsset(target, input.asset);

      const inflowFee = await this.lending.estimateInflowFee(target);
      targets[chain] = {
        amount: input.collateralAmount + inflowFee.totalFee,
        inflowFeeAmount: inflowFee.totalFee,
        target,
      };
    }

    return {
      decimals: input.decimals,
      collateralAmount: input.collateralAmount,
      asset: input.asset,
      targets,
      detectedTimestamp: input.detectedTimestamp,
      expiryTimestamp: input.expiryTimestamp,
    };
  }

  private async resolveInstantLoanInflowTargets(
    request: ResolveInstantLoanInflowTargetsRequest
  ): Promise<ResolvedInstantLoanInflowTargets> {
    const selectedPool = await getPoolById(
      this.canisterContext,
      request.poolId
    );
    const baseRequest = {
      profileId: request.profileId,
      poolId: request.poolId,
      action: request.action,
      mechanism: SupplyPlanType.transfer,
    };
    const poolChainTarget = await resolveSupplyTargetForPool(
      this.canisterContext,
      baseRequest,
      selectedPool
    );
    const poolChain = poolChainTarget.chain;
    const targets: Partial<Record<Chain, SupplyTarget>> = {
      [poolChain]: poolChainTarget,
    };

    if (poolChain === CoreChain.ICP) {
      return { targets };
    }

    const icpTarget = await resolveSupplyTargetForPool(
      this.canisterContext,
      { ...baseRequest, chain: CoreChain.ICP },
      selectedPool
    );

    targets[CoreChain.ICP] = icpTarget;
    return { targets };
  }

  private async createRepaymentTargetQuotes(input: {
    baseRepaymentAmount: bigint;
    asset: InstantLoanAsset;
    targets: Partial<Record<Chain, SupplyTarget>>;
  }): Promise<Partial<Record<Chain, InstantLoanRepaymentTargetQuote>>> {
    const quotes: Partial<Record<Chain, InstantLoanRepaymentTargetQuote>> = {};

    for (const chain of INSTANT_LOAN_CHAINS) {
      const target = input.targets[chain];
      if (!target) continue;
      assertTargetAsset(target, input.asset);

      const repaymentInflowFee =
        input.baseRepaymentAmount > 0n
          ? await this.estimateRepaymentInflowFee(target)
          : { totalFee: 0n, estimateAvailable: false };

      quotes[chain] = {
        amount: input.baseRepaymentAmount + repaymentInflowFee.totalFee,
        inflowFeeAmount: repaymentInflowFee.totalFee,
        inflowFeeEstimateAvailable: repaymentInflowFee.estimateAvailable,
        target,
      };
    }

    return quotes;
  }

  private async estimateRepaymentInflowFee(
    target: SupplyTarget
  ): Promise<RepaymentInflowFeeEstimate> {
    try {
      const fee = await this.lending.estimateInflowFee(target);
      return { totalFee: fee.totalFee, estimateAvailable: true };
    } catch {
      return {
        totalFee: getRepaymentInflowFeeFallback(target.asset, target.chain),
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
        borrowAmount: request.borrow.amount,
        borrowPoolId: request.borrow.poolId,
        collateralAmount: request.collateral.amount,
        collateralPoolId: request.collateral.poolId,
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

function getRepaymentInflowFeeFallback(
  asset: InstantLoanAsset,
  chain: Chain
): bigint {
  if (chain === "ETH" && (asset === "USDT" || asset === "USDC")) {
    return ETH_STABLECOIN_INFLOW_FEE_FALLBACK;
  }

  return 0n;
}

function assertTargetAsset(
  target: SupplyTarget,
  expectedAsset: InstantLoanAsset
): void {
  if (target.asset === expectedAsset) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.INTERNAL,
    `Instant loan pool target asset ${target.asset} does not match ${expectedAsset}`
  );
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

function deriveInstantLoanStatus(
  input: DeriveInstantLoanStatusInput
): LiquidiumStatus {
  const activeActivityStatus = deriveActiveInstantLoanActivityStatus(input);
  if (activeActivityStatus) {
    return activeActivityStatus;
  }

  if (input.totalDebtAmount > 0n) {
    return createLiquidiumStatus({
      operation: "repayment",
      state: "active",
    });
  }

  if (input.started) {
    return createLiquidiumStatus({
      operation: "repayment",
      state: "completed",
    });
  }

  if (isInstantLoanDepositExpired(input)) {
    return createLiquidiumStatus({
      operation: "deposit",
      state: "expired",
    });
  }

  if (input.collateralAmount > 0n) {
    return createLiquidiumStatus({
      operation: "deposit",
      state: "processing",
    });
  }

  if (input.depositDetectedTimestamp !== null) {
    return createLiquidiumStatus({
      operation: "deposit",
      state: "confirming",
    });
  }

  return createLiquidiumStatus({
    operation: "deposit",
    state: "action_required",
  });
}

function deriveActiveInstantLoanActivityStatus(
  input: DeriveInstantLoanStatusInput
): LiquidiumStatus | null {
  if (!input.started) {
    return findActiveActivityStatus(input.activeActivities, "deposit");
  }

  const borrowStatus = findActiveActivityStatus(
    input.activeActivities,
    "borrow"
  );
  if (borrowStatus) {
    return borrowStatus;
  }

  return findActiveActivityStatus(input.activeActivities, "repayment");
}

function findActiveActivityStatus(
  activities: Activity[],
  operation: LiquidiumStatus["operation"]
): LiquidiumStatus | null {
  const activity = activities.find(
    (candidate) => candidate.status.operation === operation
  );

  return activity?.status ?? null;
}

function isInstantLoanDepositExpired(
  input: DeriveInstantLoanStatusInput
): boolean {
  if (input.started || input.depositDetectedTimestamp === null) {
    return false;
  }

  if (input.expiryTimestamp === null) {
    return false;
  }

  return input.expiryTimestamp <= getCurrentUnixTimestampSeconds();
}

function getCurrentUnixTimestampSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / MILLISECONDS_PER_SECOND));
}

function deriveDepositExpiryTimestamp(
  input: DeriveDepositExpiryTimestampInput
): bigint | null {
  if (input.depositDetectedTimestamp === null) {
    return null;
  }

  return input.depositDetectedTimestamp + input.depositWindowSeconds;
}

function validateCreateRequest(request: CreateInstantLoanRequest): void {
  getInstantLoanAssetIdentifier(
    request.borrow.asset,
    request.borrow.chain,
    "borrow"
  );
  getInstantLoanAssetIdentifier(
    request.collateral.asset,
    request.refund.chain,
    "refund"
  );

  if (request.collateral.amount <= 0n) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan collateral amount must be greater than zero"
    );
  }
  if (request.borrow.amount <= 0n) {
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
  error: LtvCalculationErrorDetails | undefined
): never {
  throw new LiquidiumError(
    error?.code === QuoteValidationErrorCode.POOL_NOT_FOUND
      ? LiquidiumErrorCode.POOL_NOT_FOUND
      : LiquidiumErrorCode.VALIDATION_ERROR,
    error?.message ?? "Unable to calculate instant loan LTV"
  );
}

function inferInstantLoanDeliveryChain(
  destination: InstantLoanAccount,
  asset: InstantLoanAsset
): Chain {
  if (destination.type !== "ChainAddress") {
    return CoreChain.ICP;
  }

  if (asset === CoreAsset.BTC) {
    return CoreChain.BTC;
  }

  if (asset === CoreAsset.USDC || asset === CoreAsset.USDT) {
    return CoreChain.ETH;
  }

  return CoreChain.ICP;
}

function resolveInstantLoanDestination(
  params: ResolveInstantLoanDestinationParams
): InstantLoanApiAccountType {
  getInstantLoanAssetIdentifier(params.asset, params.chain, params.role);

  if (typeof params.destination === "string") {
    return resolveInstantLoanStringDestination({
      destination: params.destination,
      asset: params.asset,
      role: params.role,
      chain: params.chain,
      normalizeExternalDestination: params.normalizeExternalDestination,
    });
  }

  assertInstantLoanDestinationTypeMatchesChain({
    destinationType: params.destination.type,
    asset: params.asset,
    role: params.role,
    chain: params.chain,
  });

  switch (params.destination.type) {
    case "ChainAddress":
      assertExternalInstantLoanDestinationSupported(params.asset);

      return {
        External: params.normalizeExternalDestination(
          normalizeInstantLoanDestinationAddress(params.destination.address),
          params.asset,
          params.chain
        ),
      };
    case "IcPrincipal":
      return {
        Native: normalizeInstantLoanPrincipal(
          normalizeInstantLoanDestinationAddress(params.destination.address)
        ),
      };
    case "IcpAccountIdentifier":
      return parseAccountIdentifierInstantLoanDestination(
        normalizeInstantLoanDestinationAddress(params.destination.address)
      );
    case "IcrcAccount":
      return parseIcrcInstantLoanDestination(
        normalizeInstantLoanDestinationAddress(params.destination.address)
      );
  }
}

function resolveInstantLoanStringDestination(params: {
  destination: string;
  asset: InstantLoanAsset;
  role: InstantLoanOutflowRole;
  chain: Chain;
  normalizeExternalDestination: ExternalDestinationNormalizer;
}): InstantLoanApiAccountType {
  const address = normalizeInstantLoanDestinationAddress(params.destination);

  if (params.chain === CoreChain.ICP && params.asset !== CoreAsset.ICP) {
    try {
      return parsePrincipalInstantLoanDestination(address);
    } catch {
      throwInvalidCkInstantLoanDestination(params.role);
    }
  }

  if (params.chain !== CoreChain.ICP) {
    assertExternalInstantLoanDestinationSupported(params.asset);

    return {
      External: params.normalizeExternalDestination(
        address,
        params.asset,
        params.chain
      ),
    };
  }

  for (const parser of [
    parseAccountIdentifierInstantLoanDestination,
    parsePrincipalInstantLoanDestination,
    parseIcrcInstantLoanDestination,
  ]) {
    try {
      return parser(address);
    } catch {}
  }

  throwInvalidIcpInstantLoanDestination();
}

function getInstantLoanAssetIdentifier(
  asset: InstantLoanAsset,
  chain: Chain,
  role: InstantLoanOutflowRole
): AssetIdentifier {
  const identifier = { asset, chain };
  if (isAssetIdentifier(identifier)) {
    return identifier;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `${chain} instant loan ${role} delivery is not supported for ${asset}`
  );
}

function assertInstantLoanDestinationTypeMatchesChain(params: {
  destinationType: Exclude<InstantLoanDestination, string>["type"];
  asset: InstantLoanAsset;
  role: InstantLoanOutflowRole;
  chain: Chain;
}): void {
  if (params.chain === CoreChain.ICP && params.asset !== CoreAsset.ICP) {
    if (params.destinationType === "IcPrincipal") {
      return;
    }

    throwInvalidCkInstantLoanDestination(params.role);
  }

  if (params.chain === CoreChain.ICP && params.asset === CoreAsset.ICP) {
    if (params.destinationType !== "ChainAddress") {
      return;
    }

    throwInvalidIcpInstantLoanDestination();
  }

  if (params.destinationType === "ChainAddress") {
    return;
  }

  if (params.destinationType === "IcPrincipal") {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `${params.chain} instant loan ${params.role} destination must be an external chain address for ${params.asset}`
    );
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `${params.asset} instant loan ${params.role} destination only supports ChainAddress or IcPrincipal destinations`
  );
}

function throwInvalidCkInstantLoanDestination(
  role: InstantLoanOutflowRole
): never {
  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `ICP instant loan ${role} destination must be an IC principal`
  );
}

function assertExternalInstantLoanDestinationSupported(
  asset: InstantLoanAsset
): void {
  if (asset !== CoreAsset.ICP) {
    return;
  }

  throwInvalidIcpInstantLoanDestination();
}

function throwInvalidIcpInstantLoanDestination(): never {
  throw new LiquidiumError(
    LiquidiumErrorCode.INVALID_ADDRESS,
    "ICP instant loan destination must be an IC principal, ICP account identifier, or ICRC account"
  );
}

function parsePrincipalInstantLoanDestination(
  address: string
): InstantLoanApiAccountType {
  return { Native: normalizeInstantLoanPrincipal(address) };
}

function parseAccountIdentifierInstantLoanDestination(
  address: string
): InstantLoanApiAccountType {
  if (address.length !== ICP_ACCOUNT_IDENTIFIER_HEX_LENGTH) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      "Invalid ICP account identifier"
    );
  }

  try {
    return { AccountIdentifier: normalizeIcpAccountIdentifier(address) };
  } catch {
    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      "Invalid ICP account identifier"
    );
  }
}

function parseIcrcInstantLoanDestination(
  address: string
): InstantLoanApiAccountType {
  let decoded: ReturnType<typeof decodeIcrcAccountAddress>;

  try {
    decoded = decodeIcrcAccountAddress(address);
  } catch {
    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      "Invalid instant loan ICRC destination"
    );
  }

  return { Icrc: decoded.account.address };
}

function normalizeInstantLoanPrincipal(address: string): string {
  try {
    return Principal.fromText(address).toText();
  } catch {
    throw new LiquidiumError(
      LiquidiumErrorCode.INVALID_ADDRESS,
      "Invalid instant loan IC principal destination"
    );
  }
}

function normalizeInstantLoanDestinationAddress(address: string): string {
  const trimmedAddress = address.trim();

  if (!trimmedAddress) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan account address must be non-empty"
    );
  }

  return trimmedAddress;
}

function accountFromCanister(
  account: DecodedInstantLoanCanisterRecord["borrow_destination"]
): InstantLoanAccount {
  return mapCanisterAccountToLiquidiumAccount(account);
}

function mapInstantLoanEvent(
  event: DecodedHeadlessLoanEvent
): InstantLoanEvent {
  return {
    id: event.id,
    schemaVersion: event.schema_version,
    timestamp: event.timestamp,
    eventType: mapInstantLoanEventType(event.event_type),
  };
}

function mapInstantLoanEventType(
  eventType: DecodedHeadlessLoanEventType
): InstantLoanEventType {
  if ("LoanCreated" in eventType) {
    const event = eventType.LoanCreated;
    return {
      type: "LoanCreated",
      loanId: event.loan_id,
      borrowDestination: accountFromCanister(event.borrow_destination),
      collateralAsset: parseInstantLoanAsset(
        event.lend_asset,
        "event collateral asset"
      ),
      borrowAmount: event.borrow_amount,
      collateralPoolId: event.lend_pool_id.toText(),
      refundDestination: accountFromCanister(event.refund_destination),
      ltvMaxBps: event.ltv_max_bps,
      depositWindowSeconds: event.ltv_timer_s,
      profileId: event.lending_profile.toText(),
      borrowPoolId: event.borrow_pool_id.toText(),
      borrowAsset: parseInstantLoanAsset(
        event.borrow_asset,
        "event borrow asset"
      ),
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

function validateInstantLoanFindQuery(query: unknown): string {
  if (typeof query !== "string") {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan find query must be a string"
    );
  }

  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan find query must be non-empty"
    );
  }
  if (trimmedQuery.length > INSTANT_LOAN_FIND_QUERY_MAX_LENGTH) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      `Instant loan find query must be at most ${INSTANT_LOAN_FIND_QUERY_MAX_LENGTH.toString()} characters`
    );
  }

  return trimmedQuery;
}

function uniqueInstantLoanFindCandidates(
  candidates: InstantLoanFindCandidate[]
): InstantLoanFindCandidate[] {
  const candidatesByLoanId = new Map<bigint, InstantLoanFindCandidate>();

  for (const candidate of candidates) {
    if (!candidatesByLoanId.has(candidate.loanId)) {
      candidatesByLoanId.set(candidate.loanId, candidate);
    }
  }

  return [...candidatesByLoanId.values()];
}

function mapCandidateWire(
  wire: InstantLoanFindCandidateWire
): InstantLoanFindCandidate {
  return {
    loanId: parseUnsignedApiBigint(wire.loan_id, {
      context: INSTANT_LOAN_WIRE_CONTEXT,
      label: "loan ID",
    }),
    ref: parseNonEmptyApiString(wire.short_ref, {
      context: INSTANT_LOAN_WIRE_CONTEXT,
      label: "short reference",
    }),
    createdAt: parseIsoApiTimestampToUnixSeconds(wire.created_at, {
      context: INSTANT_LOAN_WIRE_CONTEXT,
      label: "creation timestamp",
    }),
    collateral: {
      poolId: parseNonEmptyApiString(wire.lend_pool_ic_id, {
        context: INSTANT_LOAN_WIRE_CONTEXT,
        label: "lend pool ID",
      }),
      asset: parseApiStringUnion(wire.lend_asset, INSTANT_LOAN_ASSETS, {
        context: INSTANT_LOAN_WIRE_CONTEXT,
        label: "lend asset",
      }),
      amount: parseUnsignedApiBigint(wire.collateral_amount, {
        context: INSTANT_LOAN_WIRE_CONTEXT,
        label: "collateral amount",
      }),
    },
    borrow: {
      poolId: parseNonEmptyApiString(wire.borrow_pool_ic_id, {
        context: INSTANT_LOAN_WIRE_CONTEXT,
        label: "borrow pool ID",
      }),
      asset: parseApiStringUnion(wire.borrow_asset, INSTANT_LOAN_ASSETS, {
        context: INSTANT_LOAN_WIRE_CONTEXT,
        label: "borrow asset",
      }),
    },
    profileId: parseNonEmptyApiString(wire.profile, {
      context: INSTANT_LOAN_WIRE_CONTEXT,
      label: "profile ID",
    }),
  };
}

function parseInstantLoanAsset(value: string, label: string): InstantLoanAsset {
  return parseApiStringUnion(value, INSTANT_LOAN_ASSETS, {
    context: INSTANT_LOAN_WIRE_CONTEXT,
    label,
  });
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
