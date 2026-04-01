# @liquidium/client

The official TypeScript client for the Liquidium protocol.

Current wallet/signing support: BTC and ETH.

## Installation

```bash
npm install @liquidium/client @dfinity/agent @dfinity/candid @dfinity/principal
```

## Usage

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = LiquidiumClient.create({});

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
const createAction = await client.accounts.create({
  account: walletAddress,
});
const signature = await wallet.signMessage(createAction.message);
const profile = await createAction.submit({
  signature,
  chain: "ETH",
  account: walletAddress,
});

// History (requires apiBaseUrl)
const history = await client.history.getUser("profile-id");

// Borrow with a required custom outflow account
const borrowAction = await client.lending.createBorrow({
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
const supplyFlow = await client.lending.createSupplyFlow({
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
  - `btcPool`: `<btc-pool-canister-id>`
  - `ercPool`: `<erc-pool-canister-id>`
  - `lending`: `<lending-canister-id>`

### Account creation flow

- `client.accounts.create({ account })` - fetch nonce and build a signable account creation action
- `createAction.submit({ signature, chain, account })` - submit the signed request tied to that action

### Modules

- `client.accounts` - Profile and wallet management
- `client.lending` - Supply, create borrow actions, repay, withdraw
- `client.positions` - Position reads and health factor
- `client.market` - Dynamic pool data, pool selection, and asset prices
- `client.pending` - Pending inflows and outflows
- `client.history` - User and pool history

### Supply tracking flow

- `client.lending.createSupplyFlow(...)` builds a supply instruction and returns helpers to submit a broadcast `txid`, fetch the latest tracking status, and poll every 5 seconds until the inflow is available.

## License

MIT
