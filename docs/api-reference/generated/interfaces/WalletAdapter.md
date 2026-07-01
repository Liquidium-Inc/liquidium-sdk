[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletAdapter

# Interface: WalletAdapter

Defined in: [packages/client/src/core/wallet-actions.ts:124](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L124)

Optional wallet capabilities. Implement only what your flow uses:

- `signMessage` - account creation, borrow, withdraw
- `sendBtcTransaction` / `sendEthTransaction` - automated native transfer-path supply
- `sendIcrcTransfer` - automated ck-asset and ICP ledger transfer supply
- `sendEthTransaction` - contract-interaction supply and ETH native sends

## Properties

### sendBtcTransaction?

> `optional` **sendBtcTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:130](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L130)

Sends a BTC transaction and returns its transaction id.

#### Parameters

##### request

[`SendBtcTransactionRequest`](SendBtcTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendEthTransaction?

> `optional` **sendEthTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:128](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L128)

Sends an EVM transaction and returns its transaction hash.

#### Parameters

##### request

[`SendEthTransactionRequest`](SendEthTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendIcrcTransfer?

> `optional` **sendIcrcTransfer?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:132](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L132)

Sends an ICRC ledger transfer and returns the ledger transaction reference.

#### Parameters

##### request

[`SendIcrcTransferRequest`](SendIcrcTransferRequest.md)

#### Returns

`Promise`\<`string`\>

***

### signMessage?

> `optional` **signMessage?**: (`request`) => `Promise`\<`string`\>

Defined in: [packages/client/src/core/wallet-actions.ts:126](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L126)

Signs an SDK plaintext message and returns the wallet signature. BTC adapters may return base64 BIP-322 or hex-encoded signature bytes.

#### Parameters

##### request

[`SignMessageRequest`](SignMessageRequest.md)

#### Returns

`Promise`\<`string`\>
