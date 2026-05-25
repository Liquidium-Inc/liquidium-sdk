[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PoolRate

# Interface: PoolRate

Defined in: [external/liquidium-sdk/packages/client/src/modules/market/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/market/types.ts#L73)

Current borrow, lend, and utilization rates for a pool.

## Properties

### borrowRate

> **borrowRate**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/market/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/market/types.ts#L77)

Borrow APR scaled by `rateDecimals`.

***

### lendRate

> **lendRate**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/market/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/market/types.ts#L79)

Lend APR scaled by `rateDecimals`.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/market/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/market/types.ts#L75)

Decimal scale used by rate fields.

***

### utilizationRate

> **utilizationRate**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/market/types.ts:81](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/market/types.ts#L81)

Utilization rate scaled by `rateDecimals`.
