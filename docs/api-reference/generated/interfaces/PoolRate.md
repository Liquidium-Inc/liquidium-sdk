[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PoolRate

# Interface: PoolRate

Defined in: [packages/client/src/modules/market/types.ts:70](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L70)

Current borrow, lend, and utilization rates for a pool.

## Properties

### borrowRate

> **borrowRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:74](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L74)

Borrow APR scaled by `rateDecimals`.

***

### lendRate

> **lendRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:76](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L76)

Lend APR scaled by `rateDecimals`.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:72](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L72)

Decimal scale used by rate fields.

***

### utilizationRate

> **utilizationRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:78](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L78)

Utilization rate scaled by `rateDecimals`.
