[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawRequest

# Interface: CreateWithdrawRequest

Defined in: [packages/client/src/modules/lending/types.ts:119](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L119)

Fields to build a withdraw request. `amount` is in the pool asset's base units.

## Extended by

- [`CreateWithdrawData`](CreateWithdrawData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:128](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L128)

Amount to withdraw in the pool asset's base units. BTC withdrawals require
at least 5,000 sats. USDC and USDT withdrawals require at least 1 token.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/lending/types.ts:130](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L130)

Chain where withdrawn funds should arrive.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:123](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L123)

Pool principal text to withdraw from.

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:121](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L121)

Liquidium profile principal text.

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: [packages/client/src/modules/lending/types.ts:132](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L132)

Destination that receives the withdrawn asset.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:134](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L134)

Wallet address that signs the withdraw authorization.
