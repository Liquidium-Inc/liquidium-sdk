[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PoolRate

# Interface: PoolRate

Defined in: packages/client/src/modules/market/types.ts:84

Current borrow, lend, and utilization rates for a pool.

## Properties

### borrowRate

> **borrowRate**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:88

Borrow APR scaled by `rateDecimals`.

***

### estimatedBorrowApy

> **estimatedBorrowApy**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:90

Estimated borrow APY scaled by `rateDecimals`.

***

### estimatedLendApy

> **estimatedLendApy**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:94

Estimated lend APY scaled by `rateDecimals`.

***

### lendRate

> **lendRate**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:92

Lend APR scaled by `rateDecimals`.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:86

Decimal scale used by rate fields.

***

### utilizationRate

> **utilizationRate**: `bigint`

Defined in: packages/client/src/modules/market/types.ts:96

Utilization rate scaled by `rateDecimals`.
