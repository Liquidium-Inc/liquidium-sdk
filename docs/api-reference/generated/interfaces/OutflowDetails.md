[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowDetails

# Interface: OutflowDetails

Defined in: packages/client/src/modules/lending/types.ts:55

Receipt for a borrow or withdrawal outflow submitted to the lending canister.

`id` is the outflow reference to show users immediately. `txid` may be unset until
the protocol assigns a chain transaction id. `outflowRef` is an optional protocol reference.

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:65

Outflow amount in the pool asset's base units.

***

### id

> **id**: `string`

Defined in: packages/client/src/modules/lending/types.ts:57

Protocol outflow id.

***

### outflowRef?

> `optional` **outflowRef?**: `string`

Defined in: packages/client/src/modules/lending/types.ts:61

Optional protocol outflow reference.

***

### outflowType

> **outflowType**: [`OutflowType`](../type-aliases/OutflowType.md)

Defined in: packages/client/src/modules/lending/types.ts:59

Borrow, withdrawal, or fee-claim discriminator.

***

### receiver

> **receiver**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: packages/client/src/modules/lending/types.ts:67

Outflow destination account.

***

### txid?

> `optional` **txid?**: `string`

Defined in: packages/client/src/modules/lending/types.ts:63

Chain transaction id when already assigned by the protocol.
