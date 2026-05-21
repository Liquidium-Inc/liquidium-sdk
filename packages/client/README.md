# @liquidium/client

The official TypeScript client for the Liquidium protocol.

Current wallet/signing support: BTC and ETH. Initial release flows support L1 BTC and ETH USDC/USDT inflows through deposit addresses or ETH contract interaction; direct ck/native-token transfers are not exposed.

Recommended order: use `client.instantLoans` first, deposit-address profile flows second, and ETH contract interaction only when explicitly needed.

## Installation

```bash
npm install @liquidium/client @dfinity/agent @dfinity/candid @dfinity/principal
```

## Usage

```ts
import {
  executeWith,
  LiquidiumClient,
  RATE_SCALE,
  type WalletAdapter,
} from "@liquidium/client";

const client = new LiquidiumClient();
const walletAdapter: WalletAdapter = {
  signMessage: async ({ message }) => wallet.signMessage(message),
  sendEthTransaction: async ({ transaction }) =>
    wallet.sendTransaction(transaction),
};

// Market data
const pools = await client.market.listPools();
const btcPool = await client.market.findPool({ asset: "BTC", chain: "BTC" });
const prices = await client.market.getAssetPrices();
const marketAsset = pools[0]?.asset;
const assetPriceUsd = marketAsset ? prices[marketAsset] : undefined;
const borrowApyPercent =
  pools[0] ? (Number(pools[0].borrowingRate) * 100) / Number(RATE_SCALE) : undefined;

// Quote-first borrow planning
const quote = await client.quote.getQuote(
  {
    borrowAmount: 50_000n,
    borrowPoolId: pools[0].id,
    collateralPoolId: pools[1].id,
    targetLtvBps: 5_000n,
  },
  pools,
  prices
);

// Positions
const positions = await client.positions.listPositions("profile-id");
const health = await client.positions.getHealthFactor("profile-id");

// Position reads (aggregate + per-reserve + full-repay helpers)
const summary = await client.positions.getUserPositionSummary("profile-id");
const reserves = await client.positions.getUserReserves("profile-id");
const repay = await client.positions.getMaxRepayAmount("profile-id", "pool-id");
const reserve = await client.market.getReserveData({
  asset: "USDC",
  chain: "ETH",
});

// Default borrow flow: accountless instant loan with deposit/repay targets.
const instantLoanLtv = client.quote.calculateLtv(
  {
    collateralPoolId: btcPool.id,
    borrowPoolId: "<eth-usdt-pool-id>",
    collateralAmount: 10_000_000n,
    borrowAmount: 2_000_000n,
  },
  pools,
  prices
);

const instantLoan = await client.instantLoans.create({
  collateralPoolId: btcPool.id,
  borrowPoolId: "<eth-usdt-pool-id>",
  collateralAsset: "BTC",
  borrowAsset: "USDT",
  collateralAmount: 10_000_000n,
  borrowAmount: 2_000_000n,
  ltvMaxBps: instantLoanLtv.maxAllowedLtvBps,
  depositWindowSeconds: 3_600n,
  borrowDestination: {
    type: "External",
    address: "0x2222222222222222222222222222222222222222",
  },
  refundDestination: { type: "External", address: "bc1qrefunddestination" },
});

const loanRef = instantLoan.ref;
const collateralDepositAddress =
  instantLoan.depositTarget.type === "nativeAddress"
    ? instantLoan.depositTarget.address
    : instantLoan.depositTarget.account;

// Preferred restore path: load current loan state from the saved reference.
const restoredLoan = await client.instantLoans.get({ ref: loanRef });
// Full amount to send to the repayment target, including inflow fee and interest buffer.
const repayAmount = restoredLoan.repayment.amount;

// Recovery path: address lookup returns candidates only.
const candidates = await client.instantLoans.findByAddress(
  "bc1qrefunddestination"
);

// Account creation
const createAction = await client.accounts.prepareCreateProfile({
  account: walletAddress,
});
const signature = await wallet.signMessage(createAction.message);
const profile = await createAction.submit({
  signature,
  chain: "ETH",
  account: walletAddress,
});

// Account creation with executeWith(...)
const execute = executeWith({
  walletAdapter,
  chain: "ETH",
  account: walletAddress,
});

const profileWithExecutor = await client.accounts
  .prepareCreateProfile({ account: walletAddress })
  .then(execute);

// Account creation with the direct convenience method
const profileWithConvenience = await client.accounts.createProfile({
  account: walletAddress,
  chain: "ETH",
  walletAdapter,
});

// History lookup
const userHistory = await client.history.getUserTransactionHistory(
  "profile-id"
);
const liquidations = await client.history.getLiquidationHistory("profile-id");
const poolHistory = await client.history.getPoolHistory("pool-id");
const poolConfigHistory = await client.history.getPoolConfigHistory("pool-id");
const borrowRates = await client.history.getBorrowRateHistory("pool-id");

// Borrow with a required custom outflow account
const borrowAction = await client.lending.prepareBorrow({
  profileId: "<liquidium-profile-id>",
  poolId: btcPool.id,
  amount: 50_000n,
  receiverAddress: "<custom-outflow-address>",
  signerWalletAddress: walletAddress,
});

const borrowSignature = await wallet.signMessage(borrowAction.message);

const outflow = await borrowAction.submit({
  signature: borrowSignature,
  chain: "ETH",
});

// Borrow with the direct convenience method. Returns the instant receipt;
// `txid` may be null initially and can be resolved later via activities status reads.
const outflowWithConvenience = await client.lending.borrow({
  profileId: "<liquidium-profile-id>",
  poolId: btcPool.id,
  amount: 50_000n,
  receiverAddress: "<custom-outflow-address>",
  signerWalletAddress: walletAddress,
  signerChain: "ETH",
  signerWalletAdapter: walletAdapter,
});

// Activities and receipt status
const activities = await client.activities.list({ profileId: "profile-id" });
const status = await client.activities.getStatus({
  profileId: "profile-id",
  id: outflowWithConvenience.id,
});

// Inflow reporting
await client.lending.submitInflow({
  txid: "<broadcast-txid>",
  chain: "BTC",
  type: "DEPOSIT",
});

// Optional fee estimate for ETH stablecoin deposit-address inflows
const inflowFee = await client.lending.estimateInflowFee({
  asset: "USDT",
  chain: "ETH",
});

// Supply flow: returns a receipt; caller polls confirmation state themselves.
const supplyFlow = await client.lending.supply({
  profileId: "<liquidium-profile-id>",
  poolId: btcPool.id,
  action: "deposit",
});

if (
  supplyFlow.type === "transfer" &&
  supplyFlow.target.type === "nativeAddress"
) {
  const depositAddress = supplyFlow.target.address;
}

await supplyFlow.submit({ txid: "<broadcast-txid>" });

// ETH stablecoin supply / repay defaults to the deposit-address transfer path
const stablecoinFlow = await client.lending.supply({
  profileId: "<liquidium-profile-id>",
  poolId: "<eth-usdt-pool-id>",
  action: "deposit",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter: {
    sendEthTransaction: async ({ transaction }) =>
      wallet.sendTransaction(transaction),
  },
});

if (
  stablecoinFlow.type === "transfer" &&
  stablecoinFlow.target.type === "nativeAddress"
) {
  const usdtDepositAddress = stablecoinFlow.target.address;
}

// Force the lower-level ETH contract-interaction path when needed.
// This requires an EVM RPC/read client, account, amount, and
// sendEthTransaction.
const contractInteractionFlow = await client.lending.supply({
  profileId: "<liquidium-profile-id>",
  poolId: "<eth-usdt-pool-id>",
  action: "deposit",
  mechanism: "contractInteraction",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter,
});
```

