[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowingPower

# Interface: BorrowingPower

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:27](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L27)

Aggregate borrowing capacity for a profile.

## Properties

### maxBorrowableUsd

> **maxBorrowableUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:31](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L31)

Maximum borrowable USD value, scaled by `maxBorrowableUsdDecimals`.

***

### maxBorrowableUsdDecimals

> **maxBorrowableUsdDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:33](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L33)

Decimal scale for `maxBorrowableUsd`.

***

### weightedMaxLtv

> **weightedMaxLtv**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:29](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L29)

Weighted maximum LTV, scaled by protocol rate decimals.
