[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidiumClient

# Class: LiquidiumClient

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:28](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L28)

Root client for Liquidium protocol integration (canister + optional HTTP API).

Construct with `new LiquidiumClient(config)`.

## Constructors

### Constructor

> **new LiquidiumClient**(`config?`): `LiquidiumClient`

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L55)

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

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:30](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L30)

Profile lifecycle: create, resolve, linked wallets.

***

### activities

> `readonly` **activities**: [`ActivitiesModule`](ActivitiesModule.md)

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L38)

Receipt-oriented activity status and activity lists.

***

### history

> `readonly` **history**: [`HistoryModule`](HistoryModule.md)

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L40)

Pool and user history through the Liquidium SDK API.

***

### instantLoans

> `readonly` **instantLoans**: [`InstantLoansModule`](InstantLoansModule.md)

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L42)

Accountless instant loans backed by generated deposit/repay targets.

***

### lending

> `readonly` **lending**: [`LendingModule`](LendingModule.md)

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L32)

Borrow, withdraw, supply, inflow reporting and tracking.

***

### market

> `readonly` **market**: [`MarketModule`](MarketModule.md)

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L36)

Pool list, prices, pool rate lookups.

***

### positions

> `readonly` **positions**: [`PositionsModule`](PositionsModule.md)

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L34)

Per-pool positions, health, aggregate stats.

***

### quote

> `readonly` **quote**: [`QuoteModule`](QuoteModule.md)

Defined in: [external/liquidium-sdk/packages/client/src/client.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/client.ts#L44)

Pure quote helpers from market inputs.
