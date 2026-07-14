[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletAdapter

# Interface: WalletAdapter

Defined in: [packages/client/src/core/wallet-actions.ts:108](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L108)

Optional wallet capabilities. Implement only what your flow uses:

- `signMessage` - account creation, borrow, withdraw
- `sendBtcTransaction` / `sendEthTransaction` - automated native-asset transfer supply
- `sendIcrcTransfer` - automated ck-ledger and ICP ledger transfer supply
- `sendEthTransaction` - contract-interaction supply and ETH native-asset sends

## Properties

### sendBtcTransaction?

> `optional` **sendBtcTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:114](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L114)

Sends a BTC transaction and returns its transaction id.

#### Parameters

##### request

[`SendBtcTransactionRequest`](SendBtcTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendEthTransaction?

> `optional` **sendEthTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:112](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L112)

Sends an EVM transaction and returns its transaction hash.

#### Parameters

##### request

[`SendEthTransactionRequest`](SendEthTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendIcrcTransfer?

> `optional` **sendIcrcTransfer?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:116](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L116)

Sends an ICRC ledger transfer and returns the ledger transaction reference.

#### Parameters

##### request

[`SendIcrcTransferRequest`](SendIcrcTransferRequest.md)

#### Returns

`Promise`\<`string`\>

***

### signMessage?

> `optional` **signMessage?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:110](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L110)

Signs an SDK plaintext message and returns the wallet signature. BTC adapters may return base64 BIP-322 or hex-encoded signature bytes.

#### Parameters

##### request

[`SignMessageRequest`](SignMessageRequest.md)

#### Returns

`Promise`\<`string`\>
