[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignMessageWalletAction

# Interface: SignMessageWalletAction\<TData, TResult\>

Defined in: [packages/client/src/core/wallet-actions.ts:111](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L111)

Prepared action that requires message signing before submit.

## Extended by

- [`SignableAction`](SignableAction.md)
- [`BorrowAction`](BorrowAction.md)
- [`WithdrawAction`](WithdrawAction.md)

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

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:117](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L117)

Adapter-facing action type.

***

### data

> **data**: `TData`

Defined in: [packages/client/src/core/wallet-actions.ts:125](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L125)

Original request data needed to submit the signed action.

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/core/wallet-actions.ts:115](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L115)

Wallet capability required to execute the action.

***

### kind

> **kind**: [`WalletActionKind`](../type-aliases/WalletActionKind.md)

Defined in: [packages/client/src/core/wallet-actions.ts:113](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L113)

Protocol action kind.

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:123](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L123)

Plaintext message that must be signed.

***

### transferMode

> **transferMode**: `"native"`

Defined in: [packages/client/src/core/wallet-actions.ts:119](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L119)

Transfer path associated with the action.

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
