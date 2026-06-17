[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccount

# Interface: IcrcAccount

Defined in: [packages/client/src/modules/instant-loans/types.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L49)

ICRC account returned by existing or future canister state.

## Properties

### address

> **address**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:57](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L57)

Text-encoded ICRC account for display.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:53](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L53)

ICRC account owner principal text.

***

### subaccount?

> `optional` **subaccount?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: [packages/client/src/modules/instant-loans/types.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L55)

Optional ICRC subaccount bytes.

***

### type

> **type**: `"Icrc"`

Defined in: [packages/client/src/modules/instant-loans/types.ts:51](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L51)

Account kind discriminator.
