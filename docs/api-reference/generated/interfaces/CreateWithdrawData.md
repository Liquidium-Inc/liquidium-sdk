[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawData

# Interface: CreateWithdrawData

Defined in: [packages/client/src/modules/lending/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L180)

Prepared withdraw request data embedded in the signable action.

## Extends

- [`CreateWithdrawRequest`](CreateWithdrawRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:172](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L172)

Amount to withdraw in the pool asset's base units. BTC withdrawals require
at least 5,000 sats. USDC and USDT withdrawals require at least 1 token.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`amount`](CreateWithdrawRequest.md#amount)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:182](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L182)

Unix expiry timestamp in seconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:167](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L167)

Pool principal text to withdraw from.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`poolId`](CreateWithdrawRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:165](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L165)

Liquidium profile principal text.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`profileId`](CreateWithdrawRequest.md#profileid)

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:174](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L174)

External-chain address that receives the withdrawn asset. Must match the pool chain.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`receiverAddress`](CreateWithdrawRequest.md#receiveraddress)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:176](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L176)

Wallet address that signs the withdraw authorization.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`signerWalletAddress`](CreateWithdrawRequest.md#signerwalletaddress)
