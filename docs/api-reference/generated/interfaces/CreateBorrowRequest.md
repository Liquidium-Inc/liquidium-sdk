[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowRequest

# Interface: CreateBorrowRequest

Defined in: [packages/client/src/modules/lending/types.ts:86](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L86)

Fields to build a borrow request. `amount` is in the borrow pool asset's base units
(e.g. satoshis, token smallest units).

## Extended by

- [`CreateBorrowData`](CreateBorrowData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:92](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L92)

Amount to borrow in the borrow asset's base units.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:94](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L94)

Chain where borrowed funds should arrive.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:90](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L90)

Borrow pool principal text.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:88](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L88)

Liquidium profile principal text.

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: [packages/client/src/modules/lending/types.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L96)

Destination that receives the borrowed asset.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:98](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L98)

Wallet address that signs the borrow authorization.
