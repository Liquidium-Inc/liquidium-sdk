[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / MarketModule

# Class: MarketModule

Defined in: [packages/client/src/modules/market/market.ts:31](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L31)

Pool metadata, prices, and current rate helpers.

## Constructors

### Constructor

> **new MarketModule**(`canisterContext`): `MarketModule`

Defined in: [packages/client/src/modules/market/market.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L32)

#### Parameters

##### canisterContext

`CanisterContext`

#### Returns

`MarketModule`

## Methods

### findPool()

> **findPool**(`query`): `Promise`\<[`Pool`](../interfaces/Pool.md)\>

Defined in: [packages/client/src/modules/market/market.ts:101](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L101)

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

Defined in: [packages/client/src/modules/market/market.ts:74](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L74)

Returns the latest asset prices reported by the protocol.

#### Returns

`Promise`\<[`AssetPrices`](../type-aliases/AssetPrices.md)\>

The latest protocol price map keyed by market asset symbol.

***

### getPoolRate()

> **getPoolRate**(`poolId`): `Promise`\<[`PoolRate`](../interfaces/PoolRate.md)\>

Defined in: [packages/client/src/modules/market/market.ts:154](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L154)

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

Defined in: [packages/client/src/modules/market/market.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L144)

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

Defined in: [packages/client/src/modules/market/market.ts:41](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/market.ts#L41)

Lists SDK-supported pools with their current rates.

Unsupported asset or chain variants returned by the canister are omitted.

#### Returns

`Promise`\<[`Pool`](../interfaces/Pool.md)[]\>

Supported lending pools enriched with their current rate data.
