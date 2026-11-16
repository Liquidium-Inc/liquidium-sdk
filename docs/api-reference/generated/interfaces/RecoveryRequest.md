[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / RecoveryRequest

# Interface: RecoveryRequest

Defined in: packages/client/src/modules/lending/types.ts:159

Destination for withdrawing a profile's full, currently available recovery balance.

## Extended by

- [`PrepareRecoveryRequest`](PrepareRecoveryRequest.md)
- [`RecoverWithIcpRequest`](RecoverWithIcpRequest.md)

## Properties

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: packages/client/src/modules/lending/types.ts:165

Delivery chain; use ICP for chain-key assets.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:163

Pool principal text. Recovery balances are grouped by pool.

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/lending/types.ts:161

Liquidium profile principal text.

***

### receiver

> **receiver**: [`LiquidiumAccountInput`](../type-aliases/LiquidiumAccountInput.md)

Defined in: packages/client/src/modules/lending/types.ts:167

Destination that receives recovered funds after fees.
