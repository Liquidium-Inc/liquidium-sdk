import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type {
  ActivityFilter,
  Asset,
  AssetPrices,
  Chain,
  ExternalAccount,
  InflowOperation,
  LiquidiumClient,
  OutflowDestination,
  Pool,
  QuoteRequest,
  SupplyPlanType,
  TransferMode,
  WalletAdapter,
} from "@liquidium/client";
import { useMemo, useState } from "react";
import type { SharedExampleState } from "./example-state";
import { createLiquidiumClient } from "./lib/client";

const MIN_LIST_LIMIT = 1;
const MAX_LIST_LIMIT = 1000;
const DEFAULT_MOCK_SIGNATURE = "replace-with-real-signature";
const DEFAULT_MOCK_TX_HASH = "0xmockedtxhash";

type MethodDefinition = {
  id: string;
  label: string;
  defaultArgs: string;
  execute: (
    client: LiquidiumClient,
    input: unknown
  ) => unknown | Promise<unknown>;
};

const SDK_METHODS: MethodDefinition[] = [
  {
    id: "accounts.prepareCreateProfile",
    label: "accounts.prepareCreateProfile",
    defaultArgs: '{\n  "account": "0xYourWalletAddress"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.accounts.prepareCreateProfile({
        account: expectNonEmptyString(args.account, "account"),
      });
    },
  },
  {
    id: "accounts.createProfile",
    label: "accounts.createProfile",
    defaultArgs:
      '{\n  "account": "0xYourWalletAddress",\n  "chain": "ETH",\n  "mockSignature": "replace-with-real-signature"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.accounts.createProfile({
        account: expectNonEmptyString(args.account, "account"),
        chain: expectChain(args.chain, "chain"),
        walletAdapter: createMockWalletAdapter(
          expectNonEmptyString(args.mockSignature, "mockSignature")
        ),
      });
    },
  },
  {
    id: "accounts.getProfileId",
    label: "accounts.getProfileId",
    defaultArgs: '{\n  "walletAddress": "0xYourWalletAddress"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.accounts.getProfileId(
        expectNonEmptyString(args.walletAddress, "walletAddress")
      );
    },
  },
  {
    id: "accounts.getWalletNonce",
    label: "accounts.getWalletNonce",
    defaultArgs: '{\n  "walletAddress": "0xYourWalletAddress"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.accounts.getWalletNonce(
        expectNonEmptyString(args.walletAddress, "walletAddress")
      );
    },
  },
  {
    id: "accounts.listLinkedWallets",
    label: "accounts.listLinkedWallets",
    defaultArgs: '{\n  "profileId": "aaaaa-aa"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.accounts.listLinkedWallets(
        expectNonEmptyString(args.profileId, "profileId")
      );
    },
  },
  {
    id: "market.listPools",
    label: "market.listPools",
    defaultArgs: "{}",
    execute: async (client) => {
      return await client.market.listPools();
    },
  },
  {
    id: "market.getAssetPrices",
    label: "market.getAssetPrices",
    defaultArgs: "{}",
    execute: async (client) => {
      return await client.market.getAssetPrices();
    },
  },
  {
    id: "market.findPool",
    label: "market.findPool",
    defaultArgs: '{\n  "asset": "BTC",\n  "chain": "BTC"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.market.findPool({
        asset: expectNonEmptyString(args.asset, "asset"),
        chain: expectNonEmptyString(args.chain, "chain"),
      });
    },
  },
  {
    id: "market.getPoolRate",
    label: "market.getPoolRate",
    defaultArgs: '{\n  "poolId": "aaaaa-aa"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.market.getPoolRate(
        expectNonEmptyString(args.poolId, "poolId")
      );
    },
  },
  {
    id: "market.getReserveData",
    label: "market.getReserveData",
    defaultArgs: '{\n  "asset": "BTC",\n  "chain": "BTC"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.market.getReserveData({
        asset: expectNonEmptyString(args.asset, "asset"),
        chain: expectNonEmptyString(args.chain, "chain"),
      });
    },
  },
  {
    id: "positions.getPosition",
    label: "positions.getPosition",
    defaultArgs: '{\n  "profileId": "aaaaa-aa",\n  "poolId": "bbbbb-bb"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.positions.getPosition(
        expectNonEmptyString(args.profileId, "profileId"),
        expectNonEmptyString(args.poolId, "poolId")
      );
    },
  },
  {
    id: "positions.listPositions",
    label: "positions.listPositions",
    defaultArgs: '{\n  "profileId": "aaaaa-aa"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.positions.listPositions(
        expectNonEmptyString(args.profileId, "profileId")
      );
    },
  },
  {
    id: "positions.getHealthFactor",
    label: "positions.getHealthFactor",
    defaultArgs: '{\n  "profileId": "aaaaa-aa"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.positions.getHealthFactor(
        expectNonEmptyString(args.profileId, "profileId")
      );
    },
  },
  {
    id: "positions.getUserStats",
    label: "positions.getUserStats",
    defaultArgs: '{\n  "profileId": "aaaaa-aa"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.positions.getUserStats(
        expectNonEmptyString(args.profileId, "profileId")
      );
    },
  },
  {
    id: "positions.getUserPositionSummary",
    label: "positions.getUserPositionSummary",
    defaultArgs: '{\n  "profileId": "aaaaa-aa"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.positions.getUserPositionSummary(
        expectNonEmptyString(args.profileId, "profileId")
      );
    },
  },
  {
    id: "positions.getUserReserves",
    label: "positions.getUserReserves",
    defaultArgs: '{\n  "profileId": "aaaaa-aa"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.positions.getUserReserves(
        expectNonEmptyString(args.profileId, "profileId")
      );
    },
  },
  {
    id: "positions.getMaxRepayAmount",
    label: "positions.getMaxRepayAmount",
    defaultArgs: '{\n  "profileId": "aaaaa-aa",\n  "poolId": "bbbbb-bb"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.positions.getMaxRepayAmount(
        expectNonEmptyString(args.profileId, "profileId"),
        expectNonEmptyString(args.poolId, "poolId")
      );
    },
  },
  {
    id: "positions.getFullWithdrawAmount",
    label: "positions.getFullWithdrawAmount",
    defaultArgs: '{\n  "profileId": "aaaaa-aa",\n  "poolId": "bbbbb-bb"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.positions.getFullWithdrawAmount(
        expectNonEmptyString(args.profileId, "profileId"),
        expectNonEmptyString(args.poolId, "poolId")
      );
    },
  },
  {
    id: "activities.list",
    label: "activities.list",
    defaultArgs: '{\n  "shortRef": "Y7R19F",\n  "filter": "all"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      const request = args.shortRef
        ? {
            shortRef: expectNonEmptyString(args.shortRef, "shortRef"),
            filter: expectOptionalActivityFilter(args.filter, "filter"),
          }
        : {
            profileId: expectNonEmptyString(args.profileId, "profileId"),
            filter: expectOptionalActivityFilter(args.filter, "filter"),
          };

      return await client.activities.list({
        ...request,
      });
    },
  },
  {
    id: "instantLoans.create",
    label: "instantLoans.create",
    defaultArgs:
      '{\n  "collateralPoolId": "hkmli-faaaa-aaaar-qb4ba-cai",\n  "borrowPoolId": "hnnn4-iyaaa-aaaar-qb4bq-cai",\n  "collateralAsset": "BTC",\n  "borrowAsset": "USDT",\n  "collateralAmount": "37000",\n  "borrowAmount": "9000000",\n  "ltvMaxBps": "6800",\n  "depositWindowSeconds": "3600",\n  "borrowDestination": {\n    "type": "External",\n    "address": "0xYourBorrowAddress"\n  },\n  "refundDestination": {\n    "type": "External",\n    "address": "bc1qYourRefundAddress"\n  }\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.instantLoans.create({
        collateralPoolId: expectNonEmptyString(
          args.collateralPoolId,
          "collateralPoolId"
        ),
        borrowPoolId: expectNonEmptyString(args.borrowPoolId, "borrowPoolId"),
        collateralAsset: expectInstantLoanAsset(
          args.collateralAsset,
          "collateralAsset"
        ),
        borrowAsset: expectInstantLoanAsset(args.borrowAsset, "borrowAsset"),
        collateralAmount: expectBigInt(
          args.collateralAmount,
          "collateralAmount"
        ),
        borrowAmount: expectBigInt(args.borrowAmount, "borrowAmount"),
        ltvMaxBps: expectBigInt(args.ltvMaxBps, "ltvMaxBps"),
        depositWindowSeconds: expectBigInt(
          args.depositWindowSeconds,
          "depositWindowSeconds"
        ),
        borrowDestination: expectInstantLoanAccount(
          args.borrowDestination,
          "borrowDestination"
        ),
        refundDestination: expectInstantLoanAccount(
          args.refundDestination,
          "refundDestination"
        ),
      });
    },
  },
  {
    id: "instantLoans.getByRef",
    label: "instantLoans.get({ ref })",
    defaultArgs: '{\n  "ref": "Y7R19F"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.instantLoans.get({
        ref: expectNonEmptyString(args.ref, "ref"),
      });
    },
  },
  {
    id: "instantLoans.getByLoanId",
    label: "instantLoans.get({ loanId })",
    defaultArgs: '{\n  "loanId": "66"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.instantLoans.get({
        loanId: expectBigInt(args.loanId, "loanId"),
      });
    },
  },
  {
    id: "instantLoans.find",
    label: "instantLoans.find",
    defaultArgs: '{\n  "query": "bc1qYourRefundOrDepositAddress"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.instantLoans.find(
        expectNonEmptyString(args.query, "query")
      );
    },
  },
  {
    id: "activities.getStatus",
    label: "activities.getStatus",
    defaultArgs: '{\n  "profileId": "aaaaa-aa",\n  "id": "receipt-id"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.activities.getStatus({
        profileId: expectNonEmptyString(args.profileId, "profileId"),
        id: expectNonEmptyString(args.id, "id"),
      });
    },
  },
  {
    id: "history.getUserTransactionHistory",
    label: "history.getUserTransactionHistory",
    defaultArgs:
      '{\n  "user": "aaaaa-aa",\n  "filters": {\n    "market": "",\n    "limit": 20\n  }\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      const filters = expectOptionalObject(args.filters, "filters");

      return await client.history.getUserTransactionHistory(
        expectNonEmptyString(args.user, "user"),
        filters
          ? {
              market: expectOptionalString(filters.market, "filters.market"),
              cursor: expectOptionalString(filters.cursor, "filters.cursor"),
              from: expectOptionalString(filters.from, "filters.from"),
              to: expectOptionalString(filters.to, "filters.to"),
              limit: expectOptionalLimit(filters.limit, "filters.limit"),
            }
          : {}
      );
    },
  },
  {
    id: "history.getLiquidationHistory",
    label: "history.getLiquidationHistory",
    defaultArgs:
      '{\n  "user": "aaaaa-aa",\n  "filters": {\n    "market": ""\n  }\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      const filters = expectOptionalObject(args.filters, "filters");

      return await client.history.getLiquidationHistory(
        expectNonEmptyString(args.user, "user"),
        filters
          ? {
              market: expectOptionalString(filters.market, "filters.market"),
            }
          : {}
      );
    },
  },
  {
    id: "quote.getQuote",
    label: "quote.getQuote",
    defaultArgs:
      '{\n  "request": {\n    "borrowAmount": "200000000",\n    "borrowPoolId": "aaaaa-aa",\n    "collateralPoolId": "bbbbb-bb",\n    "targetLtvBps": "3200"\n  },\n  "pools": [],\n  "prices": {}\n}',
    execute: (client, input) => {
      const args = expectObject(input);
      const requestValue = expectObject(args.request, "request");
      const quoteRequest: QuoteRequest = {
        borrowAmount: expectBigInt(
          requestValue.borrowAmount,
          "request.borrowAmount"
        ),
        borrowPoolId: expectNonEmptyString(
          requestValue.borrowPoolId,
          "request.borrowPoolId"
        ),
        collateralPoolId: expectNonEmptyString(
          requestValue.collateralPoolId,
          "request.collateralPoolId"
        ),
        targetLtvBps: expectBigInt(
          requestValue.targetLtvBps,
          "request.targetLtvBps"
        ),
      };

      return client.quote.getQuote(
        quoteRequest,
        expectArray(args.pools, "pools") as Pool[],
        expectObject(args.prices, "prices") as AssetPrices
      );
    },
  },
  {
    id: "lending.prepareWithdraw",
    label: "lending.prepareWithdraw",
    defaultArgs:
      '{\n  "profileId": "aaaaa-aa",\n  "poolId": "bbbbb-bb",\n  "amount": "10000",\n  "receiver": {\n    "address": "bc1..."\n  },\n  "signerWalletAddress": "bc1..."\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.lending.prepareWithdraw({
        profileId: expectNonEmptyString(args.profileId, "profileId"),
        poolId: expectNonEmptyString(args.poolId, "poolId"),
        amount: expectBigInt(args.amount, "amount"),
        receiver: expectReceiver(args.receiver, "receiver"),
        signerWalletAddress: expectNonEmptyString(
          args.signerWalletAddress,
          "signerWalletAddress"
        ),
      });
    },
  },
  {
    id: "lending.withdraw",
    label: "lending.withdraw",
    defaultArgs:
      '{\n  "profileId": "aaaaa-aa",\n  "poolId": "bbbbb-bb",\n  "amount": "10000",\n  "receiver": {\n    "address": "bc1..."\n  },\n  "signerWalletAddress": "bc1...",\n  "signerChain": "BTC",\n  "mockSignature": "replace-with-real-signature"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.lending.withdraw({
        profileId: expectNonEmptyString(args.profileId, "profileId"),
        poolId: expectNonEmptyString(args.poolId, "poolId"),
        amount: expectBigInt(args.amount, "amount"),
        receiver: expectReceiver(args.receiver, "receiver"),
        signerWalletAddress: expectNonEmptyString(
          args.signerWalletAddress,
          "signerWalletAddress"
        ),
        signerChain: expectChain(args.signerChain, "signerChain"),
        signerWalletAdapter: createMockWalletAdapter(
          expectNonEmptyString(args.mockSignature, "mockSignature")
        ),
      });
    },
  },
  {
    id: "lending.prepareBorrow",
    label: "lending.prepareBorrow",
    defaultArgs:
      '{\n  "profileId": "aaaaa-aa",\n  "poolId": "bbbbb-bb",\n  "amount": "10000",\n  "receiver": {\n    "address": "bc1..."\n  },\n  "signerWalletAddress": "bc1..."\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.lending.prepareBorrow({
        profileId: expectNonEmptyString(args.profileId, "profileId"),
        poolId: expectNonEmptyString(args.poolId, "poolId"),
        amount: expectBigInt(args.amount, "amount"),
        receiver: expectReceiver(args.receiver, "receiver"),
        signerWalletAddress: expectNonEmptyString(
          args.signerWalletAddress,
          "signerWalletAddress"
        ),
      });
    },
  },
  {
    id: "lending.borrow",
    label: "lending.borrow",
    defaultArgs:
      '{\n  "profileId": "aaaaa-aa",\n  "poolId": "bbbbb-bb",\n  "amount": "10000",\n  "receiver": {\n    "address": "bc1..."\n  },\n  "signerWalletAddress": "bc1...",\n  "signerChain": "BTC",\n  "mockSignature": "replace-with-real-signature"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.lending.borrow({
        profileId: expectNonEmptyString(args.profileId, "profileId"),
        poolId: expectNonEmptyString(args.poolId, "poolId"),
        amount: expectBigInt(args.amount, "amount"),
        receiver: expectReceiver(args.receiver, "receiver"),
        signerWalletAddress: expectNonEmptyString(
          args.signerWalletAddress,
          "signerWalletAddress"
        ),
        signerChain: expectChain(args.signerChain, "signerChain"),
        signerWalletAdapter: createMockWalletAdapter(
          expectNonEmptyString(args.mockSignature, "mockSignature")
        ),
      });
    },
  },
  {
    id: "lending.supply",
    label: "lending.supply",
    defaultArgs:
      '{\n  "profileId": "aaaaa-aa",\n  "poolId": "bbbbb-bb",\n  "action": "deposit",\n  "mechanism": "transfer",\n  "account": "0xYourWalletAddress",\n  "amount": "1000000",\n  "mockTxHash": "0xmockedtxhash"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      const mockTxHash =
        expectOptionalString(args.mockTxHash, "mockTxHash") ??
        DEFAULT_MOCK_TX_HASH;
      const account = expectOptionalString(args.account, "account");
      const amount =
        args.amount === undefined
          ? undefined
          : expectBigInt(args.amount, "amount");
      const walletAdapter =
        account || amount || args.mockTxHash !== undefined
          ? createMockWalletAdapter(DEFAULT_MOCK_SIGNATURE, mockTxHash)
          : undefined;
      const mechanism = expectOptionalSupplyMechanism(
        args.mechanism,
        "mechanism"
      );
      const transferMode = expectOptionalTransferMode(
        args.transferMode,
        "transferMode"
      );

      if (mechanism === "contractInteraction") {
        return await client.lending.supply({
          profileId: expectNonEmptyString(args.profileId, "profileId"),
          poolId: expectNonEmptyString(args.poolId, "poolId"),
          action: expectSupplyAction(args.action, "action"),
          mechanism,
          account: expectNonEmptyString(args.account, "account"),
          amount: expectBigInt(args.amount, "amount"),
          walletAdapter: createMockWalletAdapter(
            DEFAULT_MOCK_SIGNATURE,
            mockTxHash
          ),
        });
      }

      if (walletAdapter) {
        return await client.lending.supply({
          profileId: expectNonEmptyString(args.profileId, "profileId"),
          poolId: expectNonEmptyString(args.poolId, "poolId"),
          action: expectSupplyAction(args.action, "action"),
          mechanism: "transfer",
          transferMode,
          account: expectNonEmptyString(args.account, "account"),
          amount: expectBigInt(args.amount, "amount"),
          walletAdapter,
        });
      }

      return await client.lending.supply({
        profileId: expectNonEmptyString(args.profileId, "profileId"),
        poolId: expectNonEmptyString(args.poolId, "poolId"),
        action: expectSupplyAction(args.action, "action"),
        mechanism: "transfer",
        transferMode,
      });
    },
  },
  {
    id: "lending.estimateInflowFee",
    label: "lending.estimateInflowFee",
    defaultArgs: '{\n  "asset": "USDT",\n  "chain": "ETH"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.lending.estimateInflowFee({
        asset: expectAsset(args.asset, "asset"),
        chain: expectChain(args.chain, "chain"),
        transferMode: expectOptionalTransferMode(
          args.transferMode,
          "transferMode"
        ),
        mechanism: expectOptionalSupplyMechanism(args.mechanism, "mechanism"),
      });
    },
  },
  {
    id: "lending.submitInflow",
    label: "lending.submitInflow",
    defaultArgs:
      '{\n  "txid": "replace-with-txid",\n  "chain": "BTC",\n  "operation": "deposit"\n}',
    execute: async (client, input) => {
      const args = expectObject(input);
      return await client.lending.submitInflow({
        txid: expectNonEmptyString(args.txid, "txid"),
        chain: expectOptionalChain(args.chain, "chain"),
        operation: expectInflowOperation(args.operation, "operation"),
      });
    },
  },
  {
    id: "lending.isBorrowingDisabled",
    label: "lending.isBorrowingDisabled",
    defaultArgs: "{}",
    execute: async (client) => {
      return await client.lending.isBorrowingDisabled();
    },
  },
];

