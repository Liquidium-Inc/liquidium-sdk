[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignMessageWalletAction

# Interface: SignMessageWalletAction\<TData, TResult\>

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:131](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L131)

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

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:141](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L141)

Default account to pass to the wallet adapter.

***

### actionType

> **actionType**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:137](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L137)

Adapter-facing action type.

***

### data

> **data**: `TData`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:145](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L145)

Original request data needed to submit the signed action.

***

### executionKind

> **executionKind**: `"sign-message"`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:135](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L135)

Wallet capability required to execute the action.

***

### kind

> **kind**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:133](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L133)

Protocol action kind.

***

### message

> **message**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:143](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L143)

Plaintext message that must be signed.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:139](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L139)

Transfer path associated with the action.

## Methods

### submit()

> **submit**(`signatureInfo`): `Promise`\<`TResult`\>

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:147](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L147)

Submits the signature and resolves the protocol result.

#### Parameters

##### signatureInfo

[`SignatureInfo`](SignatureInfo.md)

#### Returns

`Promise`\<`TResult`\>
