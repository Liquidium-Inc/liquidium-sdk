[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccountSupplyTarget

# Interface: IcrcAccountSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:277](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L277)

ICRC account target for ck-asset or contract-interaction inflows.

## Properties

### account

> **account**: [`IcrcAccount`](IcrcAccount.md)

Defined in: [packages/client/src/modules/lending/types.ts:289](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L289)

ICRC account receiving the transfer.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:287](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L287)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:283](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L283)

Asset expected by the target.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:285](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L285)

Chain associated with the inflow.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:281](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L281)

Pool principal text receiving the inflow.

***

### type

> **type**: `"icrcAccount"`

Defined in: [packages/client/src/modules/lending/types.ts:279](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L279)

Target discriminator.
