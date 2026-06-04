import type { RegisterProfileRequest } from "../../core/canisters/lending/actor";
import { LiquidiumError, LiquidiumErrorCode } from "../../core/errors";
import { Chain } from "../../core/types";
import { normalizeHexSignature } from "../../core/utils/signature";
import type { CreateAccountRequest } from "./types";

interface AccountBtcChainVariant {
  BTC: null;
}

interface AccountEthChainVariant {
  ETH: null;
}

type AccountChainVariant = AccountBtcChainVariant | AccountEthChainVariant;

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
        signature: normalizeHexSignature(request.signatureInfo.signature),
        chain: mapAccountChainToLendingChainVariant(
          request.signatureInfo.chain
        ),
        account: signingAccount,
      },
    },
  };
}

function mapAccountChainToLendingChainVariant(
  chain: Chain
): AccountChainVariant {
  switch (chain) {
    case Chain.BTC:
      return { BTC: null };
    case Chain.ETH:
      return { ETH: null };
  }
}
