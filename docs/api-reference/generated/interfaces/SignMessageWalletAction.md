[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignMessageWalletAction

# Interface: SignMessageWalletAction\<TData, TResult\>

Defined in: [packages/client/src/core/wallet-actions.ts:130](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L130)

Prepared action that requires message signing before submit.

## Extended by

- [`CreateAccountAction`](CreateAccountAction.md)
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

Defined in: [packages/client/src/core/wallet-actions.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L138)

Default account to pass to the wallet adapter.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L136)

Adapter-facing action type.

***

### data

> **data**: `TData`

Defined in: [packages/client/src/core/wallet-actions.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L142)

Original request data needed to submit the signed action.

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [packages/client/src/core/wallet-actions.ts:134](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L134)

Wallet capability required to execute the action.

***

### kind

> **kind**: [`WalletActionKind`](../type-aliases/WalletActionKind.md)

Defined in: [packages/client/src/core/wallet-actions.ts:132](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L132)

Protocol action kind.

***

### message

> **message**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L140)

Plaintext message that must be signed.

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<`TResult`\>

Defined in: [packages/client/src/core/wallet-actions.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L144)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<`TResult`\>
