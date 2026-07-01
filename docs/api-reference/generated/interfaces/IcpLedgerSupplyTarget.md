[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcpLedgerSupplyTarget

# Interface: IcpLedgerSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:271](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L271)

ICP ledger account target for manual or wallet-executed transfers.

## Properties

### account

> **account**: [`IcpLedgerAccount`](IcpLedgerAccount.md)

Defined in: [packages/client/src/modules/lending/types.ts:283](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L283)

ICP ledger account formats for the same target.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:281](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L281)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `"ICP"`

Defined in: [packages/client/src/modules/lending/types.ts:277](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L277)

ICP asset discriminator.

***

### chain

> **chain**: `"ICP"`

Defined in: [packages/client/src/modules/lending/types.ts:279](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L279)

ICP chain discriminator.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:275](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L275)

Pool principal text receiving the inflow.

***

### type

> **type**: `"icpLedgerAccount"`

Defined in: [packages/client/src/modules/lending/types.ts:273](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L273)

Target discriminator.
