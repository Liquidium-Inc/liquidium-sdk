[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowSubmitSignatureInfo

# Interface: BorrowSubmitSignatureInfo

Defined in: [packages/client/src/modules/lending/types.ts:178](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L178)

Signature payload for submitting a prepared borrow action.

## Extends

- [`SignatureInfo`](SignatureInfo.md)

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L142)

Account that produced the signature, when different from the action default.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`account`](SignatureInfo.md#account)

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/core/wallet-actions.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L140)

Chain used to produce the signature.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`chain`](SignatureInfo.md#chain)

***

### signature

> **signature**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L138)

Wallet signature over the action message. BTC signatures may be base64 BIP-322 or hex-encoded bytes.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`signature`](SignatureInfo.md#signature)