type SdkMethodQueryPageProps = Pick<
  SharedExampleState,
  "profileId" | "pools" | "prices"
>;

export function SdkMethodQueryPage({
  profileId,
  pools,
  prices,
}: SdkMethodQueryPageProps) {
  const { primaryWallet } = useDynamicContext();
  const [selectedMethodId, setSelectedMethodId] = useState(SDK_METHODS[0].id);
  const [argsInput, setArgsInput] = useState(SDK_METHODS[0].defaultArgs);
  const [result, setResult] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedMethod = useMemo(() => {
    return (
      SDK_METHODS.find((method) => method.id === selectedMethodId) ??
      SDK_METHODS[0]
    );
  }, [selectedMethodId]);

  const walletAddress = primaryWallet?.address ?? "";
  const walletChain = getWalletChainLabel(primaryWallet);

  async function runSelectedMethod() {
    setIsRunning(true);
    setErrorMessage(null);
    setResult("");

    const startedAtMs = Date.now();

    try {
      const parsedInput = JSON.parse(argsInput) as unknown;
      const client = createLiquidiumClient();
      const rawResult = await selectedMethod.execute(client, parsedInput);
      const elapsedMs = Date.now() - startedAtMs;

      setResult(
        createPrettyResult({
          methodId: selectedMethod.id,
          elapsedMs,
          payload: rawResult,
        })
      );
    } catch (error) {
      const elapsedMs = Date.now() - startedAtMs;
      const message = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(`${message} (${elapsedMs}ms)`);
    } finally {
      setIsRunning(false);
    }
  }

  function loadMethodTemplate(methodId: string) {
    const nextMethod = SDK_METHODS.find((method) => method.id === methodId);

    if (!nextMethod) {
      return;
    }

    setSelectedMethodId(nextMethod.id);
    setArgsInput(nextMethod.defaultArgs);
    setResult("");
    setErrorMessage(null);
  }

  function applyWalletDefaults() {
    if (!walletAddress) {
      setErrorMessage("Connect a wallet before applying wallet defaults.");
      return;
    }

    try {
      const currentArgs = JSON.parse(argsInput) as unknown;
      const argsObject = expectObject(currentArgs);

      const nextArgs: Record<string, unknown> = {
        ...argsObject,
      };

      if (
        "account" in nextArgs ||
        [
          "accounts.createProfile",
          "accounts.prepareCreateProfile",
          "accounts.getProfileId",
          "accounts.getWalletNonce",
        ].includes(selectedMethod.id)
      ) {
        nextArgs.account = walletAddress;
      }

      if (
        "walletAddress" in nextArgs ||
        ["accounts.getProfileId", "accounts.getWalletNonce"].includes(
          selectedMethod.id
        )
      ) {
        nextArgs.walletAddress = walletAddress;
      }

      if ("signerWalletAddress" in nextArgs) {
        nextArgs.signerWalletAddress = walletAddress;
      }

      if ("newWalletAddress" in nextArgs) {
        nextArgs.newWalletAddress = walletAddress;
      }

      if (
        "receiver" in nextArgs &&
        nextArgs.receiver !== null &&
        typeof nextArgs.receiver === "object"
      ) {
        nextArgs.receiver = {
          ...nextArgs.receiver,
          address: walletAddress,
        };
      }

      if ("borrowDestination" in nextArgs) {
        nextArgs.borrowDestination = {
          type: "External",
          address: walletAddress,
        };
      }

      if ("chain" in nextArgs) {
        nextArgs.chain = walletChain;
      }

      if ("signerChain" in nextArgs) {
        nextArgs.signerChain = walletChain;
      }

      if (profileId && "profileId" in nextArgs) {
        nextArgs.profileId = profileId;
      }

      if (pools.length > 0 && "poolId" in nextArgs) {
        nextArgs.poolId = pools[0]?.id;
      }

      if (pools.length > 0 && "request" in nextArgs) {
        const requestArgs = expectObject(nextArgs.request, "request");

        if ("borrowPoolId" in requestArgs) {
          requestArgs.borrowPoolId = pools[0]?.id;
        }

        if ("collateralPoolId" in requestArgs) {
          requestArgs.collateralPoolId = pools[1]?.id ?? pools[0]?.id;
        }
      }

      if (pools.length > 0 && "pools" in nextArgs) {
        nextArgs.pools = pools;
      }

      if (Object.keys(prices).length > 0 && "prices" in nextArgs) {
        nextArgs.prices = prices;
      }

      if ("mockSignature" in nextArgs) {
        nextArgs.mockSignature = DEFAULT_MOCK_SIGNATURE;
      }

      setArgsInput(JSON.stringify(nextArgs, jsonReplacer, 2));
      setErrorMessage(null);
    } catch {
      setErrorMessage("The current JSON is invalid. Reset template first.");
    }
  }

  return (
    <main className="app">
      <section className="section">
        <h1>SDK Method Query</h1>
        <p>
          Pick any SDK method, edit JSON args, and run it to inspect the raw
          return payload.
        </p>

        <div className="details">
          <div>
            <dt>Connected wallet</dt>
            <dd>{walletAddress || "Not connected"}</dd>
          </div>
          <div>
            <dt>Wallet chain</dt>
            <dd>{walletChain || "Unknown"}</dd>
          </div>
          <div>
            <dt>Profile ID</dt>
            <dd>{profileId ?? "Not created yet"}</dd>
          </div>
          <div>
            <dt>Pools loaded</dt>
            <dd>{pools.length}</dd>
          </div>
          <div>
            <dt>SDK config</dt>
            <dd>
              <code>resolveLiquidiumClientConfig()</code>
            </dd>
          </div>
        </div>

        <div className="field-grid">
          <label>
            Method
            <select
              value={selectedMethodId}
              onChange={(event) => {
                loadMethodTemplate(event.target.value);
              }}
            >
              {SDK_METHODS.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="query-input-label">
          JSON args
          <textarea
            className="query-json-input"
            value={argsInput}
            onChange={(event) => {
              setArgsInput(event.target.value);
            }}
            spellCheck={false}
          />
        </label>

        <div className="actions">
          <button
            type="button"
            onClick={runSelectedMethod}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run method"}
          </button>
          <button
            type="button"
            onClick={() => {
              setArgsInput(selectedMethod.defaultArgs);
            }}
            disabled={isRunning}
          >
            Reset template
          </button>
          <button
            type="button"
            onClick={applyWalletDefaults}
            disabled={isRunning}
          >
            Apply wallet defaults
          </button>
        </div>

        {errorMessage ? <p className="error">{errorMessage}</p> : null}

        {result ? (
          <div className="output">
            <h3>Raw result</h3>
            <pre>{result}</pre>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function createMockWalletAdapter(
  signature: string,
  txHash = DEFAULT_MOCK_TX_HASH
): WalletAdapter {
  return {
    signMessage: async () => signature,
    sendBtcTransaction: async () => txHash,
    sendEthTransaction: async () => txHash,
    sendIcrcTransfer: async () => txHash,
  };
}

function createPrettyResult(params: {
  methodId: string;
  elapsedMs: number;
  payload: unknown;
}): string {
  return JSON.stringify(
    {
      method: params.methodId,
      elapsedMs: params.elapsedMs,
      payload: params.payload,
    },
    jsonReplacer,
    2
  );
}

function jsonReplacer(key: string, value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "function") {
    return `[Function ${key || "anonymous"}]`;
  }

  if (value === undefined) {
    return "[undefined]";
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }

  return value;
}

function expectObject(
  value: unknown,
  fieldName = "input"
): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  throw new Error(`${fieldName} must be a JSON object.`);
}

function expectOptionalObject(
  value: unknown,
  fieldName: string
): Record<string, unknown> | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return expectObject(value, fieldName);
}

function expectArray(value: unknown, fieldName: string): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  throw new Error(`${fieldName} must be an array.`);
}

function expectNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string.`);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return trimmedValue;
}

function expectOptionalString(
  value: unknown,
  fieldName: string
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string when provided.`);
  }

  const trimmedValue = value.trim();
  return trimmedValue || undefined;
}

