[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignableAction

# Interface: SignableAction\<TData, TResult\>

Defined in: [packages/client/src/modules/accounts/types.ts:35](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/accounts/types.ts#L35)

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

Defined in: [packages/client/src/core/wallet-actions.ts:121](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L121)

Default account to pass to the wallet adapter.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`account`](SignMessageWalletAction.md#account)

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:117](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L117)

Adapter-facing action type.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`actionType`](SignMessageWalletAction.md#actiontype)

***

### data

> **data**: `TData`

Defined in: [packages/client/src/core/wallet-actions.ts:125](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L125)

Original request data needed to submit the signed action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`data`](SignMessageWalletAction.md#data)

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/core/wallet-actions.ts:115](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L115)

Wallet capability required to execute the action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`executionKind`](SignMessageWalletAction.md#executionkind)

***

### kind

> **kind**: [`WalletActionKind`](../type-aliases/WalletActionKind.md)

Defined in: [packages/client/src/core/wallet-actions.ts:113](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L113)

Protocol action kind.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`kind`](SignMessageWalletAction.md#kind)

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:123](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L123)

Plaintext message that must be signed.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`message`](SignMessageWalletAction.md#message)

***

### transferMode

> **transferMode**: `"native"`

Defined in: [packages/client/src/core/wallet-actions.ts:119](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L119)

Transfer path associated with the action.

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`transferMode`](SignMessageWalletAction.md#transfermode)

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<`TResult`\>

Defined in: [packages/client/src/core/wallet-actions.ts:127](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L127)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<`TResult`\>

#### Inherited from

[`SignMessageWalletAction`](SignMessageWalletAction.md).[`submit`](SignMessageWalletAction.md#submit)
