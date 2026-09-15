[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendEthTransactionRequest

# Interface: SendEthTransactionRequest

Defined in: packages/client/src/core/wallet-actions.ts:47

ETH transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:53

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: packages/client/src/core/wallet-actions.ts:55

SDK action type that produced this request.

***

### chain

> **chain**: `"ETH"`

Defined in: packages/client/src/core/wallet-actions.ts:49

ETH chain discriminator.

***

### transaction

> **transaction**: [`EthTransactionRequest`](EthTransactionRequest.md)

Defined in: packages/client/src/core/wallet-actions.ts:51

Transaction payload to send.
