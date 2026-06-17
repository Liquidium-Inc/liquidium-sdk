[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccountSupplyTarget

# Interface: IcrcAccountSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:217](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L217)

ICRC account target for ck-asset or contract-interaction inflows.

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:233](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L233)

Text-encoded ICRC account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:227](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L227)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:223](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L223)

Asset expected by the target.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:225](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L225)

Chain associated with the inflow.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:229](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L229)

ICRC account owner principal text.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:221](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L221)

Pool principal text receiving the inflow.

***

### subaccount

> **subaccount**: `Uint8Array`

Defined in: [packages/client/src/modules/lending/types.ts:231](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L231)

ICRC subaccount bytes.

***

### type

> **type**: `"icrcAccount"`

Defined in: [packages/client/src/modules/lending/types.ts:219](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L219)

Target discriminator.
