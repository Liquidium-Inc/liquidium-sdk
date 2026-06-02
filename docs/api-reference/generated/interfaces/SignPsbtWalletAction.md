[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignPsbtWalletAction

# Interface: SignPsbtWalletAction\<TResult\>

Defined in: [packages/client/src/core/wallet-actions.ts:151](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L151)

Prepared action that requires BTC PSBT signing before submit.

## Type Parameters

### TResult

`TResult`

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:161](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L161)

Optional default account to pass to the wallet adapter.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:157](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L157)

Adapter-facing action type.

***

### executionKind

> **executionKind**: `"sign-psbt"`

Defined in: [packages/client/src/core/wallet-actions.ts:155](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L155)

Wallet capability required to execute the action.

***

### kind

> **kind**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:153](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L153)

Protocol action kind.

***

### psbtBase64

> **psbtBase64**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:163](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L163)

Base64-encoded unsigned PSBT.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/core/wallet-actions.ts:159](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L159)

Transfer path associated with the action.

## Methods

### submit()

> **submit**(`request`): `Promise`\<`TResult`\>

Defined in: [packages/client/src/core/wallet-actions.ts:165](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L165)

Submits the signed PSBT and resolves the protocol result.

#### Parameters

##### request

###### signedPsbtBase64

`string`

#### Returns

`Promise`\<`TResult`\>
