import type { RegisterProfileRequest } from "../../core/canisters/lending/actor";
import type { Chain } from "../../core/types";
import type { CreateAccountRequest } from "./types";

type AccountChainVariant = { BTC: null } | { ETH: null };

export function mapCreateAccountRequestToRegisterProfileRequest(
  request: CreateAccountRequest
): RegisterProfileRequest {
  const signingAccount = request.signatureInfo.account;
  if (!signingAccount) {
    throw new Error("Account creation requires the signing account");
  }

  return {
    data: {
      expiry_timestamp: request.data.expiryTimestamp,
    },
    signature_info: {
      Wallet: {
        signature: request.signatureInfo.signature,
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
    case "BTC":
      return { BTC: null };
    case "ETH":
      return { ETH: null };
  }
}
