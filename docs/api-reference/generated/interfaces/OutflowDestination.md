[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowDestination

# Interface: OutflowDestination

Defined in: [packages/client/src/modules/lending/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L36)

Borrow or withdraw destination, with optional account type hint.

## Properties

### address

> **address**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L38)

Destination address, principal, ICRC account, or ICP account identifier.

***

### type?

> `optional` **type?**: [`OutflowAccountType`](../type-aliases/OutflowAccountType.md)

Defined in: [packages/client/src/modules/lending/types.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L40)

Optional account type hint. When omitted, the SDK auto-detects the type.
