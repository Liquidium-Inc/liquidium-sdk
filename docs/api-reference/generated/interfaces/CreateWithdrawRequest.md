[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawRequest

# Interface: CreateWithdrawRequest

Defined in: [packages/client/src/modules/lending/types.ts:102](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L102)

Fields to build a withdraw request. `amount` is in the pool asset's base units.

## Extended by

- [`CreateWithdrawData`](CreateWithdrawData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:108](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L108)

Amount to withdraw in the pool asset's base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:106](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L106)

Pool principal text to withdraw from.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:104](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L104)

Liquidium profile principal text.

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:110](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L110)

External-chain address that receives the withdrawn asset. Must match the pool chain.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:112](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L112)

Wallet address that signs the withdraw authorization.
