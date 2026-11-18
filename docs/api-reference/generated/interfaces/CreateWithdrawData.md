[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawData

# Interface: CreateWithdrawData

Defined in: packages/client/src/modules/lending/types.ts:142

Prepared withdraw request data embedded in the signable action.

## Extends

- [`CreateWithdrawRequest`](CreateWithdrawRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:132

Amount to withdraw in the pool asset's base units. BTC withdrawals require
at least 5,000 sats, ETH requires at least 0.005 ETH, and USDC and USDT
require at least 1 token.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`amount`](CreateWithdrawRequest.md#amount)

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:134

Chain where withdrawn funds should arrive.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`chain`](CreateWithdrawRequest.md#chain)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:144

Unix expiry timestamp in seconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:126

Pool principal text to withdraw from.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`poolId`](CreateWithdrawRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:124

Liquidium profile principal text.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`profileId`](CreateWithdrawRequest.md#profileid)

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: packages/client/src/modules/lending/types.ts:136

Destination that receives the withdrawn asset.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`receiver`](CreateWithdrawRequest.md#receiver)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:138

Wallet address that signs the withdraw authorization.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`signerWalletAddress`](CreateWithdrawRequest.md#signerwalletaddress)
