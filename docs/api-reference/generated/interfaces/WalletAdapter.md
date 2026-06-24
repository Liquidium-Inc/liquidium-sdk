[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletAdapter

# Interface: WalletAdapter

Defined in: [packages/client/src/core/wallet-actions.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L91)

Optional wallet capabilities. Implement only what your flow uses:

- `signMessage` - account creation, borrow, withdraw
- `sendBtcTransaction` / `sendEthTransaction` - automated transfer-path supply
- `sendEthTransaction` - contract-interaction supply and ETH native sends

## Properties

### sendBtcTransaction?

> `optional` **sendBtcTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:97](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L97)

Sends a BTC transaction and returns its transaction id.

#### Parameters

##### request

[`SendBtcTransactionRequest`](SendBtcTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendEthTransaction?

> `optional` **sendEthTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:95](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L95)

Sends an EVM transaction and returns its transaction hash.

#### Parameters

##### request

[`SendEthTransactionRequest`](SendEthTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### signMessage?

> `optional` **signMessage?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:93](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L93)

Signs an SDK plaintext message and returns the wallet signature. BTC adapters may return base64 BIP-322 or hex-encoded signature bytes.

#### Parameters

##### request

[`SignMessageRequest`](SignMessageRequest.md)

#### Returns

`Promise`\<`string`\>
