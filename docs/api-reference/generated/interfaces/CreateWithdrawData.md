[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawData

# Interface: CreateWithdrawData

Defined in: [packages/client/src/modules/lending/types.ts:235](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L235)

Prepared withdraw request data embedded in the signable action.

## Extends

- [`CreateWithdrawRequest`](CreateWithdrawRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:227](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L227)

Amount to withdraw in the pool asset's base units. BTC withdrawals require
at least 5,000 sats. USDC and USDT withdrawals require at least 1 token.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`amount`](CreateWithdrawRequest.md#amount)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:237](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L237)

Unix expiry timestamp in seconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:222](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L222)

Pool principal text to withdraw from.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`poolId`](CreateWithdrawRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:220](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L220)

Liquidium profile principal text.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`profileId`](CreateWithdrawRequest.md#profileid)

***

### receiver

> **receiver**: [`OutflowDestination`](OutflowDestination.md)

Defined in: [packages/client/src/modules/lending/types.ts:229](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L229)

Destination that receives the withdrawn asset.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`receiver`](CreateWithdrawRequest.md#receiver)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:231](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L231)

Wallet address that signs the withdraw authorization.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`signerWalletAddress`](CreateWithdrawRequest.md#signerwalletaddress)
