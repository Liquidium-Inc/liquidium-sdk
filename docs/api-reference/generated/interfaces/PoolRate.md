[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PoolRate

# Interface: PoolRate

Defined in: [packages/client/src/modules/market/types.ts:84](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L84)

Current borrow, lend, and utilization rates for a pool.

## Properties

### borrowRate

> **borrowRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:88](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L88)

Borrow APR scaled by `rateDecimals`.

***

### estimatedBorrowApy

> **estimatedBorrowApy**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:90](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L90)

Estimated borrow APY scaled by `rateDecimals`.

***

### estimatedLendApy

> **estimatedLendApy**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:94](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L94)

Estimated lend APY scaled by `rateDecimals`.

***

### lendRate

> **lendRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:92](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L92)

Lend APR scaled by `rateDecimals`.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:86](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L86)

Decimal scale used by rate fields.

***

### utilizationRate

> **utilizationRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L96)

Utilization rate scaled by `rateDecimals`.
