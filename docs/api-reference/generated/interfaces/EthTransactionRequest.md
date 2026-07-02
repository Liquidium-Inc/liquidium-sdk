[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / EthTransactionRequest

# Interface: EthTransactionRequest

Defined in: [packages/client/src/core/wallet-actions.ts:29](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L29)

EVM transaction request passed to wallet adapters.

## Properties

### chainId?

> `optional` **chainId?**: `number`

Defined in: [packages/client/src/core/wallet-actions.ts:37](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L37)

Optional EVM chain id for wallet implementations that require it.

***

### data?

> `optional` **data?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:33](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L33)

Hex-encoded calldata for contract interactions.

***

### to

> **to**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:31](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L31)

Destination address or contract address.

***

### value?

> `optional` **value?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:35](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L35)

Native ETH value in wei, serialized as a decimal string.
