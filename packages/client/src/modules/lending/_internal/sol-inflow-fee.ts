import { Principal } from "@icp-sdk/core/principal";
import { validateSolAmount } from "../../../core/address-validation";
import { LiquidiumError, LiquidiumErrorCode } from "../../../core/errors";
import { SdkApiPath } from "../../../core/sdk-api-paths";
import type { ApiClient } from "../../../core/transports/api-client";
import { parseUnsignedApiBigint } from "../../../core/utils/api-response-parsers";
import type { EstimateInflowFeeRequest, InflowFeeEstimate } from "../types";

interface SolInflowFeeWire {
  totalFee: string;
  minimumSendAmount: string;
  walletTransferFee: string;
}

export async function estimateSolInflowFee(
  api: ApiClient,
  request: EstimateInflowFeeRequest
): Promise<InflowFeeEstimate> {
  if (
    !request.poolId ||
    !request.profileId ||
    (request.action !== "deposit" && request.action !== "repayment")
  ) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "SOL fee estimates require poolId, profileId, and action"
    );
  }
  const query = new URLSearchParams({
    poolId: Principal.fromText(request.poolId).toText(),
    profileId: Principal.fromText(request.profileId).toText(),
    operation: request.action,
    chain: request.chain,
  });
  const response = await api.get<SolInflowFeeWire>(
    `${SdkApiPath.solInflowFee}?${query}`
  );
  const parseAmount = (value: string, label: string) =>
    parseUnsignedApiBigint(value, { context: "SOL inflow fee", label });
  const totalFee = parseAmount(response.totalFee, "total fee");
  const minimumSendAmount = parseAmount(
    response.minimumSendAmount,
    "minimum send"
  );
  validateSolAmount(minimumSendAmount);
  if (minimumSendAmount <= totalFee) {
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "SOL minimum send must cover fees and a positive credit"
    );
  }
  return {
    totalFee,
    minimumSendAmount,
    walletTransferFee: parseAmount(
      response.walletTransferFee,
      "wallet transfer fee"
    ),
  };
}
