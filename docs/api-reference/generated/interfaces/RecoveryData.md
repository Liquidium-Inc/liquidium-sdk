[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / RecoveryData

# Interface: RecoveryData

Defined in: packages/client/src/modules/lending/types.ts:176

Recovery request captured before message signing.

## Extends

- [`PrepareRecoveryRequest`](PrepareRecoveryRequest.md)

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:178

Recovery balance in pool asset base units, before withdrawal fees.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:165

Delivery chain; use ICP for chain-key assets.

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`chain`](PrepareRecoveryRequest.md#chain)

***

### expiryTimestamp

> **expiryTimestamp**: `bigint`

Defined in: packages/client/src/modules/lending/types.ts:180

Unix expiry timestamp in seconds.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:163

Pool principal text. Recovery balances are grouped by pool.

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`poolId`](PrepareRecoveryRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:161

Liquidium profile principal text.

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`profileId`](PrepareRecoveryRequest.md#profileid)

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: packages/client/src/modules/lending/types.ts:167

Destination that receives recovered funds after fees.

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`receiver`](PrepareRecoveryRequest.md#receiver)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:172

#### Inherited from

[`PrepareRecoveryRequest`](PrepareRecoveryRequest.md).[`signerWalletAddress`](PrepareRecoveryRequest.md#signerwalletaddress)
