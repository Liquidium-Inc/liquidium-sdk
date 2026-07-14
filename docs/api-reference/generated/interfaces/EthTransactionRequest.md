[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EthTransactionRequest

# Interface: EthTransactionRequest

Defined in: [packages/client/src/core/wallet-actions.ts:23](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L23)

EVM transaction request passed to wallet adapters.

## Properties

### chainId?

> `optional` **chainId?**: `number`

Defined in: [packages/client/src/core/wallet-actions.ts:31](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L31)

Optional EVM chain id for wallet implementations that require it.

***

### data?

> `optional` **data?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:27](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L27)

Hex-encoded calldata for contract interactions.

***

### to

> **to**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:25](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L25)

Destination address or contract address.

***

### value?

> `optional` **value?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:29](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L29)

Native ETH value in wei, serialized as a decimal string.
