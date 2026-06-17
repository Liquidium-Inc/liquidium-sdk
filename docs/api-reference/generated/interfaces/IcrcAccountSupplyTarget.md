[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccountSupplyTarget

# Interface: IcrcAccountSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:221](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L221)

ICRC account target for ck-asset or contract-interaction inflows.

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:237](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L237)

Text-encoded ICRC account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:231](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L231)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:227](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L227)

Asset expected by the target.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:229](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L229)

Chain associated with the inflow.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:233](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L233)

ICRC account owner principal text.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:225](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L225)

Pool principal text receiving the inflow.

***

### subaccount

> **subaccount**: `Uint8Array`

Defined in: [packages/client/src/modules/lending/types.ts:235](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L235)

ICRC subaccount bytes.

***

### type

> **type**: `"icrcAccount"`

Defined in: [packages/client/src/modules/lending/types.ts:223](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L223)

Target discriminator.
