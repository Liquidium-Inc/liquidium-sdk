[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SignatureInfo

# Interface: SignatureInfo

Defined in: [packages/client/src/core/wallet-actions.ts:121](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L121)

Signature payload submitted to a sign-message action.

## Extended by

- [`BorrowSubmitSignatureInfo`](BorrowSubmitSignatureInfo.md)
- [`WithdrawSubmitSignatureInfo`](WithdrawSubmitSignatureInfo.md)

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:127](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L127)

Account that produced the signature, when different from the action default.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/core/wallet-actions.ts:125](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L125)

Chain used to produce the signature.

***

### signature

> **signature**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:123](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L123)

Wallet signature over the action message.
