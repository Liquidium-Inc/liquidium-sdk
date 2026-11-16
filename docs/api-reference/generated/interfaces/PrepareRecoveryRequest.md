[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PrepareRecoveryRequest

# Interface: PrepareRecoveryRequest

Defined in: packages/client/src/modules/lending/types.ts:171

Recovery authorized by a linked BTC, ETH, or SOL wallet signature.

## Extends

- [`RecoveryRequest`](RecoveryRequest.md)

## Extended by

- [`RecoverWithWalletRequest`](RecoverWithWalletRequest.md)
- [`RecoveryData`](RecoveryData.md)

## Properties

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:165

Delivery chain; use ICP for chain-key assets.

#### Inherited from

[`RecoveryRequest`](RecoveryRequest.md).[`chain`](RecoveryRequest.md#chain)

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:163

Pool principal text. Recovery balances are grouped by pool.

#### Inherited from

[`RecoveryRequest`](RecoveryRequest.md).[`poolId`](RecoveryRequest.md#poolid)

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:161

Liquidium profile principal text.

#### Inherited from

[`RecoveryRequest`](RecoveryRequest.md).[`profileId`](RecoveryRequest.md#profileid)

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: packages/client/src/modules/lending/types.ts:167

Destination that receives recovered funds after fees.

#### Inherited from

[`RecoveryRequest`](RecoveryRequest.md).[`receiver`](RecoveryRequest.md#receiver)

***

### signerWalletAddress

> **signerWalletAddress**: `string`

Defined in: packages/client/src/modules/lending/types.ts:172
