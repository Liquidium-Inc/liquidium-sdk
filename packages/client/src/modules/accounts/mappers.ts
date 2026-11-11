import type { RegisterProfileRequest } from "../../core/canisters/lending/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { normalizeWalletSignature } from "../../core/utils/signature";
import { mapWalletChainToLendingChain } from "../lending/mappers";
import type { CreateAccountRequest } from "./types";

export function mapCreateAccountRequestToRegisterProfileRequest(
  request: CreateAccountRequest
): RegisterProfileRequest {
  const signingAccount = request.signatureInfo.account;

  if (!signingAccount) {
    throw new LiquidiumError(
      LiquidiumErrorCode.VALIDATION_ERROR,
      "Account creation requires the signing account"
    );
  }

  return {
    data: {
      expiry_timestamp: request.data.expiryTimestamp,
    },
    signature_info: {
      Wallet: {
        signature: normalizeWalletSignature(
          request.signatureInfo.signature,
          request.signatureInfo.chain
        ),
        chain: mapWalletChainToLendingChain(request.signatureInfo.chain),
        account: signingAccount,
      },
    },
  };
}