function expectBigInt(value: unknown, fieldName: string): bigint {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return BigInt(value);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      throw new Error(`${fieldName} cannot be empty.`);
    }

    return BigInt(trimmedValue);
  }

  throw new Error(`${fieldName} must be an integer string, number, or bigint.`);
}

function expectOptionalLimit(
  value: unknown,
  fieldName: string
): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new Error(`${fieldName} must be an integer.`);
  }

  if (value < MIN_LIST_LIMIT || value > MAX_LIST_LIMIT) {
    throw new Error(
      `${fieldName} must be between ${MIN_LIST_LIMIT} and ${MAX_LIST_LIMIT}.`
    );
  }

  return value;
}

function expectChain(value: unknown, fieldName: string): Chain {
  const chain = expectNonEmptyString(value, fieldName).toUpperCase();

  if (chain === "BTC" || chain === "ETH" || chain === "ICP") {
    return chain;
  }

  throw new Error(`${fieldName} must be BTC, ETH, or ICP.`);
}

function expectAsset(value: unknown, fieldName: string): Asset {
  const asset = expectNonEmptyString(value, fieldName).toUpperCase();

  if (
    asset === "BTC" ||
    asset === "ICP" ||
    asset === "USDC" ||
    asset === "USDT"
  ) {
    return asset;
  }

  throw new Error(`${fieldName} must be BTC, ICP, USDC, or USDT.`);
}

