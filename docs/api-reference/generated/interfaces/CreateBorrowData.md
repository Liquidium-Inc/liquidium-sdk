[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowData

# Interface: CreateBorrowData

Defined in: [packages/client/src/modules/lending/types.ts:201](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L201)

Prepared borrow request data embedded in the signable action.

## Extends

- [`CreateBorrowRequest`](CreateBorrowRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:193](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L193)

Amount to borrow in the borrow asset's base units.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`amount`](CreateBorrowRequest.md#amount)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:203](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L203)

Unix expiry timestamp in seconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:191](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L191)

Borrow pool principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`poolId`](CreateBorrowRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:189](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L189)

Liquidium profile principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`profileId`](CreateBorrowRequest.md#profileid)

***

### receiver

> **receiver**: [`OutflowDestination`](OutflowDestination.md)

Defined in: [packages/client/src/modules/lending/types.ts:195](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L195)

Destination that receives the borrowed asset.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`receiver`](CreateBorrowRequest.md#receiver)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:197](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L197)

Wallet address that signs the borrow authorization.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`signerWalletAddress`](CreateBorrowRequest.md#signerwalletaddress)
