[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BorrowOutflowDetails

# Type Alias: BorrowOutflowDetails

> **BorrowOutflowDetails** = [`OutflowDetails`](../interfaces/OutflowDetails.md) & `object`

Defined in: [packages/client/src/modules/lending/types.ts:48](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L48)

Borrow receipt with an external-chain receiver.

## Type Declaration

### outflowType

> **outflowType**: `"borrow"`

### receiver

> **receiver**: `object`

#### receiver.account

> **account**: `string`

#### receiver.type

> **type**: `"External"`
