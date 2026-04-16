# @liquidium/client

The official TypeScript client for the Liquidium protocol.

Current wallet/signing support: BTC and ETH.

## Installation

```bash
npm install @liquidium/client @dfinity/agent @dfinity/candid @dfinity/principal
```

## Usage

```ts
import {
  executeWith,
  LiquidiumClient,
  type WalletAdapter,
} from "@liquidium/client";

const client = LiquidiumClient.create({});
const walletAdapter: WalletAdapter = {
  signMessage: async ({ message }) => wallet.signMessage(message),
  sendEthTransaction: async ({ transaction }) =>
    wallet.sendTransaction(transaction),
};

// Market data
const pools = await client.market.getPools();
const btcPool = await client.market.findPool({ asset: "BTC", chain: "BTC" });
const prices = await client.market.getAssetPrices();
const marketAsset = pools[0]?.asset;
const assetPriceUsd = marketAsset ? prices[marketAsset] : undefined;

// Positions
const positions = await client.positions.list("profile-id");
const health = await client.positions.getHealthFactor("profile-id");

// Account creation
const createAction = await client.accounts.prepareCreate({
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
  .prepareCreate({ account: walletAddress })
  .then(execute);

// Account creation with the direct convenience method
const profileWithConvenience = await client.accounts.create({
  account: walletAddress,
  chain: "ETH",
  walletAdapter,
});

// History (requires apiBaseUrl)
const history = await client.history.getUser("profile-id");

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
// via a dedicated polling method (not yet exposed).
const outflowWithConvenience = await client.lending.borrow({
  profileId: "<liquidium-profile-id>",
  poolId: btcPool.id,
  amount: 50_000n,
  receiverAddress: "<custom-outflow-address>",
  signerWalletAddress: walletAddress,
  signerChain: "ETH",
  signerWalletAdapter: walletAdapter,
});

// Pending movements
const pending = await client.pending.getMovements("profile-id");

// Inflow reporting (requires apiBaseUrl)
await client.lending.submitInflow({ txid: "<broadcast-txid>" });

// Inflow status polling (requires apiBaseUrl)
const inflowStatus = await client.lending.getInflowStatus({
  profileId: "<liquidium-profile-id>",
  txid: "<optional-broadcast-txid>",
});

// Unified supply flow with built-in 5 second polling
const supplyFlow = await client.lending.supply({
  profileId: "<liquidium-profile-id>",
  poolId: btcPool.id,
  action: "deposit",
});

if (supplyFlow.type === "transfer" && supplyFlow.target.type === "nativeAddress") {
  const depositAddress = supplyFlow.target.address;
}

await supplyFlow.submit({ txid: "<broadcast-txid>" });

for await (const update of supplyFlow.watchStatus()) {
  if (update.isAvailable) {
    break;
  }
}

// ETH stablecoin supply / repay auto-routes to the contract-interaction path
const stablecoinFlow = await client.lending.supply({
  profileId: "<liquidium-profile-id>",
  poolId: "<eth-usdt-or-usdc-pool-id>",
  action: "deposit",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter: {
    sendEthTransaction: async ({ transaction }) =>
      wallet.sendTransaction(transaction),
  },
});
```

## API

### `LiquidiumClient.create(config)`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `environment` | `"mainnet" \| "staging"` | No | Canister ID preset to use |
| `icHost` | `string` | No | ICP replica host override |
| `identity` | `Identity` | No | `@dfinity/agent` identity |
| `apiBaseUrl` | `string` | No | Liquidium API base URL |
| `headers` | `Record<string, string>` | No | Default HTTP headers for API requests |
| `canisterIds` | `Partial<CanisterIds>` | No | Override canister IDs |
| `fetch` | `typeof fetch` | No | Custom fetch implementation for API requests |
| `timeoutMs` | `number` | No | Request timeout (default: 30000) |
| `supplyStatusPollIntervalMs` | `number` | No | Default `watchStatus()` polling interval |

Environment presets:

- `mainnet`
  - `btcPool`: `hkmli-faaaa-aaaar-qb4ba-cai`
  - `ercPool`: `hnnn4-iyaaa-aaaar-qb4bq-cai`
  - `lending`: `hyk4r-jqaaa-aaaar-qb4ca-cai`
- `staging`
  - `btcPool`: `<btc-pool-canister-id>`
  - `ercPool`: `<erc-pool-canister-id>`
  - `lending`: `<lending-canister-id>`

### Account creation flow

- `client.accounts.prepareCreate({ account })` - fetch nonce and build a signable account creation action
- `createAction.submit({ signature, chain, account })` - submit the signed request tied to that action
- `executeWith({ walletAdapter, chain, account? })` - compose a wallet adapter with a prepared action
- `client.accounts.create({ account, chain, walletAdapter })` - run the full account creation flow with a wallet adapter

### Borrow and withdraw execution

- `client.lending.prepareBorrow(...)` / `client.lending.prepareWithdraw(...)` - prepare raw signable actions
- `client.lending.borrow({ ..., signerChain, signerWalletAdapter })` - sign and submit a borrow request in one call; resolves with the instant receipt (txid may be null until the canister assigns one)
- `client.lending.withdraw({ ..., signerChain, signerWalletAdapter })` - sign and submit a withdraw request in one call

These calls use the lending canister only; they do not require `apiBaseUrl`. To show a chain transaction id once it exists, use `client.history` (which does require `apiBaseUrl`) or your own polling.

### Wallet adapters

- `WalletAdapter` currently supports BTC/ETH message signing through `signMessage`
- Transfer-path supply automation uses `sendBtcTransaction` or `sendEthTransaction`, depending on the resolved target chain
- Contract-interaction supply automation uses `sendEthTransaction` together with `apiBaseUrl`
- Future versions will add native ICP, native Solana, and additional ck-asset execution paths

### Modules

- `client.accounts` - Profile and wallet management
- `client.lending` - Supply, create borrow actions, repay, withdraw
- `client.positions` - Position reads and health factor
- `client.market` - Dynamic pool data, pool selection, and asset prices
- `client.pending` - Pending inflows and outflows
- `client.history` - User and pool history

### Supply tracking flow

- `client.lending.prepareSupply(...)` auto-resolves the correct target and returns the raw `SupplyInstruction`.
- `client.lending.supply(...)` returns a tracked `SupplyFlow` with `type: "transfer" | "contractInteraction"`.
- Transfer-path inflows can auto-broadcast when `walletAdapter`, `account`, and `amount` are provided.
- Contract-interaction inflows can auto-approve and auto-broadcast when `walletAdapter`, `account`, `amount`, and `apiBaseUrl` are provided.

## License

MIT
