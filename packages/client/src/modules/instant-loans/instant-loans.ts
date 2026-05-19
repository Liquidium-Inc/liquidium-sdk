import { Principal } from "@dfinity/principal";
import {
  createInstantLoansActor,
  type InstantLoanAccountType,
  type InstantLoanAsset as InstantLoanAssetVariant,
  type InstantLoanCanisterRecord,
  type InstantLoansCanisterError,
} from "../../core/canisters/instant-loans/actor";
import { mapCanisterCallErrorToLiquidiumError } from "../../core/canisters/lending/error-mappers";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { buildInstantLoanAddressLookupPath } from "../../core/sdk-api-paths";
import type { ApiClient } from "../../core/transports/api-client";
import type { CanisterContext } from "../../core/transports/canister-context";
import { type Asset, type Chain, SupplyAction } from "../../core/types";
import { getVariantKey } from "../../core/utils/variant";
import { resolveSupplyTarget } from "../lending/_internal/supply-targets";
import type { LendingModule } from "../lending/lending";
import { SupplyPlanType } from "../lending/types";
import type { PositionsModule } from "../positions";
import type { Position } from "../positions/types";
import { QuoteModule } from "../quote";
import { QuoteValidationErrorCode } from "../quote/types";
import { intFromPublicId, publicIdFromInt } from "./ref-code";
import type {
  CreateInstantLoanRequest,
  ExternalAccount,
  InstantLoan,
  InstantLoanAccount,
  InstantLoanAsset,
  InstantLoanCandidate,
  InstantLoanGetRequest,
} from "./types";

const REPAYMENT_BUFFER_SECONDS = 86_400n;
const RATE_SCALE = 10n ** 27n;
const SECONDS_PER_YEAR = 31_536_000n;
const ETH_STABLECOIN_INFLOW_FEE_FALLBACK = 1_500_000n;
const INSTANT_LOAN_MIN_SLIPPAGE_BUFFER_BPS = 200n;

type InstantLoanLtvPolicy = {
  ltvBps: bigint;
  minLtvMaxBps: bigint;
  maxLtvMaxBps: bigint;
};

type InstantLoanCandidateWire = {
  loanId?: string | bigint;
  loan_id?: string | bigint;
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
  collateralAmountHint?: string | bigint;
  min_deposit_hint?: string | bigint;
};

export class InstantLoansModule {
  constructor(
    readonly canisterContext: CanisterContext,
    readonly apiClient: ApiClient | undefined,
    readonly lending: LendingModule,
    readonly positions: PositionsModule
  ) {}

  /**
   * Creates a profileless instant loan and returns canonical canister state plus
   * deposit/repay targets for the generated lending profile.
   *
   * Use `depositWindowSeconds` for the user-facing collateral deposit timeout;
   * the SDK maps it to the canister's internal `ltv_timer_s` field.
   */
  async create(request: CreateInstantLoanRequest): Promise<InstantLoan> {
    validateCreateRequest(request);
    await this.validateInstantLoanLtvPolicy(request);

    try {
      const result = await createInstantLoansActor(
        this.canisterContext
      ).create_loan({
        borrow_destination: externalAccountFromInput(request.borrowDestination),
        lend_asset: assetVariant(request.collateralAsset),
        borrow_amount: request.borrowAmount,
        lend_pool_id: Principal.fromText(request.collateralPoolId),
        min_deposit_hint: request.collateralAmount,
        refund_destination: externalAccountFromInput(request.refundDestination),
        ltv_max_bps: request.ltvMaxBps,
        borrow_pool_id: Principal.fromText(request.borrowPoolId),
        borrow_asset: assetVariant(request.borrowAsset),
        ltv_timer_s: request.depositWindowSeconds,
      });

      if ("Err" in result) {
        throw mapInstantLoansErrorToLiquidiumError(result.Err);
      }

      return await this.get({ loanId: result.Ok.loan_id });
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("create_loan", error);
    }
  }

