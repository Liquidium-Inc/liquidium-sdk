[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignableAction

# Interface: SignableAction\<TData, TResult\>

Defined in: [packages/client/src/modules/accounts/types.ts:17](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L17)

Sign-message action that can be submitted after wallet signing.

## Extends

- [`SignMessageWalletAction`](SignMessageWalletAction.md)\<`TData`, `TResult`\>

## Extended by

- [`CreateAccountAction`](CreateAccountAction.md)

## Type Parameters

### TData

`TData`

### TResult

`TResult`

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:141](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L141)

Default account to pass to the wallet adapter.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`account`](SignMessageWalletAction.md#account)

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:137](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L137)

Adapter-facing action type.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`actionType`](SignMessageWalletAction.md#actiontype)

***

### data

> **data**: `TData`

Defined in: [packages/client/src/core/wallet-actions.ts:145](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L145)

Original request data needed to submit the signed action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`data`](SignMessageWalletAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/core/wallet-actions.ts:135](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L135)

Wallet capability required to execute the action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`executionKind`](SignMessageWalletAction.md#executionkind)

***

### kind

> **kind**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:133](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L133)

Protocol action kind.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`kind`](SignMessageWalletAction.md#kind)

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:143](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L143)

Plaintext message that must be signed.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`message`](SignMessageWalletAction.md#message)

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/core/wallet-actions.ts:139](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L139)

Transfer path associated with the action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`transferMode`](SignMessageWalletAction.md#transfermode)

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<`TResult`\>

Defined in: [packages/client/src/core/wallet-actions.ts:147](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L147)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<`TResult`\>

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`submit`](SignMessageWalletAction.md#submit)
