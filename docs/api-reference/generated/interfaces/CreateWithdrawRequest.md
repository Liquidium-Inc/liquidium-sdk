[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawRequest

# Interface: CreateWithdrawRequest

Defined in: packages/client/src/modules/lending/types.ts:122

Fields to build a withdraw request. `amount` is in the pool asset's base units.

## Extended by

- [`CreateWithdrawData`](CreateWithdrawData.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:132

Amount to withdraw in the pool asset's base units. BTC withdrawals require
at least 5,000 sats, ETH requires at least 0.005 ETH, and USDC and USDT
require at least 1 token.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:134

Chain where withdrawn funds should arrive.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:126

Pool principal text to withdraw from.

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:124

Liquidium profile principal text.

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: packages/client/src/modules/lending/types.ts:136

Destination that receives the withdrawn asset.

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:138

Wallet address that signs the withdraw authorization.
