[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / HealthFactor

# Interface: HealthFactor

Defined in: [packages/client/src/modules/positions/types.ts:53](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L53)

Health factor and supporting aggregate stats for a profile.

## Properties

### healthFactor

> **healthFactor**: `bigint` \| `null`

Defined in: [packages/client/src/modules/positions/types.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L55)

Health factor scaled by `healthFactorDecimals`, or `null` with no debt.

***

### healthFactorDecimals

> **healthFactorDecimals**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:57](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L57)

Decimal scale for a finite `healthFactor`.

***

### userStats

> **userStats**: [`UserStats`](UserStats.md)

Defined in: [packages/client/src/modules/positions/types.ts:59](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L59)

Aggregate stats used to derive the health factor.
