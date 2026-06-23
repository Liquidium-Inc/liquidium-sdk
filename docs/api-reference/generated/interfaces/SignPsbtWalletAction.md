[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignPsbtWalletAction

# Interface: SignPsbtWalletAction\<TResult\>

Defined in: [packages/client/src/core/wallet-actions.ts:163](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L163)

Reserved prepared action for future BTC PSBT-signing flows.

## Type Parameters

### TResult

`TResult`

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:173](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L173)

Optional default account to pass to the wallet adapter.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:169](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L169)

Adapter-facing action type.

***

### executionKind

> **executionKind**: `"sign-psbt"`

Defined in: [packages/client/src/core/wallet-actions.ts:167](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L167)

Wallet capability required to execute the action.

***

### kind

> **kind**: [`WalletActionKind`](../type-aliases/WalletActionKind.md)

Defined in: [packages/client/src/core/wallet-actions.ts:165](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L165)

Protocol action kind.

***

### psbtBase64

> **psbtBase64**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:175](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L175)

Base64-encoded unsigned PSBT.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/core/wallet-actions.ts:171](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L171)

Transfer path associated with the action.

## Methods

### submit()

> **submit**(`request`): `Promise`\<`TResult`\>

Defined in: [packages/client/src/core/wallet-actions.ts:177](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L177)

Submits the signed PSBT and resolves the protocol result.

#### Parameters

##### request

[`SignPsbtSubmitRequest`](SignPsbtSubmitRequest.md)

#### Returns

`Promise`\<`TResult`\>
