[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WalletAdapter

# Interface: WalletAdapter

Defined in: packages/client/src/core/wallet-actions.ts:118

Optional wallet capabilities. Implement only what your flow uses:

- `signMessage` - account creation, borrow, withdraw, recovery
- `sendBtcTransaction` / `sendEthTransaction` / `sendSolTransaction` - native-asset transfer supply
- `sendIcrcTransfer` - automated ck-ledger and ICP ledger transfer supply
- `sendEthTransaction` - contract-interaction supply and ETH native-asset sends

## Properties

### sendBtcTransaction?

> `optional` **sendBtcTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: packages/client/src/core/wallet-actions.ts:126

Sends a BTC transaction and returns its transaction id.

#### Parameters

##### request

[`SendBtcTransactionRequest`](SendBtcTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendEthTransaction?

> `optional` **sendEthTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: packages/client/src/core/wallet-actions.ts:124

Sends an EVM transaction and returns its transaction hash.

#### Parameters

##### request

[`SendEthTransactionRequest`](SendEthTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendIcrcTransfer?

> `optional` **sendIcrcTransfer?**: (`request`) => `Promise`\<`string`\>

Defined in: packages/client/src/core/wallet-actions.ts:128

Sends an ICRC ledger transfer and returns the ledger transaction reference.

#### Parameters

##### request

[`SendIcrcTransferRequest`](SendIcrcTransferRequest.md)

#### Returns

`Promise`\<`string`\>

***

### sendSolTransaction?

> `optional` **sendSolTransaction?**: (`request`) => `Promise`\<`string`\>

Defined in: packages/client/src/core/wallet-actions.ts:120

Sends native SOL and returns its case-sensitive base58 transaction signature.

#### Parameters

##### request

[`SendSolTransactionRequest`](SendSolTransactionRequest.md)

#### Returns

`Promise`\<`string`\>

***

### signMessage?

> `optional` **signMessage?**: (`request`) => `Promise`\<`string`\>

Defined in: packages/client/src/core/wallet-actions.ts:122

Signs an SDK plaintext message. BTC accepts base64 BIP-322 or hex; SOL requires 64 hex-encoded Ed25519 bytes.

#### Parameters

##### request

[`SignMessageRequest`](SignMessageRequest.md)

#### Returns

`Promise`\<`string`\>
