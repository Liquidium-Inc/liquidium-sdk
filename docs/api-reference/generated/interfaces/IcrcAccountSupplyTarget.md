[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / IcrcAccountSupplyTarget

# Interface: IcrcAccountSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:222](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L222)

ICRC account target for ck-asset or contract-interaction inflows.

## Properties

### account

> **account**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:238](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L238)

Text-encoded ICRC account.

***

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:232](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L232)

Deposit or repayment action for the inflow.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:228](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L228)

Asset expected by the target.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:230](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L230)

Chain associated with the inflow.

***

### owner

> **owner**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:234](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L234)

ICRC account owner principal text.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:226](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L226)

Pool principal text receiving the inflow.

***

### subaccount

> **subaccount**: `Uint8Array`

Defined in: [packages/client/src/modules/lending/types.ts:236](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L236)

ICRC subaccount bytes.

***

### type

> **type**: `"icrcAccount"`

Defined in: [packages/client/src/modules/lending/types.ts:224](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L224)

Target discriminator.
