[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidiumClient

# Class: LiquidiumClient

Defined in: packages/client/src/client.ts:28

Root client for Liquidium protocol integration (canister + optional HTTP API).

Construct with `new LiquidiumClient(config)`.

## Constructors

### Constructor

> **new LiquidiumClient**(`config?`): `LiquidiumClient`

Defined in: packages/client/src/client.ts:55

Creates a Liquidium SDK client.

#### Parameters

##### config?

[`LiquidiumClientConfig`](../interfaces/LiquidiumClientConfig.md) = `{}`

Runtime transport, canister, API, identity, and EVM read options.

#### Returns

`LiquidiumClient`

## Properties

### accounts

> `readonly` **accounts**: [`AccountsModule`](AccountsModule.md)

Defined in: packages/client/src/client.ts:30

Profile lifecycle: create, resolve, linked wallets.

***

### activities

> `readonly` **activities**: [`ActivitiesModule`](ActivitiesModule.md)

Defined in: packages/client/src/client.ts:38

Receipt-oriented activity status and activity lists.

***

### history

> `readonly` **history**: [`HistoryModule`](HistoryModule.md)

Defined in: packages/client/src/client.ts:40

Pool and user history through the Liquidium SDK API.

***

### lending

> `readonly` **lending**: [`LendingModule`](LendingModule.md)

Defined in: packages/client/src/client.ts:32

Borrow, withdraw, supply, inflow reporting and tracking.

***

### market

> `readonly` **market**: [`MarketModule`](MarketModule.md)

Defined in: packages/client/src/client.ts:36

Pool list, prices, pool rate lookups.

***

### positions

> `readonly` **positions**: [`PositionsModule`](PositionsModule.md)

Defined in: packages/client/src/client.ts:34

Per-pool positions, health, aggregate stats.

***

### quote

> `readonly` **quote**: [`QuoteModule`](QuoteModule.md)

Defined in: packages/client/src/client.ts:44

Pure quote helpers from market inputs.

***

### simpleLoans

> `readonly` **simpleLoans**: [`SimpleLoansModule`](SimpleLoansModule.md)

Defined in: packages/client/src/client.ts:42

Accountless Simple Loans backed by generated deposit/repay targets.
