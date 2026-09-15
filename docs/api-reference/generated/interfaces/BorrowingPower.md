[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowingPower

# Interface: BorrowingPower

Defined in: packages/client/src/modules/positions/types.ts:27

Aggregate borrowing capacity for a profile.

## Properties

### maxBorrowableUsd

> **maxBorrowableUsd**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:31

Maximum borrowable USD value, scaled by `maxBorrowableUsdDecimals`.

***

### maxBorrowableUsdDecimals

> **maxBorrowableUsdDecimals**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:33

Decimal scale for `maxBorrowableUsd`.

***

### weightedMaxLtv

> **weightedMaxLtv**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:29

Weighted maximum LTV in basis points.
