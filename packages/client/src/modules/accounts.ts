import { Actor } from "@dfinity/agent";
import type { IDL } from "@dfinity/candid";
import { LiquidiumError, LiquidiumErrorCode } from "../errors";
import type { InternalProvider } from "../internal/provider";
import type {
  Chain,
  CreateAccountAction,
  CreateAccountRequest,
  Wallet,
} from "../types";

const SIGNATURE_VALIDITY_5_MINUTES_SECONDS = 5n * 60n;

/**
 * Account and profile management.
 *
 * All methods route through the canister.
 */
export class AccountsModule {
  /** @internal */
  constructor(readonly provider: InternalProvider) {}

  async create(options: { account: string }): Promise<CreateAccountAction>;

  /**
   * Create a new signable portfolio creation action.
   */
  async create(options: { account: string }): Promise<CreateAccountAction> {
    return await this.createPreparedAction(options.account);
  }

  private async createPreparedAction(
    account: string
  ): Promise<CreateAccountAction> {
    const lendingActor = createLendingAccountsActor(this.provider);

    try {
      await assertWalletHasNoProfile(this.provider, account);

      const nonce = await lendingActor.get_nonce(account);
      const expiryTimestamp = computeExpiryTimestamp();
      return {
        kind: "create-account",
        account,
        message: createInitializeAccountMessage(expiryTimestamp, nonce),
        data: {
          expiryTimestamp,
        },
        submit: async (signatureInfo) => {
          return await this.submitCreate({
            data: {
              expiryTimestamp,
            },
            signatureInfo,
          });
        },
      };
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw toCanisterCallError("get_nonce", error);
    }
  }

  private async submitCreate(request: CreateAccountRequest): Promise<string> {
    const lendingActor = createLendingAccountsActor(this.provider);

    try {
      await assertWalletHasNoProfile(
        this.provider,
        request.signatureInfo.account
      );

      const result = await lendingActor.register_profile(
        toRegisterProfileRequest(request)
      );

      if ("Err" in result) {
        throw toProtocolError(result.Err);
      }

      return result.Ok.toText();
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw toCanisterCallError("register_profile", error);
    }
  }