## API

### `new LiquidiumClient(config)`

| Option            | Type                     | Required | Description                                  |
| ----------------- | ------------------------ | -------- | -------------------------------------------- |
| `environment`     | `"mainnet"`              | No       | Canister ID preset to use                    |
| `icHost`          | `string`                 | No       | ICP replica host override                    |
| `identity`        | `Identity`               | No       | `@dfinity/agent` identity                    |
| `apiBaseUrl`      | `string`                 | No       | Liquidium API root override                  |
| `headers`         | `Record<string, string>` | No       | Default HTTP headers for API requests        |
| `canisterIds`     | `Partial<CanisterIds>`   | No       | Override canister IDs for custom deployments |
| `fetch`           | `typeof fetch`           | No       | Custom fetch implementation for API requests |
| `timeoutMs`       | `number`                 | No       | Request timeout (default: 30000)             |
| `evmRpcUrl`       | `string`                 | No       | Ethereum RPC URL for public ERC-20 reads     |
| `evmRpcHeaders`   | `Record<string, string>` | No       | HTTP headers for authenticated EVM RPCs      |
| `evmPublicClient` | `EvmReadClient`          | No       | Existing viem-compatible read client         |

Environment preset:

- `mainnet`
  - `btcPool`: `hkmli-faaaa-aaaar-qb4ba-cai`
  - `ethDeposit`: `z5jz7-nyaaa-aaaar-qb6pq-cai`
  - `ercPool`: `hnnn4-iyaaa-aaaar-qb4bq-cai`
  - `instantLoans`: `qdt2k-xqaaa-aaaae-qkapq-cai`
  - `lending`: `hyk4r-jqaaa-aaaar-qb4ca-cai`

For custom deployments, pass explicit canister ID overrides:

```ts
const client = new LiquidiumClient({
  canisterIds: {
    btcPool: "<btc-pool-canister-id>",
    ethDeposit: "<eth-deposit-canister-id>",
    ercPool: "<erc-pool-canister-id>",
    instantLoans: "<instant-loans-canister-id>",
    lending: "<lending-canister-id>",
  },
});
```

