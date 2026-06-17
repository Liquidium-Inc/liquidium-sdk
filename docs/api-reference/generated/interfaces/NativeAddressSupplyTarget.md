[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / NativeAddressSupplyTarget

# Interface: NativeAddressSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:201](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L201)

External-chain address target for manual or wallet-executed transfers.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:211](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L211)

Deposit or repayment action for the inflow.

***

### address

> **address**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:213](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L213)

External-chain address where funds should be sent.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:207](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L207)

Asset expected by the target.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:209](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L209)

Chain where the target address is valid.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:205](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L205)

Pool principal text receiving the inflow.

***

### type

> **type**: `"nativeAddress"`

Defined in: [packages/client/src/modules/lending/types.ts:203](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L203)

Target discriminator.
