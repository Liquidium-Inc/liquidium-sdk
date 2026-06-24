[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / MarketModule

# Class: MarketModule

Defined in: [packages/client/src/modules/market/market.ts:24](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L24)

Pool metadata, prices, and current rate helpers.

## Constructors

### Constructor

> **new MarketModule**(`canisterContext`): `MarketModule`

Defined in: [packages/client/src/modules/market/market.ts:25](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L25)

#### Parameters

##### canisterContext

`CanisterContext`

#### Returns

`MarketModule`

## Methods

### findPool()

> **findPool**(`query`): `Promise`\<[`Pool`](../interfaces/Pool.md)\>

Defined in: [packages/client/src/modules/market/market.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L91)

Resolves a single pool for the given asset and chain pair.

#### Parameters

##### query

[`FindPoolQuery`](../interfaces/FindPoolQuery.md)

The market asset and chain pair to match.

#### Returns

`Promise`\<[`Pool`](../interfaces/Pool.md)\>

The single pool that matches the requested asset and chain.

***

### getAssetPrices()

> **getAssetPrices**(): `Promise`\<[`AssetPrices`](../type-aliases/AssetPrices.md)\>

Defined in: [packages/client/src/modules/market/market.ts:67](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L67)

Returns the latest asset prices reported by the protocol.

#### Returns

`Promise`\<[`AssetPrices`](../type-aliases/AssetPrices.md)\>

The latest protocol price map keyed by market asset symbol.

***

### getPoolRate()

> **getPoolRate**(`poolId`): `Promise`\<[`PoolRate`](../interfaces/PoolRate.md)\>

Defined in: [packages/client/src/modules/market/market.ts:133](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L133)

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

Defined in: [packages/client/src/modules/market/market.ts:123](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L123)

Returns the full pool record for the given asset and chain pair.

Convenience wrapper over [MarketModule.findPool](#findpool). `listPools()` already
enriches each pool with its current rate data, so no extra canister call is made.

#### Parameters

##### query

[`FindPoolQuery`](../interfaces/FindPoolQuery.md)

The market asset and chain pair to match.

#### Returns

`Promise`\<[`Pool`](../interfaces/Pool.md)\>

The matching pool enriched with current rate data.

***

### listPools()

> **listPools**(): `Promise`\<[`Pool`](../interfaces/Pool.md)[]\>

Defined in: [packages/client/src/modules/market/market.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L34)

Lists SDK-supported pools with their current rates.

Unsupported asset or chain variants returned by the canister are omitted.

#### Returns

`Promise`\<[`Pool`](../interfaces/Pool.md)[]\>

Supported lending pools enriched with their current rate data.
