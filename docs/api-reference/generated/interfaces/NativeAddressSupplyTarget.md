[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / NativeAddressSupplyTarget

# Interface: NativeAddressSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L180)

External-chain address target for manual or wallet-executed transfers.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:190](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L190)

Deposit or repayment action for the inflow.

***

### address

> **address**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:192](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L192)

External-chain address where funds should be sent.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:186](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L186)

Asset expected by the target.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:188](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L188)

Chain where the target address is valid.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:184](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L184)

Pool principal text receiving the inflow.

***

### type

> **type**: `"nativeAddress"`

Defined in: [packages/client/src/modules/lending/types.ts:182](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L182)

Target discriminator.
