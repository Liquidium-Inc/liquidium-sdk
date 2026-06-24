[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendEthTransactionRequest

# Interface: SendEthTransactionRequest

Defined in: [packages/client/src/core/wallet-actions.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L55)

ETH transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:61](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L61)

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L63)

SDK action type that produced this request.

***

### chain

> **chain**: `"ETH"`

Defined in: [packages/client/src/core/wallet-actions.ts:57](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L57)

ETH chain discriminator.

***

### transaction

> **transaction**: [`EthTransactionRequest`](EthTransactionRequest.md)

Defined in: [packages/client/src/core/wallet-actions.ts:59](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L59)

Transaction payload to send.

***

### transferMode

> **transferMode**: `"native"`

Defined in: [packages/client/src/core/wallet-actions.ts:65](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L65)

Transfer path associated with the action.
