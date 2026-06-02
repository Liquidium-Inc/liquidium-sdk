[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CalculateLtvRequest

# Interface: CalculateLtvRequest

Defined in: [packages/client/src/modules/quote/types.ts:14](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L14)

Input for calculating LTV from explicit borrow and collateral amounts.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [packages/client/src/modules/quote/types.ts:16](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L16)

Requested borrow amount in borrow asset base units.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/quote/types.ts:18](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L18)

Pool principal text for the borrow side.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/quote/types.ts:20](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L20)

Collateral amount in collateral asset base units.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/quote/types.ts:22](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L22)

Pool principal text for the collateral side.
