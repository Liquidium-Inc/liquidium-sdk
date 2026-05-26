[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SendEthTransactionRequest

# Interface: SendEthTransactionRequest

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:72](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L72)

ETH transaction-sending request passed to wallet adapters.

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:78](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L78)

Optional account override for the sending wallet.

***

### actionType

> **actionType**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:80](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L80)

SDK action type that produced this request.

***

### chain

> **chain**: `"ETH"`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:74](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L74)

ETH chain discriminator.

***

### transaction

> **transaction**: [`EthTransactionRequest`](EthTransactionRequest.md)

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:76](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L76)

Transaction payload to send.

***

### transferMode

> **transferMode**: [`TransferMode`](../type-aliases/TransferMode.md)

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:82](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L82)

Transfer path associated with the action.
