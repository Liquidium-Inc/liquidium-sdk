[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcpRecoveryAuthorization

# Interface: IcpRecoveryAuthorization

Defined in: packages/client/src/modules/lending/types.ts:211

Authenticated ICP caller used only for the recovery update.

## Properties

### agent

> **agent**: `Agent`

Defined in: packages/client/src/modules/lending/types.ts:214

Agent for an ICP account linked to the profile. Public reads use the SDK client.

***

### subaccount?

> `optional` **subaccount?**: `Uint8Array`\<`ArrayBufferLike`\>

Defined in: packages/client/src/modules/lending/types.ts:216

Linked ICRC account subaccount. Must contain exactly 32 bytes when provided.

***

### type

> **type**: `"icp_caller"`

Defined in: packages/client/src/modules/lending/types.ts:212
