[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowRequest

# Interface: CreateBorrowRequest

Defined in: [packages/client/src/modules/lending/types.ts:132](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L132)

Fields to build a borrow request. `amount` is in the borrow pool asset's base units
(e.g. satoshis, token smallest units).

## Extended by

- [`CreateBorrowData`](CreateBorrowData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L138)

Amount to borrow in the borrow asset's base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L136)

Borrow pool principal text.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:134](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L134)

Liquidium profile principal text.

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L140)

External-chain address that receives the borrowed asset. Must match the borrow pool chain.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L142)

Wallet address that signs the borrow authorization.
