[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / UserReserve

# Interface: UserReserve

Defined in: packages/client/src/modules/positions/types.ts:87

Position joined with pool metadata and current USD valuation.

## Properties

### borrowedUsd

> **borrowedUsd**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:97

Borrowed value in USD-scaled units.

***

### pool

> **pool**: [`Pool`](Pool.md)

Defined in: packages/client/src/modules/positions/types.ts:91

Pool metadata and rate data.

***

### position

> **position**: [`Position`](Position.md)

Defined in: packages/client/src/modules/positions/types.ts:89

Position data for the pool.

***

### priceUsd

> **priceUsd**: `number`

Defined in: packages/client/src/modules/positions/types.ts:93

Current USD price for the reserve asset.

***

### suppliedUsd

> **suppliedUsd**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:95

Supplied value in USD-scaled units.

***

### usdDecimals

> **usdDecimals**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:99

Decimal scale for USD fields.
