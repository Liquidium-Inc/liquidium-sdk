[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignatureInfo

# Interface: SignatureInfo

Defined in: [packages/client/src/core/wallet-actions.ts:101](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L101)

Signature payload submitted to a sign-message action.

## Extended by

- [`BorrowSubmitSignatureInfo`](BorrowSubmitSignatureInfo.md)
- [`WithdrawSubmitSignatureInfo`](WithdrawSubmitSignatureInfo.md)

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:107](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L107)

Account that produced the signature, when different from the action default.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/core/wallet-actions.ts:105](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L105)

Chain used to produce the signature.

***

### signature

> **signature**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:103](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L103)

Wallet signature over the action message. BTC signatures may be base64 BIP-322 or hex-encoded bytes.
