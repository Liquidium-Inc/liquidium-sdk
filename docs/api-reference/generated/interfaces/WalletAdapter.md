[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletAdapter

# Interface: WalletAdapter

Defined in: [packages/client/src/core/wallet-actions.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L109)

Optional wallet capabilities. Implement only what your flow uses:

- `signMessage` - account creation, borrow, withdraw
- `sendBtcTransaction` / `sendEthTransaction` - automated transfer-path supply
- `sendEthTransaction` - contract-interaction supply and ETH native sends
- `signPsbt` - reserved; no current SDK flow emits PSBT-signing actions

## Properties

### sendBtcTransaction?

> `optional` **sendBtcTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:117](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L117)

Sends a BTC transaction and returns its transaction id.

#### Parameters

##### request

[`SendBtcTransactionRequest`](SendBtcTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendEthTransaction?

> `optional` **sendEthTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:115](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L115)

Sends an EVM transaction and returns its transaction hash.

#### Parameters

##### request

[`SendEthTransactionRequest`](SendEthTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### signMessage?

> `optional` **signMessage?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:111](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L111)

Signs an SDK plaintext message and returns the wallet signature. BTC adapters may return base64 BIP-322 or hex-encoded signature bytes.

#### Parameters

##### request

[`SignMessageRequest`](SignMessageRequest.md)

#### Returns

`Promise`\<`string`\>

***

### signPsbt?

> `optional` **signPsbt?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:113](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L113)

Reserved for future PSBT-signing flows; no current SDK method calls this.

#### Parameters

##### request

[`SignPsbtRequest`](SignPsbtRequest.md)

#### Returns

`Promise`\<`string`\>