function expectReceiver(value: unknown, fieldName: string): OutflowDestination {
  const receiver = expectObject(value, fieldName);
  const address = expectNonEmptyString(
    receiver.address,
    `${fieldName}.address`
  );
  const type =
    receiver.type === undefined
      ? undefined
      : expectOutflowAccountType(receiver.type, `${fieldName}.type`);

  if (!type) {
    return { address };
  }

  return {
    address,
    type,
  };
}

function expectOutflowAccountType(
  value: unknown,
  fieldName: string
): OutflowDestination["type"] {
  const accountType = expectNonEmptyString(value, fieldName);

  if (
    accountType === "ChainAddress" ||
    accountType === "IcPrincipal" ||
    accountType === "IcpAccountIdentifier" ||
    accountType === "IcrcAccount"
  ) {
    return accountType;
  }

  throw new Error(
    `${fieldName} must be ChainAddress, IcPrincipal, IcpAccountIdentifier, or IcrcAccount.`
  );
}

function expectInstantLoanAsset(
  value: unknown,
  fieldName: string
): "BTC" | "SOL" | "USDC" | "USDT" {
  const asset = expectNonEmptyString(value, fieldName).toUpperCase();

  if (
    asset === "BTC" ||
    asset === "SOL" ||
    asset === "USDC" ||
    asset === "USDT"
  ) {
    return asset;
  }

  throw new Error(`${fieldName} must be BTC, SOL, USDC, or USDT.`);
}

