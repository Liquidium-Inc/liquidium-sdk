[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WithdrawOutflowDetails

# Type Alias: WithdrawOutflowDetails

> **WithdrawOutflowDetails** = [`OutflowDetails`](../interfaces/OutflowDetails.md) & `object`

Defined in: [packages/client/src/modules/lending/types.ts:54](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L54)

Withdraw receipt with an external-chain receiver.

## Type Declaration

### outflowType

> **outflowType**: `"withdraw"`

### receiver

> **receiver**: `object`

#### receiver.account

> **account**: `string`

#### receiver.type

> **type**: `"External"`
