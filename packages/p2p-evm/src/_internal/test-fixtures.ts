import type { Address, Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { P2pEvmClient } from "../client";
import { generateLenderOfferSalt } from "../core/typed-data";
import type { LenderOffer, P2pEvmPublicClient } from "../core/types";

export const CHAIN_ID = 31_337;
export const PARTNER_ID = 7;
export const LOAN_CORE: Address = "0x1000000000000000000000000000000000000001";
export const FEE_SPLITTER: Address =
  "0x2000000000000000000000000000000000000002";
export const COLLECTION: Address = "0x3000000000000000000000000000000000000003";
export const ASSET: Address = "0x4000000000000000000000000000000000000004";
export const BORROWER: Address = "0x5000000000000000000000000000000000000005";
export const API_BASE_URL = "https://api.test/sdk";
export const API_KEY = "lqp2p_test";

/** A salt whose first four bytes are zero: it names no partner. */
const UNATTRIBUTED_SALT: Hex = `0x00000000${"ab".repeat(28)}`;

export const lenderAccount = privateKeyToAccount(generatePrivateKey());
export const partnerSigner = privateKeyToAccount(generatePrivateKey());
export const oracleAccount = privateKeyToAccount(generatePrivateKey());

type ContractRead = (args: readonly unknown[]) => unknown;

interface FakeLog {
  args: Record<string, unknown>;
  transactionHash: Hex;
  blockNumber: bigint;
}

export interface FakeChain {
  chainId: number;
  /** Contract reads by function name. A missing name rejects, like a revert. */
  reads: Record<string, ContractRead>;
  /** Logs by event name. */
  logs: Record<string, FakeLog[]>;
}

export function createFakeChain(overrides: Partial<FakeChain> = {}): FakeChain {
  return {
    chainId: CHAIN_ID,
    reads: {
      feeRecipient: () => FEE_SPLITTER,
      loanCore: () => LOAN_CORE,
      oracleSigner: () => oracleAccount.address,
      lenderNonce: () => 3n,
      collectionNonce: () => 4n,
      assetNonce: () => 5n,
      ...overrides.reads,
    },
    logs: overrides.logs ?? {},
    ...(overrides.chainId === undefined ? {} : { chainId: overrides.chainId }),
  };
}

export function createFakePublicClient(
  chain: FakeChain = createFakeChain()
): P2pEvmPublicClient {
  const fake = {
    getChainId: async () => chain.chainId,
    readContract: async (request: {
      functionName: string;
      args?: readonly unknown[];
    }) => {
      const read = chain.reads[request.functionName];
      if (!read) {
        throw new Error(`execution reverted: ${request.functionName}`);
      }
      return read(request.args ?? []);
    },
    getLogs: async (request: { event: { name: string } }) =>
      chain.logs[request.event.name] ?? [],
  };
  // SAFETY: the SDK only calls these three methods with the shapes handled above.
  return fake as unknown as P2pEvmPublicClient;
}

export interface FakeApi {
  fetch: typeof fetch;
  requests: { url: string; method: string; body: unknown }[];
}

/** A fetch that answers every request with `respond(url, body)` as JSON. */
export function createFakeApi(
  respond: (url: string, body: unknown) => unknown
): FakeApi {
  const requests: FakeApi["requests"] = [];
  const fakeFetch = async (input: string, init?: RequestInit) => {
    const body =
      typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    requests.push({ url: input, method: init?.method ?? "GET", body });
    return Response.json(respond(input, body));
  };
  // SAFETY: the API client only calls fetch with a string URL.
  return { fetch: fakeFetch as unknown as typeof fetch, requests };
}

export function createTestClient(
  chain: FakeChain = createFakeChain(),
  api?: FakeApi
): P2pEvmClient {
  return new P2pEvmClient({
    chainId: CHAIN_ID,
    loanCoreAddress: LOAN_CORE,
    publicClient: createFakePublicClient(chain),
    partnerId: PARTNER_ID,
    apiKey: api ? API_KEY : undefined,
    apiBaseUrl: API_BASE_URL,
    fetch: api?.fetch,
  });
}

export function createOffer(partnerId = PARTNER_ID): LenderOffer {
  return {
    lender: lenderAccount.address,
    collection: COLLECTION,
    asset: ASSET,
    maxPrincipal: 1_000_000n,
    maxLtvBps: 5_000,
    aprBps: 1_200,
    duration: 604_800,
    expiry: 4_000_000_000n,
    nonce: 3n,
    collectionNonce: 4n,
    assetNonce: 5n,
    salt:
      partnerId === 0 ? UNATTRIBUTED_SALT : generateLenderOfferSalt(partnerId),
  };
}
