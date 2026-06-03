[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ActivityTopUp

# Interface: ActivityTopUp

Defined in: [packages/client/src/modules/activities/types.ts:47](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L47)

Fee top-up state for an inflow activity.

## Properties

### depositedAmount

> **depositedAmount**: `bigint`

Defined in: [packages/client/src/modules/activities/types.ts:51](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L51)

Total same-token deposited amount counted toward the current fee.

***

### feeAmount

> **feeAmount**: `bigint`

Defined in: [packages/client/src/modules/activities/types.ts:53](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L53)

Current deposit-address processing fee.

***

### required

> **required**: `boolean`

Defined in: [packages/client/src/modules/activities/types.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L49)

Whether another transfer is needed before processing can continue.

***

### shortfallAmount

> **shortfallAmount**: `bigint`

Defined in: [packages/client/src/modules/activities/types.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L55)

Additional amount needed before processing can start.
