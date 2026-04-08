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
  account: "<custom-outflow-address>",
  signerAccount: walletAddress,
});

const borrowSignature = await wallet.signMessage(borrowAction.message);

const outflow = await borrowAction.submit({
  signature: borrowSignature,
  chain: "ETH",
});

// Borrow with the direct convenience method
const outflowWithConvenience = await client.lending.borrow({
  profileId: "<liquidium-profile-id>",
  poolId: btcPool.id,
  amount: 50_000n,
  account: "<custom-outflow-address>",
  signerAccount: walletAddress,
  chain: "ETH",
  walletAdapter,
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

// Recommended BTC supply flow with built-in 5 second polling
const supplyFlow = await client.lending.supply({
  profileId: "<liquidium-profile-id>",
  poolId: btcPool.id,
  action: "deposit",
  destination: "nativeAddress",
});

const depositAddress = supplyFlow.target.type === "nativeAddress"
  ? supplyFlow.target.address
  : undefined;

await supplyFlow.submit({ txid: "<broadcast-txid>" });

for await (const update of supplyFlow.watchStatus()) {
  if (update.isAvailable) {
    break;
  }
}
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
  - `btcPool`: `42svn-2yaaa-aaaae-qfcsq-cai`
  - `ercPool`: `7dcux-qqaaa-aaaae-qfc3a-cai`
  - `lending`: `nja4y-2yaaa-aaaae-qddxa-cai`

### Account creation flow

- `client.accounts.prepareCreate({ account })` - fetch nonce and build a signable account creation action
- `createAction.submit({ signature, chain, account })` - submit the signed request tied to that action
- `executeWith({ walletAdapter, chain, account? })` - compose a wallet adapter with a prepared action
- `client.accounts.create({ account, chain, walletAdapter })` - run the full account creation flow with a wallet adapter

### Borrow and withdraw execution

- `client.lending.prepareBorrow(...)` / `client.lending.prepareWithdraw(...)` - prepare raw signable actions
- `client.lending.borrow({ ..., chain, walletAdapter })` - sign and submit a borrow request in one call
- `client.lending.withdraw({ ..., chain, walletAdapter })` - sign and submit a withdraw request in one call

### Wallet adapters

- `WalletAdapter` currently supports BTC/ETH message signing through `signMessage`
- Future versions will add native ICP, native Solana, and additional BTC/ETH execution capabilities like PSBT signing, direct ETH transaction sending, and ck-asset execution paths

### Modules

- `client.accounts` - Profile and wallet management
- `client.lending` - Supply, create borrow actions, repay, withdraw
- `client.positions` - Position reads and health factor
- `client.market` - Dynamic pool data, pool selection, and asset prices
- `client.pending` - Pending inflows and outflows
- `client.history` - User and pool history

### Supply tracking flow

- `client.lending.prepareSupply(...)` returns the raw supply instruction for the selected execution path.
- `client.lending.supply(...)` builds a tracked supply flow and returns helpers to submit a broadcast `txid`, fetch the latest tracking status, and poll every 5 seconds until the inflow is available.

## License

MIT
