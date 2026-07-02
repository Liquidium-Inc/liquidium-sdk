[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowRequest

# Interface: CreateBorrowRequest

Defined in: [packages/client/src/modules/lending/types.ts:187](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L187)

Fields to build a borrow request. `amount` is in the borrow pool asset's base units
(e.g. satoshis, token smallest units).

## Extended by

- [`CreateBorrowData`](CreateBorrowData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:193](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L193)

Amount to borrow in the borrow asset's base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:191](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L191)

Borrow pool principal text.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:189](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L189)

Liquidium profile principal text.

***

### receiver

> **receiver**: [`OutflowDestination`](OutflowDestination.md)

Defined in: [packages/client/src/modules/lending/types.ts:195](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L195)

Destination that receives the borrowed asset.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:197](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L197)

Wallet address that signs the borrow authorization.
