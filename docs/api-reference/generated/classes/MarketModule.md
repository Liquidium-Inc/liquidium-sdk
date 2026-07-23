[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / MarketModule

# Class: MarketModule

Defined in: [packages/client/src/modules/market/market.ts:39](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L39)

Pool metadata, prices, and current rate helpers.

## Constructors

### Constructor

> **new MarketModule**(`canisterContext`): `MarketModule`

Defined in: [packages/client/src/modules/market/market.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L40)

#### Parameters

##### canisterContext

`CanisterContext`

#### Returns

`MarketModule`

## Methods

### findPool()

> **findPool**(`query`): `Promise`\<[`Pool`](../interfaces/Pool.md)\>

Defined in: [packages/client/src/modules/market/market.ts:128](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L128)

Resolves a single backing pool for the given Chain + Asset identifier.

Native and chain-key identifiers share a pool. For example, both
`ETH/USDT` and `ICP/USDT` resolve to the USDT lending pool.

#### Parameters

##### query

[`AssetIdentifier`](../type-aliases/AssetIdentifier.md)

The market asset and chain pair to match.

#### Returns

`Promise`\<[`Pool`](../interfaces/Pool.md)\>

The single pool that matches the requested asset and chain.

***

### getAssetPrices()

> **getAssetPrices**(): `Promise`\<[`AssetPrices`](../type-aliases/AssetPrices.md)\>

Defined in: [packages/client/src/modules/market/market.ts:82](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L82)

Returns the current cached asset prices reported by the protocol.

#### Returns

`Promise`\<[`AssetPrices`](../type-aliases/AssetPrices.md)\>

The current protocol price map keyed by market asset symbol.

***

### getAssetPriceSnapshot()

> **getAssetPriceSnapshot**(): `Promise`\<[`AssetPriceSnapshot`](../interfaces/AssetPriceSnapshot.md)\>

Defined in: [packages/client/src/modules/market/market.ts:95](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L95)

Returns protocol prices with the time at which the SDK completed the fetch.

`fetchedAt` is an SDK retrieval time, not an oracle observation timestamp.
The current lending canister price response does not expose the underlying
oracle timestamp.

#### Returns

`Promise`\<[`AssetPriceSnapshot`](../interfaces/AssetPriceSnapshot.md)\>

Protocol prices and their SDK fetch timestamp.

***

### getPoolRate()

> **getPoolRate**(`poolId`): `Promise`\<[`PoolRate`](../interfaces/PoolRate.md)\>

Defined in: [packages/client/src/modules/market/market.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L181)

Returns the current borrow, lend, and utilization rates for a pool.

#### Parameters

##### poolId

`string`

The pool principal text.

#### Returns

`Promise`\<[`PoolRate`](../interfaces/PoolRate.md)\>

The borrow, lend, and utilization rates for the requested pool.

***

### getReserveData()

> **getReserveData**(`query`): `Promise`\<[`Pool`](../interfaces/Pool.md)\>

Defined in: [packages/client/src/modules/market/market.ts:171](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L171)

Returns the full pool record for the given asset and chain pair.

Convenience wrapper over [MarketModule.findPool](#findpool). `listPools()` already
enriches each pool with its current rate data, so no extra canister call is made.

#### Parameters

##### query

[`AssetIdentifier`](../type-aliases/AssetIdentifier.md)

The market asset and chain pair to match.

#### Returns

`Promise`\<[`Pool`](../interfaces/Pool.md)\>

The matching pool enriched with current rate data.

***

### listPools()

> **listPools**(): `Promise`\<[`Pool`](../interfaces/Pool.md)[]\>

Defined in: [packages/client/src/modules/market/market.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L49)

Lists SDK-supported pools with their current rates.

Unsupported asset or chain variants returned by the canister are omitted.

#### Returns

`Promise`\<[`Pool`](../interfaces/Pool.md)[]\>

Supported lending pools enriched with their current rate data.
