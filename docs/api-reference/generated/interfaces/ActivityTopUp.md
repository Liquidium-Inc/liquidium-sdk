[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ActivityTopUp

# Interface: ActivityTopUp

Defined in: packages/client/src/modules/activities/types.ts:15

Fee top-up state for an inflow activity.

## Properties

### depositedAmount

> **depositedAmount**: `bigint`

Defined in: packages/client/src/modules/activities/types.ts:19

Total same-token deposited amount counted toward the current fee.

***

### feeAmount

> **feeAmount**: `bigint`

Defined in: packages/client/src/modules/activities/types.ts:21

Current deposit-address processing fee.

***

### required

> **required**: `boolean`

Defined in: packages/client/src/modules/activities/types.ts:17

Whether another transfer is needed before processing can continue.

***

### shortfallAmount

> **shortfallAmount**: `bigint`

Defined in: packages/client/src/modules/activities/types.ts:23

Additional amount needed before processing can start.
