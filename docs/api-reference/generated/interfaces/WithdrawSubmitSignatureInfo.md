[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WithdrawSubmitSignatureInfo

# Interface: WithdrawSubmitSignatureInfo

Defined in: [packages/client/src/modules/lending/types.ts:126](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L126)

Signature payload for submitting a prepared withdraw action.

## Extends

- [`SignatureInfo`](SignatureInfo.md)

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:107](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L107)

Account that produced the signature, when different from the action default.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`account`](SignatureInfo.md#account)

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/core/wallet-actions.ts:105](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L105)

Chain used to produce the signature.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`chain`](SignatureInfo.md#chain)

***

### signature

> **signature**: `string`

Defined in: [packages/client/src/core/wallet-actions.ts:103](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/core/wallet-actions.ts#L103)

Wallet signature over the action message. BTC signatures may be base64 BIP-322 or hex-encoded bytes.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`signature`](SignatureInfo.md#signature)
