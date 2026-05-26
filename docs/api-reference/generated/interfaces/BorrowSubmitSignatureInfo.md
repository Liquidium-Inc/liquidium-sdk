[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowSubmitSignatureInfo

# Interface: BorrowSubmitSignatureInfo

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L60)

Signature payload for submitting a prepared borrow action.

## Extends

- [`SignatureInfo`](SignatureInfo.md)

## Properties

### account?

> `optional` **account?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:127](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L127)

Account that produced the signature, when different from the action default.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`account`](SignatureInfo.md#account)

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:125](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L125)

Chain used to produce the signature.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`chain`](SignatureInfo.md#chain)

***

### signature

> **signature**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/core/wallet-actions.ts:123](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/core/wallet-actions.ts#L123)

Wallet signature over the action message.

#### Inherited from

[`SignatureInfo`](SignatureInfo.md).[`signature`](SignatureInfo.md#signature)
