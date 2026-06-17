[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateBorrowData

# Interface: CreateBorrowData

Defined in: [packages/client/src/modules/lending/types.ts:146](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L146)

Prepared borrow request data embedded in the signable action.

## Extends

- [`CreateBorrowRequest`](CreateBorrowRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L138)

Amount to borrow in the borrow asset's base units.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`amount`](CreateBorrowRequest.md#amount)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:148](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L148)

Unix expiry timestamp in seconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L136)

Borrow pool principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`poolId`](CreateBorrowRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:134](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L134)

Liquidium profile principal text.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`profileId`](CreateBorrowRequest.md#profileid)

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L140)

External-chain address that receives the borrowed asset. Must match the borrow pool chain.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`receiverAddress`](CreateBorrowRequest.md#receiveraddress)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L142)

Wallet address that signs the borrow authorization.

#### Inherited from

[`CreateBorrowRequest`](CreateBorrowRequest.md).[`signerWalletAddress`](CreateBorrowRequest.md#signerwalletaddress)
