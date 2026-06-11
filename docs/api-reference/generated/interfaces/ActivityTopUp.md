[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ActivityTopUp

# Interface: ActivityTopUp

Defined in: [packages/client/src/modules/activities/types.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L34)

Fee top-up state for an inflow activity.

## Properties

### depositedAmount

> **depositedAmount**: `bigint`

Defined in: [packages/client/src/modules/activities/types.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L38)

Total same-token deposited amount counted toward the current fee.

***

### feeAmount

> **feeAmount**: `bigint`

Defined in: [packages/client/src/modules/activities/types.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L40)

Current deposit-address processing fee.

***

### required

> **required**: `boolean`

Defined in: [packages/client/src/modules/activities/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L36)

Whether another transfer is needed before processing can continue.

***

### shortfallAmount

> **shortfallAmount**: `bigint`

Defined in: [packages/client/src/modules/activities/types.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L42)

Additional amount needed before processing can start.