  /**
   * Resolves canonical canister state by loan id or short reference.
   *
   * References are decoded locally, then the corresponding loan id is loaded
   * from the instant-loans canister.
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

      return await this.mapLoanRecord(result.Ok);
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw mapCanisterCallErrorToLiquidiumError("get_loan", error);
    }
  }

  /**
   * Finds candidate loans associated with an address. Requires `apiBaseUrl` and
   * returns discovery candidates only; call `get(...)` to hydrate canister state.
   *
   * Candidates are useful for recovery flows where the user knows a borrow or
   * refund address but not the loan reference.
   */
  async findByAddress(address: string): Promise<InstantLoanCandidate[]> {
    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Address lookup requires a non-empty address"
      );
    }

    const apiClient = this.requireApi();
    const response = await apiClient.get<{
      success?: true;
      loans?: InstantLoanCandidateWire[];
      candidates?: InstantLoanCandidateWire[];
    }>(buildInstantLoanAddressLookupPath({ address: trimmedAddress }));

    return (response.candidates ?? response.loans ?? []).map(mapCandidateWire);
  }

  private async mapLoanRecord(
    record: InstantLoanCanisterRecord
  ): Promise<InstantLoan> {
    const profileId = record.lending_profile.toText();
    const collateralPoolId = record.lend_pool_id.toText();
    const borrowPoolId = record.borrow_pool_id.toText();
    const collateralAsset = getVariantKey(record.lend_asset);
    const borrowAsset = getVariantKey(record.borrow_asset);

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

    return {
      loanId: record.id,
      ref: publicIdFromInt(record.id),
      profileId,
      ltvMaxBps: record.ltv_max_bps,
      depositWindowSeconds: record.ltv_timer_s,
      collateral: {
        poolId: collateralPoolId,
        asset: collateralAsset,
        chain: depositTarget.chain,
        amount: record.min_deposit_hint,
      },
      borrow: {
        poolId: borrowPoolId,
        asset: borrowAsset,
        chain: repayTarget.chain,
        amount: record.borrow_amount,
        destination: accountFromCanister(record.borrow_destination),
      },
      refundDestination: accountFromCanister(record.refund_destination),
      depositTarget,
      repayTarget,
      repayment: {
        amount: repaymentAmount,
        decimals: borrowPosition?.borrowedDecimals ?? 0n,
        debtAmount: totalDebtAmount,
        interestBufferAmount,
        interestBufferSeconds: REPAYMENT_BUFFER_SECONDS,
        inflowFeeAmount: repaymentInflowFee.totalFee,
        inflowFeeEstimateAvailable: repaymentInflowFee.estimateAvailable,
        asset: borrowAsset,
        chain: repayTarget.chain,
        target: repayTarget,
      },
      position: {
        collateralAmount: collateralPosition?.deposited ?? 0n,
        collateralDecimals: collateralPosition?.depositedDecimals ?? 0n,
        collateralInterestAmount: collateralPosition?.earnedInterest ?? 0n,
        borrowedAmount: borrowPosition?.borrowed ?? 0n,
        borrowedDecimals: borrowPosition?.borrowedDecimals ?? 0n,
        debtInterestAmount: borrowPosition?.debtInterest ?? 0n,
        totalDebtAmount,
      },
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

  private requireApi(): ApiClient {
    if (!this.apiClient) {
      throw new LiquidiumError(
        LiquidiumErrorCode.VALIDATION_ERROR,
        "Instant loan address lookup requires an API base URL in client config"
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

function externalAccountFromInput(
  account: string | ExternalAccount
): InstantLoanAccountType {
  const address =
    typeof account === "string" ? account.trim() : account.address.trim();
  if (!address) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Instant loan account address must be non-empty"
    );
  }

  return { External: address };
}

function accountFromCanister(
  account: InstantLoanAccountType
): InstantLoanAccount {
  if ("Native" in account) {
    return { type: "Native", principal: account.Native.toText() };
  }

  return { type: "External", address: account.External };
}

function assetVariant(asset: InstantLoanAsset): InstantLoanAssetVariant {
  return { [asset]: null } as InstantLoanAssetVariant;
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

function parseBigintWire(
  value: string | bigint | undefined,
  label: string
): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);

  throw new LiquidiumError(
    LiquidiumErrorCode.VALIDATION_ERROR,
    `Invalid instant loan ${label}`
  );
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
