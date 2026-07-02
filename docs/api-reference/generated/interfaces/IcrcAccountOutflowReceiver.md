[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccountOutflowReceiver

# Interface: IcrcAccountOutflowReceiver

Defined in: [packages/client/src/modules/lending/types.ts:131](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L131)

ICRC account destination for a completed outflow.

## Properties

### address

> **address**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:139](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L139)

Text-encoded ICRC account for display.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:135](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L135)

ICRC account owner principal text.

***

### subaccount?

> `optional` **subaccount?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [packages/client/src/modules/lending/types.ts:137](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L137)

Optional ICRC subaccount bytes.

***

### type

> **type**: `"IcrcAccount"`

Defined in: [packages/client/src/modules/lending/types.ts:133](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L133)

Destination account type.
