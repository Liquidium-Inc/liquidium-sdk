[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendEthTransactionWalletAction

# Interface: SendEthTransactionWalletAction\<TResult\>

Defined in: [packages/client/src/core/wallet-actions.ts:169](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L169)

Prepared action that requires sending an ETH transaction before submit.

## Type Parameters

### TResult

`TResult`

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:179](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L179)

Optional default account to pass to the wallet adapter.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:175](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L175)

Adapter-facing action type.

***

### executionKind

> **executionKind**: `"send-eth-transaction"`

Defined in: [packages/client/src/core/wallet-actions.ts:173](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L173)

Wallet capability required to execute the action.

***

### kind

> **kind**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:171](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L171)

Protocol action kind.

***

### transaction

> **transaction**: [`EthTransactionRequest`](EthTransactionRequest.md)

Defined in: [packages/client/src/core/wallet-actions.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L181)

EVM transaction request to send.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [packages/client/src/core/wallet-actions.ts:177](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L177)

Transfer path associated with the action.

## Methods

### submit()

> **submit**(`request`): `Promise`\<`TResult`\>

Defined in: [packages/client/src/core/wallet-actions.ts:183](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L183)

Submits the transaction hash and resolves the protocol result.

#### Parameters

##### request

###### txHash

`string`

#### Returns

`Promise`\<`TResult`\>
