[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignatureInfo

# Interface: SignatureInfo

Defined in: [packages/client/src/core/wallet-actions.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L136)

Signature payload submitted to a sign-message action.

## Extended by

- [`BorrowSubmitSignatureInfo`](BorrowSubmitSignatureInfo.md)
- [`WithdrawSubmitSignatureInfo`](WithdrawSubmitSignatureInfo.md)

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L142)

Account that produced the signature, when different from the action default.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/core/wallet-actions.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L140)

Chain used to produce the signature.

***

### signature

> **signature**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L138)

Wallet signature over the action message. BTC signatures may be base64 BIP-322 or hex-encoded bytes.
