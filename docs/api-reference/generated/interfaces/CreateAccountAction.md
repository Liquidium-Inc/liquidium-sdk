[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateAccountAction

# Interface: CreateAccountAction

Defined in: [packages/client/src/modules/accounts/types.ts:39](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L39)

Prepared action for creating a Liquidium profile.

## Extends

- [`SignableAction`](SignableAction.md)\<[`CreateAccountData`](CreateAccountData.md), `string`\>

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:121](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L121)

Default account to pass to the wallet adapter.

#### Inherited from

[`SignableAction`](SignableAction.md).[`account`](SignableAction.md#account)

***

### actionType

> **actionType**: `"create-account"`

Defined in: [packages/client/src/modules/accounts/types.ts:46](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L46)

Adapter-facing action type.

#### Overrides

[`SignableAction`](SignableAction.md).[`actionType`](SignableAction.md#actiontype)

***

### data

> **data**: [`CreateAccountData`](CreateAccountData.md)

Defined in: [packages/client/src/core/wallet-actions.ts:125](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L125)

Original request data needed to submit the signed action.

#### Inherited from

[`SignableAction`](SignableAction.md).[`data`](SignableAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/modules/accounts/types.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L44)

Required wallet capability.

#### Overrides

[`SignableAction`](SignableAction.md).[`executionKind`](SignableAction.md#executionkind)

***

### kind

> **kind**: `"create-account"`

Defined in: [packages/client/src/modules/accounts/types.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L42)

Protocol action kind.

#### Overrides

[`SignableAction`](SignableAction.md).[`kind`](SignableAction.md#kind)

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:123](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L123)

Plaintext message that must be signed.

#### Inherited from

[`SignableAction`](SignableAction.md).[`message`](SignableAction.md#message)

***

### transferMode

> **transferMode**: `"native"`

Defined in: [packages/client/src/core/wallet-actions.ts:119](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L119)

Transfer path associated with the action.

#### Inherited from

[`SignableAction`](SignableAction.md).[`transferMode`](SignableAction.md#transfermode)

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:127](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L127)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`SignableAction`](SignableAction.md).[`submit`](SignableAction.md#submit)
