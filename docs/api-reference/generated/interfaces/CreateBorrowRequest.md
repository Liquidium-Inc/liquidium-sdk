[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowRequest

# Interface: CreateBorrowRequest

Defined in: packages/client/src/modules/lending/types.ts:89

Fields to build a borrow request. `amount` is in the borrow pool asset's base units
(e.g. satoshis, token smallest units).

## Extended by

- [`CreateBorrowData`](CreateBorrowData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:95

Amount to borrow in the borrow asset's base units.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:97

Chain where borrowed funds should arrive.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:93

Borrow pool principal text.

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:91

Liquidium profile principal text.

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: packages/client/src/modules/lending/types.ts:99

Destination that receives the borrowed asset.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:101

Wallet address that signs the borrow authorization.
