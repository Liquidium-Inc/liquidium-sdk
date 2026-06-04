[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CreateWithdrawData

# Interface: CreateWithdrawData

Defined in: [packages/client/src/modules/lending/types.ts:150](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L150)

Prepared withdraw request data embedded in the signable action.

## Extends

- [`CreateWithdrawRequest`](CreateWithdrawRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L142)

Amount to withdraw in the pool asset's base units.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`amount`](CreateWithdrawRequest.md#amount)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: [packages/client/src/modules/lending/types.ts:152](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L152)

Expiry timestamp, in protocol nanoseconds, included in the signed message.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L140)

Pool principal text to withdraw from.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`poolId`](CreateWithdrawRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L138)

Liquidium profile principal text.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`profileId`](CreateWithdrawRequest.md#profileid)

***

### receiverAddress

> **receiverAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L144)

External-chain address that receives the withdrawn asset. Must match the pool chain.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`receiverAddress`](CreateWithdrawRequest.md#receiveraddress)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:146](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L146)

Wallet address that signs the withdraw authorization.

#### Inherited from

[`CreateWithdrawRequest`](CreateWithdrawRequest.md).[`signerWalletAddress`](CreateWithdrawRequest.md#signerwalletaddress)
