[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / QuoteRequest

# Interface: QuoteRequest

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:2](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L2)

Input for calculating required collateral from a target LTV.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:4](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L4)

Requested borrow amount in borrow asset base units.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:6](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L6)

Pool principal text for the borrow side.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:8](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L8)

Pool principal text for the collateral side.

***

### targetLtvBps

> **targetLtvBps**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:10](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L10)

Target loan-to-value ratio in basis points.
