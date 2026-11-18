[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendEthTransactionRequest

# Interface: SendEthTransactionRequest

Defined in: packages/client/src/core/wallet-actions.ts:48

ETH transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:54

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:56

SDK action type that produced this request.

***

### chain

> **chain**: `"ETH"`

Defined in: packages/client/src/core/wallet-actions.ts:50

ETH chain discriminator.

***

### transaction

> **transaction**: [`EthTransactionRequest`](EthTransactionRequest.md)

Defined in: packages/client/src/core/wallet-actions.ts:52

Transaction payload to send.
