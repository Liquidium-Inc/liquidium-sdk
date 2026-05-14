# @liquidium/client

The official TypeScript client for the Liquidium protocol.

Current wallet/signing support: BTC and ETH.

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

const client = LiquidiumClient.create({});
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
const instantLoan = await client.instantLoans.create({
  collateralPoolId: btcPool.id,
  borrowPoolId: "<eth-usdt-pool-id>",
  collateralAsset: "BTC",
  borrowAsset: "USDT",
  collateralAmount: 10_000_000n,
  borrowAmount: 2_000_000n,
  ltvMaxBps: 6_800n,
  depositWindowSeconds: 3_600n,
  borrowDestination: "0x2222222222222222222222222222222222222222",
  refundDestination: "bc1qrefunddestination",
});

const loanRef = instantLoan.ref;
const collateralDepositAddress =
  instantLoan.depositTarget.type === "nativeAddress"
    ? instantLoan.depositTarget.address
    : instantLoan.depositTarget.account;

// Preferred restore path: ref is decoded locally and loaded from canister.
const restoredLoan = await client.instantLoans.get({ ref: loanRef });
// Full amount to send to the repayment target, including inflow fee and interest buffer.
const repayAmount = restoredLoan.repayment.amount;

// Recovery path: requires apiBaseUrl and returns candidates only.
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

// History (requires apiBaseUrl)
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

// Borrow with the direct convenience method. Returns the instant receipt
// from the canister; `txid` may be null initially and can be resolved later
// via activities status reads.
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

// Inflow reporting (requires apiBaseUrl)
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
// This requires apiBaseUrl, an EVM RPC/read client, account, amount, and
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

### `LiquidiumClient.create(config)`

| Option            | Type                     | Required | Description                                  |
| ----------------- | ------------------------ | -------- | -------------------------------------------- |
| `environment`     | `"mainnet"`              | No       | Canister ID preset to use                    |
| `icHost`          | `string`                 | No       | ICP replica host override                    |
| `identity`        | `Identity`               | No       | `@dfinity/agent` identity                    |
| `apiBaseUrl`      | `string`                 | No       | Liquidium API base URL                       |
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
const client = LiquidiumClient.create({
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
- `client.instantLoans.get({ loanId })` - restore canonical loan state, position summary, and repayment quote from the numeric canister loan ID
- `client.instantLoans.findByAddress(address)` - recovery helper that requires `apiBaseUrl` and returns candidates only

### Account creation flow

- `client.accounts.prepareCreateProfile({ account })` - fetch nonce and build a signable account creation action
- `createAction.submit({ signature, chain, account })` - submit the signed request tied to that action
- `executeWith({ walletAdapter, chain, account? })` - compose a wallet adapter with a prepared action
- `client.accounts.createProfile({ account, chain, walletAdapter })` - run the full account creation flow with a wallet adapter

### Quote flow

- `client.quote.getQuote(request, pools, prices)` - calculate borrow USD value, required collateral, validation errors, and warnings from caller-supplied market data

### Advanced profile-based execution

- `client.lending.prepareBorrow(...)` / `client.lending.prepareWithdraw(...)` - prepare raw signable actions
- `client.lending.borrow({ ..., signerChain, signerWalletAdapter })` - sign and submit a borrow request in one call; resolves with the instant receipt (txid may be null until the canister assigns one)
- `client.lending.withdraw({ ..., signerChain, signerWalletAdapter })` - sign and submit a withdraw request in one call

Use these calls only when building a profile-based Liquidium app that manages explicit profile/account state. They use the lending canister only and do not require `apiBaseUrl`. To show status or a chain transaction id once it exists, use `client.activities`.

### Wallet adapters

- `WalletAdapter` currently supports BTC/ETH message signing through `signMessage`
- Transfer-path supply automation uses `sendBtcTransaction` or `sendEthTransaction`, depending on the resolved target chain
- Contract-interaction supply automation uses `sendEthTransaction` together with `apiBaseUrl` and an EVM RPC/read client
- Future versions will add native ICP, native Solana, and additional ck-asset execution paths

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

### Activity tracking

- `client.activities.list({ profileId, state: "all" })` - list active, completed, or all activities for a profile; defaults to all activities
- `client.activities.getStatus({ profileId, id })` - fetch one receipt by receipt id or txid
- Active inflows use `status: "pending"` as the coarse lifecycle state. Check `activity.stage` for processing detail; ETH deposit-address transfers that are detected but not yet processed return `stage: "deposited"`.
- Underfunded ETH deposit-address inflows include `activity.topUp` with `depositedAmount`, `feeAmount`, and `shortfallAmount` in base units.

### Supply tracking flow

- `client.lending.supply(...)` resolves the target internally and returns a tracked `SupplyFlow` with `type: "transfer" | "contractInteraction"`.
- Transfer-path inflows can auto-broadcast when `walletAdapter`, `account`, and `amount` are provided.
- ETH stablecoin inflows default to deposit-address transfers and do not need `apiBaseUrl` for target resolution or wallet broadcast.
- Use `mechanism: "contractInteraction"` only when explicitly opting into the lower-level ETH contract route.
- Supply flows are for profile-based integrations. Use `client.instantLoans` for the default accountless borrow UX.

## License

MIT
