[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateAccountAction

# Interface: CreateAccountAction

Defined in: [packages/client/src/modules/accounts/types.ts:21](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L21)

Prepared action for creating a Liquidium profile.

## Extends

- [`SignableAction`](SignableAction.md)\<[`CreateAccountData`](CreateAccountData.md), `string`\>

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:141](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L141)

Default account to pass to the wallet adapter.

#### Inherited from

[`SignableAction`](SignableAction.md).[`account`](SignableAction.md#account)

***

### actionType

> **actionType**: `"create-account"`

Defined in: [packages/client/src/modules/accounts/types.ts:28](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L28)

Adapter-facing action type.

#### Overrides

[`SignableAction`](SignableAction.md).[`actionType`](SignableAction.md#actiontype)

***

### data

> **data**: [`CreateAccountData`](CreateAccountData.md)

Defined in: [packages/client/src/core/wallet-actions.ts:145](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L145)

Original request data needed to submit the signed action.

#### Inherited from

[`SignableAction`](SignableAction.md).[`data`](SignableAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/modules/accounts/types.ts:26](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L26)

Required wallet capability.

#### Overrides

[`SignableAction`](SignableAction.md).[`executionKind`](SignableAction.md#executionkind)

***

### kind

> **kind**: `"create-account"`

Defined in: [packages/client/src/modules/accounts/types.ts:24](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L24)

Protocol action kind.

#### Overrides

[`SignableAction`](SignableAction.md).[`kind`](SignableAction.md#kind)

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:143](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L143)

Plaintext message that must be signed.

#### Inherited from

[`SignableAction`](SignableAction.md).[`message`](SignableAction.md#message)

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/core/wallet-actions.ts:139](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L139)

Transfer path associated with the action.

#### Inherited from

[`SignableAction`](SignableAction.md).[`transferMode`](SignableAction.md#transfermode)

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:147](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L147)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<`string`\>

#### Inherited from

[`SignableAction`](SignableAction.md).[`submit`](SignableAction.md#submit)