### Instant loan flow

Most integrations should start with `client.instantLoans`. It creates an accountless loan and returns the canonical loan plus generated deposit/repay targets, current position state, and the actionable repayment amount.

- `client.instantLoans.create(...)` - create the instant loan and return its generated targets
- `client.instantLoans.get({ ref })` - restore canonical loan state, position summary, and repayment quote from the user-facing loan reference
- `client.instantLoans.get({ loanId })` - restore canonical loan state, position summary, and repayment quote from the numeric loan ID
- `loan.status` is the simplified lifecycle: `awaiting_deposit`, `deposit_detected`, `active`, `settling`, or `closed`
- `client.instantLoans.findByAddress(address)` - recovery helper that returns candidates only
- `client.quote.calculateLtv(...)` - calculate current LTV from borrow and collateral amounts before creating a loan

Create destinations are external addresses. Pass either an address string or an
external account object such as `{ type: "External", address: "bc1q..." }`.

### Account creation flow

- `client.accounts.prepareCreateProfile({ account })` - fetch nonce and build a signable account creation action
- `createAction.submit({ signature, chain, account })` - submit the signed request tied to that action
- `executeWith({ walletAdapter, chain, account? })` - compose a wallet adapter with a prepared action
- `client.accounts.createProfile({ account, chain, walletAdapter })` - run the full account creation flow with a wallet adapter

### Quote flow

- `client.quote.getQuote(request, pools, prices)` - calculate borrow USD value, required collateral, validation errors, and warnings from caller-supplied market data
- `client.quote.calculateLtv(request, pools, prices)` - calculate LTV from caller-supplied borrow and collateral amounts

### Advanced profile-based execution

- `client.lending.prepareBorrow(...)` / `client.lending.prepareWithdraw(...)` - prepare raw signable actions
- `client.lending.borrow({ ..., signerChain, signerWalletAdapter })` - sign and submit a borrow request in one call; resolves with the instant receipt (txid may be null until processing assigns one)
- `client.lending.withdraw({ ..., signerChain, signerWalletAdapter })` - sign and submit a withdraw request in one call

Use these calls only when building a profile-based Liquidium app that manages explicit profile/account state. To show status or a chain transaction id once it exists, use `client.activities`.

### Wallet adapters

- `WalletAdapter` currently supports BTC/ETH message signing through `signMessage`
- Transfer-path supply automation uses `sendBtcTransaction` or `sendEthTransaction`, depending on the resolved target chain
- Contract-interaction supply automation uses `sendEthTransaction` together with the configured Liquidium service and an EVM RPC/read client
- Future versions will add more chains and direct token transfer support

### Modules

- `client.instantLoans` - Default accountless borrow flow with generated deposit and repay targets
- `client.accounts` - Profile and wallet management for advanced integrations
- `client.lending` - Advanced profile-based supply, borrow, repay, and withdraw primitives
- `client.positions` - Position reads and health factor
- `client.market` - Dynamic pool data, pool selection, and asset prices
- `client.quote` - Quote calculation from market pools and prices
- `client.activities` - Receipt status and active/completed activity lists
- `client.history` - User and pool history

### History

- `client.history.getUserTransactionHistory(profileId, filters?)` - paginated profile transaction history
- `client.history.getLiquidationHistory(profileId, filters?)` - paginated profile liquidation history
- `client.history.getPoolHistory(poolId, window?)` - paginated pool rate and utilization samples
- `client.history.getPoolConfigHistory(poolId, cursor?)` - paginated reserve configuration changes
- `client.history.getBorrowRateHistory(poolId, window?)` - paginated borrow-rate samples
- User history statuses are lowercase: `requested`, `pending`, `confirmed`, or `failed`

### Activity tracking

- `client.activities.list({ profileId, filter: "all" })` - list active, completed, or all activities for a profile; defaults to all activities
- `client.activities.getStatus({ profileId, id })` - fetch one receipt by receipt id or txid
- Activities expose one consumer-facing `status`. ETH deposit-address transfers that are detected but not yet processed return `status: "detected"`.
- Underfunded ETH deposit-address inflows include `activity.topUp` with `depositedAmount`, `feeAmount`, and `shortfallAmount` in base units.

### Supply tracking flow

- `client.lending.supply(...)` resolves the target internally and returns a tracked `SupplyFlow` with `type: "transfer" | "contractInteraction"` for supported L1 inflow routes.
- Transfer-path inflows can auto-broadcast when `walletAdapter`, `account`, and `amount` are provided.
- ETH stablecoin inflows default to deposit-address transfers and do not need service calls for target resolution or wallet broadcast.
- Use `mechanism: "contractInteraction"` only when explicitly opting into the lower-level ETH contract route.
- Supply flows are for profile-based integrations. Use `client.instantLoans` for the default accountless borrow UX.

## License

MIT
