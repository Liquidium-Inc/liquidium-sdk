[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / NativeAddressSupplyTarget

# Interface: NativeAddressSupplyTarget

Defined in: [packages/client/src/modules/lending/types.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L142)

External-chain address target for manual or wallet-executed transfers.

## Properties

### action

> **action**: [`SupplyAction`](../type-aliases/SupplyAction.md)

Defined in: [packages/client/src/modules/lending/types.ts:152](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L152)

Deposit or repayment action for the inflow.

***

### address

> **address**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:154](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L154)

External-chain address where funds should be sent.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:148](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L148)

Asset expected by the target.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:150](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L150)

Chain where the target address is valid.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/lending/types.ts:146](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L146)

Pool principal text receiving the inflow.

***

### type

> **type**: `"nativeAddress"`

Defined in: [packages/client/src/modules/lending/types.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/lending/types.ts#L144)

Target discriminator.
