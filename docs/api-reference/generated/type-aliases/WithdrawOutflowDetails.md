[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / WithdrawOutflowDetails

# Type Alias: WithdrawOutflowDetails

> **WithdrawOutflowDetails** = [`OutflowDetails`](../interfaces/OutflowDetails.md) & `object`

Defined in: [packages/client/src/modules/lending/types.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L91)

Withdraw receipt with an external-chain receiver.

## Type Declaration

### outflowType

> **outflowType**: `"withdraw"`

### receiver

> **receiver**: [`ExternalOutflowReceiver`](../interfaces/ExternalOutflowReceiver.md)

### status

> **status**: [`LiquidiumStatus`](../interfaces/LiquidiumStatus.md)

Shared lifecycle status for the withdraw outflow receipt.
