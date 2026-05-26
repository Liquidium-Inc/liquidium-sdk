[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowData

# Interface: CreateBorrowData

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:83](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L83)

Prepared borrow request data embedded in the signable action.

## Extends

- [`CreateBorrowRequest`](CreateBorrowRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L75)

Amount to borrow in the borrow asset's base units.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`amount`](CreateBorrowRequest.md#amount)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:85](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L85)

Expiry timestamp, in protocol nanoseconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L73)

Borrow pool principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`poolId`](CreateBorrowRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L71)

Liquidium profile principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`profileId`](CreateBorrowRequest.md#profileid)

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L77)

External-chain address that receives the borrowed asset.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`receiverAddress`](CreateBorrowRequest.md#receiveraddress)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/lending/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/lending/types.ts#L79)

Wallet address that signs the borrow authorization.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`signerWalletAddress`](CreateBorrowRequest.md#signerwalletaddress)
