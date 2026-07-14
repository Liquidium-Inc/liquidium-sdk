[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowData

# Interface: CreateBorrowData

Defined in: [packages/client/src/modules/lending/types.ts:102](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L102)

Prepared borrow request data embedded in the signable action.

## Extends

- [`CreateBorrowRequest`](CreateBorrowRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:92](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L92)

Amount to borrow in the borrow asset's base units.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`amount`](CreateBorrowRequest.md#amount)

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:94](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L94)

Chain where borrowed funds should arrive.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`chain`](CreateBorrowRequest.md#chain)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:104](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L104)

Unix expiry timestamp in seconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:90](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L90)

Borrow pool principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`poolId`](CreateBorrowRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:88](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L88)

Liquidium profile principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`profileId`](CreateBorrowRequest.md#profileid)

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: [packages/client/src/modules/lending/types.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L96)

Destination that receives the borrowed asset.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`receiver`](CreateBorrowRequest.md#receiver)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:98](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L98)

Wallet address that signs the borrow authorization.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`signerWalletAddress`](CreateBorrowRequest.md#signerwalletaddress)
