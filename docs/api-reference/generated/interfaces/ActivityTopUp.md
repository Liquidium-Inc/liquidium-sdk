[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ActivityTopUp

# Interface: ActivityTopUp

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:47](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L47)

Fee top-up state for an inflow activity.

## Properties

### depositedAmount

> **depositedAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:51](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L51)

Total same-token deposited amount counted toward the current fee.

***

### feeAmount

> **feeAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:53](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L53)

Current deposit-address processing fee.

***

### required

> **required**: `boolean`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L49)

Whether another transfer is needed before processing can continue.

***

### shortfallAmount

> **shortfallAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L55)

Additional amount needed before processing can start.
