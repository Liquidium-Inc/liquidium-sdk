[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowOutflowDetails

# Type Alias: BorrowOutflowDetails

> **BorrowOutflowDetails** = [`OutflowDetails`](../interfaces/OutflowDetails.md) & `object`

Defined in: [packages/client/src/modules/lending/types.ts:82](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L82)

Borrow receipt with an external-chain receiver.

## Type Declaration

### outflowType

> **outflowType**: `"borrow"`

### receiver

> **receiver**: [`ExternalOutflowReceiver`](../interfaces/ExternalOutflowReceiver.md)

### status

> **status**: [`LiquidiumStatus`](../interfaces/LiquidiumStatus.md)

Shared lifecycle status for the borrow outflow receipt.