function expectInstantLoanAccount(
  value: unknown,
  fieldName: string
): ExternalAccount {
  if (typeof value === "string") {
    return {
      type: "External",
      address: expectNonEmptyString(value, fieldName),
    };
  }

  const account = expectObject(value, fieldName);
  const type = expectNonEmptyString(account.type, `${fieldName}.type`);

  if (type === "External") {
    return {
      type,
      address: expectNonEmptyString(account.address, `${fieldName}.address`),
    };
  }

  throw new Error(`${fieldName}.type must be External.`);
}

function expectOptionalChain(
  value: unknown,
  fieldName: string
): Chain | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return expectChain(value, fieldName);
}

function expectSupplyAction(
  value: unknown,
  fieldName: string
): "deposit" | "repayment" {
  const action = expectNonEmptyString(value, fieldName).toLowerCase();

  if (action === "deposit" || action === "repayment") {
    return action;
  }

  throw new Error(`${fieldName} must be deposit or repayment.`);
}

function expectOptionalSupplyMechanism(
  value: unknown,
  fieldName: string
): SupplyPlanType | undefined {
  const mechanism = expectOptionalString(value, fieldName);
  if (!mechanism) {
    return undefined;
  }

  if (mechanism === "transfer" || mechanism === "contractInteraction") {
    return mechanism;
  }

  throw new Error(`${fieldName} must be transfer or contractInteraction.`);
}

function expectOptionalTransferMode(
  value: unknown,
  fieldName: string
): TransferMode | undefined {
  const transferMode = expectOptionalString(value, fieldName);
  if (!transferMode) {
    return undefined;
  }

  if (transferMode === "native" || transferMode === "ck") {
    return transferMode;
  }

  throw new Error(`${fieldName} must be native or ck.`);
}

function expectInflowOperation(
  value: unknown,
  fieldName: string
): InflowOperation {
  const operation = expectNonEmptyString(value, fieldName).toLowerCase();

  if (operation === "deposit" || operation === "repayment") {
    return operation;
  }

  throw new Error(`${fieldName} must be deposit or repayment.`);
}

function expectOptionalActivityFilter(
  value: unknown,
  fieldName: string
): ActivityFilter | undefined {
  const filter = expectOptionalString(value, fieldName);
  if (!filter) {
    return undefined;
  }

  if (filter === "active" || filter === "completed" || filter === "all") {
    return filter;
  }

  throw new Error(`${fieldName} must be active, completed, or all.`);
}

function getWalletChainLabel(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): "ETH" {
  if (primaryWallet && isEthereumWallet(primaryWallet)) {
    return "ETH";
  }

  return "ETH";
}
