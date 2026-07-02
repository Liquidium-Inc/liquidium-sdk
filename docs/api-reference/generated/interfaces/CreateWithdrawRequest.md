[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawRequest

# Interface: CreateWithdrawRequest

Defined in: [packages/client/src/modules/lending/types.ts:218](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L218)

Fields to build a withdraw request. `amount` is in the pool asset's base units.

## Extended by

- [`CreateWithdrawData`](CreateWithdrawData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:227](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L227)

Amount to withdraw in the pool asset's base units. BTC withdrawals require
at least 5,000 sats. USDC and USDT withdrawals require at least 1 token.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:222](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L222)

Pool principal text to withdraw from.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:220](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L220)

Liquidium profile principal text.

***

### receiver

> **receiver**: [`OutflowDestination`](OutflowDestination.md)

Defined in: [packages/client/src/modules/lending/types.ts:229](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L229)

Destination that receives the withdrawn asset.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:231](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L231)

Wallet address that signs the withdraw authorization.
