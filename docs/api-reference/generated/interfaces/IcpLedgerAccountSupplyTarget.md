[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcpLedgerAccountSupplyTarget

# Interface: IcpLedgerAccountSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:301](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L301)

ICP ledger account target for manual or wallet-executed transfers.

## Properties

### account

> **account**: [`IcpLedgerAccount`](IcpLedgerAccount.md)

Defined in: [packages/client/src/modules/lending/types.ts:313](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L313)

ICP ledger account formats for the same target.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:311](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L311)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `"ICP"`

Defined in: [packages/client/src/modules/lending/types.ts:307](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L307)

ICP asset discriminator.

***

### chain

> **chain**: `"ICP"`

Defined in: [packages/client/src/modules/lending/types.ts:309](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L309)

ICP chain discriminator.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:305](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L305)

Pool principal text receiving the inflow.

***

### type

> **type**: `"icpLedgerAccount"`

Defined in: [packages/client/src/modules/lending/types.ts:303](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L303)

Target discriminator.
