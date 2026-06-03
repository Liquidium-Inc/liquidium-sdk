[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccountSupplyTarget

# Interface: IcrcAccountSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:158](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L158)

ICRC account target for ck-asset or contract-interaction inflows.

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:174](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L174)

Text-encoded ICRC account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:168](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L168)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:164](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L164)

Asset expected by the target.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:166](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L166)

Chain associated with the inflow.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:170](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L170)

ICRC account owner principal text.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:162](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L162)

Pool principal text receiving the inflow.

***

### subaccount

> **subaccount**: `Uint8Array`

Defined in: [packages/client/src/modules/lending/types.ts:172](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L172)

ICRC subaccount bytes.

***

### type

> **type**: `"icrcAccount"`

Defined in: [packages/client/src/modules/lending/types.ts:160](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L160)

Target discriminator.
