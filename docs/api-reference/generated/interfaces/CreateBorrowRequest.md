[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowRequest

# Interface: CreateBorrowRequest

Defined in: [packages/client/src/modules/lending/types.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L69)

Fields to build a borrow request. `amount` is in the borrow pool asset's base units
(e.g. satoshis, token smallest units).

## Extended by

- [`CreateBorrowData`](CreateBorrowData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L75)

Amount to borrow in the borrow asset's base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:73](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L73)

Borrow pool principal text.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L71)

Liquidium profile principal text.

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L77)

External-chain address that receives the borrowed asset. Must match the borrow pool chain.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:79](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L79)

Wallet address that signs the borrow authorization.
