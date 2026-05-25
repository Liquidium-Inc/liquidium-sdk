[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserReserve

# Interface: UserReserve

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:83](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L83)

Position joined with pool metadata and current USD valuation.

## Properties

### borrowedUsd

> **borrowedUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:93](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L93)

Borrowed value in USD-scaled units.

***

### pool

> **pool**: [`Pool`](Pool.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:87](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L87)

Pool metadata and rate data.

***

### position

> **position**: [`Position`](Position.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:85](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L85)

Position data for the pool.

***

### priceUsd

> **priceUsd**: `number`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:89](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L89)

Current USD price for the reserve asset.

***

### suppliedUsd

> **suppliedUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L91)

Supplied value in USD-scaled units.

***

### usdDecimals

> **usdDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:95](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L95)

Decimal scale for USD fields.
