[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendEthTransactionWalletAction

# Interface: SendEthTransactionWalletAction\<TResult\>

Defined in: [packages/client/src/core/wallet-actions.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L181)

Prepared action that requires sending an ETH transaction before submit.

## Type Parameters

### TResult

`TResult`

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:191](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L191)

Optional default account to pass to the wallet adapter.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:187](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L187)

Adapter-facing action type.

***

### executionKind

> **executionKind**: `"send-eth-transaction"`

Defined in: [packages/client/src/core/wallet-actions.ts:185](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L185)

Wallet capability required to execute the action.

***

### kind

> **kind**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:183](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L183)

Protocol action kind.

***

### transaction

> **transaction**: [`EthTransactionRequest`](EthTransactionRequest.md)

Defined in: [packages/client/src/core/wallet-actions.ts:193](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L193)

EVM transaction request to send.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/core/wallet-actions.ts:189](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L189)

Transfer path associated with the action.

## Methods

### submit()

> **submit**(`request`): `Promise`\<`TResult`\>

Defined in: [packages/client/src/core/wallet-actions.ts:195](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L195)

Submits the transaction hash and resolves the protocol result.

#### Parameters

##### request

[`SendEthTransactionSubmitRequest`](SendEthTransactionSubmitRequest.md)

#### Returns

`Promise`\<`TResult`\>