  /**
   * Get the wallets linked to a profile.
   */
  async getProfile(profileId: string): Promise<Wallet[]> {
    void profileId;
    // TODO: wire to canister via LendingPool.get_profile
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Resolve a wallet address to its profile principal, or null if not found.
   */
  async resolveProfile(walletAddress: string): Promise<string | null> {
    try {
      const profile = await createLendingAccountsActor(
        this.provider
      ).get_wallet_profile(walletAddress);

      return profile[0]?.toText() ?? null;
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw toCanisterCallError("get_wallet_profile", error);
    }
  }

  /**
   * Link an additional wallet to an existing profile.
   */
  async linkWallet(
    profileId: string,
    newWalletAddress: string,
    chain: Chain
  ): Promise<void> {
    void profileId;
    void newWalletAddress;
    void chain;
    // TODO: wire to canister via LendingPool.add_account
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Remove a wallet from a profile.
   */
  async unlinkWallet(
    profileId: string,
    walletAddress: string
  ): Promise<void> {
    void profileId;
    void walletAddress;
    // TODO: wire to canister via LendingPool.remove_account
    throw new LiquidiumError(
      LiquidiumErrorCode.INTERNAL,
      "Not yet implemented"
    );
  }

  /**
   * Get the current nonce for a wallet address.
   */
  async getNonce(walletAddress: string): Promise<bigint> {
    try {
      return await createLendingAccountsActor(this.provider).get_nonce(
        walletAddress
      );
    } catch (error) {
      if (error instanceof LiquidiumError) {
        throw error;
      }

      throw toCanisterCallError("get_nonce", error);
    }
  }
}

interface SignatureInfoVariant {
  signature: string;
  chain: ChainVariant;
  account: string;
}

type ChainVariant = { BTC: null } | { ETH: null };

type SignatureVerificationError =
  | { InvalidEthSignature: null }
  | { UnsupportedChain: null }
  | { InvalidEthAddress: null }
  | { CouldNotDecode: string }
  | { ProfileNotFound: null }
  | { InvalidBtcSignature: null };

type ProtocolError =
  | { PositionNotFound: null }
  | { Internal: string }
  | { InvalidAddress: string }
  | { InvalidTargetPrincipal: null }
  | { SignatureError: SignatureVerificationError }
  | { SupplyCapExceeded: null }
  | { AccountNotFound: null }
  | { NotAllowed: string }
  | { PoolNotFound: string }
  | { FeeClaimReceiverNotConfigured: null }
  | { InsufficientCollateral: null }
  | { ProfileNotFound: null }
  | { SignatureExpiryTooFarInFuture: null }
  | { MaxLtvExceeded: null }
  | { ProfileAlreadyExists: null }
  | { LiquidationNotFound: string }
  | { HealthFactorTooLow: null }
  | { NoLiquidity: null }
  | { SignatureExpired: null }
  | { BorrowingDisabled: null }
  | { BorrowCapExceeded: null }
  | { PoolFrozen: null }
  | { TransferFailed: string }
  | { AccountAlreadyLinked: null }
  | { CannotRemoveSoleAccount: null }
  | { InsufficientFunds: null };

interface RegisterProfileRequest {
  data: {
    expiry_timestamp: bigint;
  };
  signature_info: {
    Wallet: SignatureInfoVariant;
  };
}

type RegisterProfileResult =
  | { Ok: { toText(): string } }
  | { Err: ProtocolError };

interface LendingAccountsActor {
  get_nonce(walletAddress: string): Promise<bigint>;
  get_wallet_profile(walletAddress: string): Promise<[] | [{ toText(): string }]>;
  register_profile(
    request: RegisterProfileRequest
  ): Promise<RegisterProfileResult>;
}

const lendingAccountsIdlFactory: IDL.InterfaceFactory = ({ IDL }) => {
  const Chains = IDL.Variant({
    BTC: IDL.Null,
    ETH: IDL.Null,
  });
  const SignatureInfo = IDL.Record({
    signature: IDL.Text,
    chain: Chains,
    account: IDL.Text,
  });
  const SignatureScheme = IDL.Variant({ Wallet: SignatureInfo });
  const InitializeAccountRequest = IDL.Record({
    expiry_timestamp: IDL.Nat64,
  });
  const SignedInitializeAccountRequest = IDL.Record({
    data: InitializeAccountRequest,
    signature_info: SignatureScheme,
  });
  const SignatureVerificationError = IDL.Variant({
    InvalidEthSignature: IDL.Null,
    UnsupportedChain: IDL.Null,
    InvalidEthAddress: IDL.Null,
    CouldNotDecode: IDL.Text,
    ProfileNotFound: IDL.Null,
    InvalidBtcSignature: IDL.Null,
  });
  const ProtocolError = IDL.Variant({
    PositionNotFound: IDL.Null,
    Internal: IDL.Text,
    InvalidAddress: IDL.Text,
    InvalidTargetPrincipal: IDL.Null,
    SignatureError: SignatureVerificationError,
    SupplyCapExceeded: IDL.Null,
    AccountNotFound: IDL.Null,
    NotAllowed: IDL.Text,
    PoolNotFound: IDL.Text,
    FeeClaimReceiverNotConfigured: IDL.Null,
    InsufficientCollateral: IDL.Null,
    ProfileNotFound: IDL.Null,
    SignatureExpiryTooFarInFuture: IDL.Null,
    MaxLtvExceeded: IDL.Null,
    ProfileAlreadyExists: IDL.Null,
    LiquidationNotFound: IDL.Text,
    HealthFactorTooLow: IDL.Null,
    NoLiquidity: IDL.Null,
    SignatureExpired: IDL.Null,
    BorrowingDisabled: IDL.Null,
    BorrowCapExceeded: IDL.Null,
    PoolFrozen: IDL.Null,
    TransferFailed: IDL.Text,
    AccountAlreadyLinked: IDL.Null,
    CannotRemoveSoleAccount: IDL.Null,
    InsufficientFunds: IDL.Null,
  });
  const RegisterProfileResult = IDL.Variant({
    Ok: IDL.Principal,
    Err: ProtocolError,
  });

  return IDL.Service({
    get_nonce: IDL.Func([IDL.Text], [IDL.Nat], ["query"]),
    get_wallet_profile: IDL.Func([IDL.Text], [IDL.Opt(IDL.Principal)], ["query"]),
    register_profile: IDL.Func(
      [SignedInitializeAccountRequest],
      [RegisterProfileResult],
      []
    ),
  });
};

function createLendingAccountsActor(
  provider: InternalProvider
): LendingAccountsActor {
  const canisterId = provider.canisterIds.lending;

  if (!canisterId) {
    throw new LiquidiumError(
      LiquidiumErrorCode.SERVICE_UNAVAILABLE,
      "Lending canister ID is not configured"
    );
  }

  return Actor.createActor<LendingAccountsActor>(lendingAccountsIdlFactory, {
    agent: provider.agent,
    canisterId,
  });
}

function computeExpiryTimestamp(): bigint {
  return (
    BigInt(Math.floor(Date.now() / 1000)) + SIGNATURE_VALIDITY_5_MINUTES_SECONDS
  );
}

function createInitializeAccountMessage(
  expiryTimestamp: bigint,
  nonce: bigint
): string {
  return `Liquidium: Initialize Account

Action: Create new account
Expires: ${expiryTimestamp}
Nonce: ${nonce}`;
}

async function assertWalletHasNoProfile(
  provider: InternalProvider,
  walletAddress: string
): Promise<void> {
  const existingProfile = await createLendingAccountsActor(
    provider
  ).get_wallet_profile(walletAddress);
  const profileId = existingProfile[0]?.toText();

  if (!profileId) {
    return;
  }

  throw new LiquidiumError(
    LiquidiumErrorCode.PROFILE_ALREADY_EXISTS,
    `Wallet address is already linked to profile ${profileId}`
  );
}

function toRegisterProfileRequest(
  request: CreateAccountRequest
): RegisterProfileRequest {
  return {
    data: {
      expiry_timestamp: request.data.expiryTimestamp,
    },
    signature_info: {
      Wallet: {
        signature: request.signatureInfo.signature,
        chain: toChainVariant(request.signatureInfo.chain),
        account: request.signatureInfo.account,
      },
    },
  };
}

function toChainVariant(chain: Chain): ChainVariant {
  switch (chain) {
    case "BTC":
      return { BTC: null };
    case "ETH":
      return { ETH: null };
  }
}

function toProtocolError(error: ProtocolError): LiquidiumError {
  const [key, payload] = getVariantEntry(error);

  switch (key) {
    case "InvalidTargetPrincipal":
      return new LiquidiumError(LiquidiumErrorCode.INVALID_TARGET_PRINCIPAL);
    case "InsufficientCollateral":
      return new LiquidiumError(LiquidiumErrorCode.INSUFFICIENT_COLLATERAL);
    case "SignatureExpiryTooFarInFuture":
      return new LiquidiumError(
        LiquidiumErrorCode.SIGNATURE_EXPIRY_TOO_FAR_IN_FUTURE
      );
    case "MaxLtvExceeded":
      return new LiquidiumError(LiquidiumErrorCode.MAX_LTV_EXCEEDED);
    case "SignatureExpired":
      return new LiquidiumError(LiquidiumErrorCode.SIGNATURE_EXPIRED);
    case "AccountAlreadyLinked":
      return new LiquidiumError(LiquidiumErrorCode.ACCOUNT_ALREADY_LINKED);
    case "AccountNotFound":
      return new LiquidiumError(LiquidiumErrorCode.ACCOUNT_NOT_FOUND);
    case "CannotRemoveSoleAccount":
      return new LiquidiumError(LiquidiumErrorCode.CANNOT_REMOVE_SOLE_ACCOUNT);
    case "ProfileNotFound":
      return new LiquidiumError(LiquidiumErrorCode.PROFILE_NOT_FOUND);
    case "ProfileAlreadyExists":
      return new LiquidiumError(LiquidiumErrorCode.PROFILE_ALREADY_EXISTS);
    case "SignatureError":
      return toSignatureError(payload as SignatureVerificationError);
    case "PoolNotFound":
      return new LiquidiumError(
        LiquidiumErrorCode.POOL_NOT_FOUND,
        getTextMessage(payload, "Pool not found")
      );
    case "PoolFrozen":
      return new LiquidiumError(LiquidiumErrorCode.POOL_FROZEN);
    case "PositionNotFound":
      return new LiquidiumError(LiquidiumErrorCode.POSITION_NOT_FOUND);
    case "BorrowCapExceeded":
      return new LiquidiumError(LiquidiumErrorCode.BORROW_CAP_EXCEEDED);
    case "SupplyCapExceeded":
      return new LiquidiumError(LiquidiumErrorCode.SUPPLY_CAP_EXCEEDED);
    case "InsufficientFunds":
      return new LiquidiumError(LiquidiumErrorCode.INSUFFICIENT_FUNDS);
    case "HealthFactorTooLow":
      return new LiquidiumError(LiquidiumErrorCode.HEALTH_FACTOR_TOO_LOW);
    case "TransferFailed":
      return new LiquidiumError(
        LiquidiumErrorCode.TRANSFER_FAILED,
        getTextMessage(payload, "Transfer failed")
      );
    case "LiquidationNotFound":
      return new LiquidiumError(
        LiquidiumErrorCode.LIQUIDATION_NOT_FOUND,
        getTextMessage(payload, "Liquidation not found")
      );
    case "BorrowingDisabled":
      return new LiquidiumError(LiquidiumErrorCode.BORROWING_DISABLED);
    case "NoLiquidity":
      return new LiquidiumError(LiquidiumErrorCode.NO_LIQUIDITY);
    case "NotAllowed":
      return new LiquidiumError(
        LiquidiumErrorCode.NOT_ALLOWED,
        getTextMessage(payload, "Operation not allowed")
      );
    case "InvalidAddress":
      return new LiquidiumError(
        LiquidiumErrorCode.INVALID_ADDRESS,
        getTextMessage(payload, "Invalid address")
      );
    case "Internal":
      return new LiquidiumError(
        LiquidiumErrorCode.INTERNAL,
        getTextMessage(payload, "Internal protocol error")
      );
    case "FeeClaimReceiverNotConfigured":
      return new LiquidiumError(
        LiquidiumErrorCode.INTERNAL,
        "Fee claim receiver is not configured"
      );
  }

  return new LiquidiumError(
    LiquidiumErrorCode.INTERNAL,
    "Unknown protocol error"
  );
}

function toSignatureError(error: SignatureVerificationError): LiquidiumError {
  const [key, payload] = getVariantEntry(error);

  switch (key) {
    case "InvalidEthSignature":
      return new LiquidiumError(LiquidiumErrorCode.INVALID_ETH_SIGNATURE);
    case "InvalidBtcSignature":
      return new LiquidiumError(LiquidiumErrorCode.INVALID_BTC_SIGNATURE);
    case "InvalidEthAddress":
      return new LiquidiumError(LiquidiumErrorCode.INVALID_ETH_ADDRESS);
    case "UnsupportedChain":
      return new LiquidiumError(LiquidiumErrorCode.UNSUPPORTED_CHAIN);
    case "ProfileNotFound":
      return new LiquidiumError(LiquidiumErrorCode.PROFILE_NOT_FOUND);
    case "CouldNotDecode":
      return new LiquidiumError(
        LiquidiumErrorCode.SIGNATURE_ERROR,
        getTextMessage(payload, "Could not decode signature")
      );
  }

  return new LiquidiumError(
    LiquidiumErrorCode.SIGNATURE_ERROR,
    "Unknown signature verification error"
  );
}

function toCanisterCallError(
  methodName: string,
  cause: unknown
): LiquidiumError {
  return new LiquidiumError(
    LiquidiumErrorCode.CANISTER_REJECTED,
    `Canister call failed: ${methodName}`,
    cause
  );
}

function getVariantEntry<T extends Record<string, unknown>>(
  variant: T
): [keyof T & string, unknown] {
  const [entry] = Object.entries(variant) as [
    [keyof T & string, unknown],
    ...Array<[keyof T & string, unknown]>,
  ];

  return entry;
}

function getTextMessage(payload: unknown, fallback: string): string {
  return typeof payload === "string" ? payload : fallback;
}
