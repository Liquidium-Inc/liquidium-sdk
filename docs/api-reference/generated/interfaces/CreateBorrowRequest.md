[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowRequest

# Interface: CreateBorrowRequest

Defined in: [packages/client/src/modules/lending/types.ts:107](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L107)

Fields to build a borrow request. `amount` is in the borrow pool asset's base units
(e.g. satoshis, token smallest units).

## Extended by

- [`CreateBorrowData`](CreateBorrowData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:113](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L113)

Amount to borrow in the borrow asset's base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:111](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L111)

Borrow pool principal text.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L109)

Liquidium profile principal text.

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:115](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L115)

External-chain address that receives the borrowed asset. Must match the borrow pool chain.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:117](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L117)

Wallet address that signs the borrow authorization.
