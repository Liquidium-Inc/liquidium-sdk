[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawRequest

# Interface: CreateWithdrawRequest

Defined in: [packages/client/src/modules/lending/types.ts:165](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L165)

Fields to build a withdraw request. `amount` is in the pool asset's base units.

## Extended by

- [`CreateWithdrawData`](CreateWithdrawData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:171](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L171)

Amount to withdraw in the pool asset's base units.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:169](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L169)

Pool principal text to withdraw from.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:167](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L167)

Liquidium profile principal text.

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:173](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L173)

External-chain address that receives the withdrawn asset. Must match the pool chain.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:175](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L175)

Wallet address that signs the withdraw authorization.
