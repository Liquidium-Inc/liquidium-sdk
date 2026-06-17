[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowData

# Interface: CreateBorrowData

Defined in: [packages/client/src/modules/lending/types.ts:121](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L121)

Prepared borrow request data embedded in the signable action.

## Extends

- [`CreateBorrowRequest`](CreateBorrowRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:113](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L113)

Amount to borrow in the borrow asset's base units.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`amount`](CreateBorrowRequest.md#amount)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:123](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L123)

Unix expiry timestamp in seconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:111](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L111)

Borrow pool principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`poolId`](CreateBorrowRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L109)

Liquidium profile principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`profileId`](CreateBorrowRequest.md#profileid)

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:115](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L115)

External-chain address that receives the borrowed asset. Must match the borrow pool chain.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`receiverAddress`](CreateBorrowRequest.md#receiveraddress)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:117](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L117)

Wallet address that signs the borrow authorization.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`signerWalletAddress`](CreateBorrowRequest.md#signerwalletaddress)
