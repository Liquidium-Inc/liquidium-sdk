[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / HealthFactor

# Interface: HealthFactor

Defined in: [packages/client/src/modules/positions/types.ts:53](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L53)

Health factor and supporting aggregate stats for a profile.

## Properties

### healthFactor

> **healthFactor**: `bigint`

Defined in: [packages/client/src/modules/positions/types.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L55)

Current health factor, scaled by protocol rate decimals.

***

### userStats

> **userStats**: [`UserStats`](UserStats.md)

Defined in: [packages/client/src/modules/positions/types.ts:57](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/types.ts#L57)

Aggregate stats used to derive the health factor.
