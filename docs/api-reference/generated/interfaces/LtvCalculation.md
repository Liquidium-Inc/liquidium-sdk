[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LtvCalculation

# Interface: LtvCalculation

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:87](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L87)

LTV calculation result for explicit borrow and collateral amounts.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:89](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L89)

Requested borrow amount in borrow asset base units.

***

### borrowAsset

> **borrowAsset**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:105](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L105)

Borrow asset symbol.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:101](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L101)

Pool principal text for the borrow side.

***

### borrowUsd

> **borrowUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:93](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L93)

Borrow value in internal USD units.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L91)

Collateral amount in collateral asset base units.

***

### collateralAsset

> **collateralAsset**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:107](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L107)

Collateral asset symbol.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:103](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L103)

Pool principal text for the collateral side.

***

### collateralUsd

> **collateralUsd**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:95](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L95)

Collateral value in internal USD units.

***

### ltvBps

> **ltvBps**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:97](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L97)

Computed LTV in basis points.

***

### maxAllowedLtvBps

> **maxAllowedLtvBps**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:99](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L99)

Maximum allowed LTV in basis points for the collateral pool.

***

### validationErrors

> **validationErrors**: [`QuoteValidationError`](QuoteValidationError.md)[]

Defined in: [external/liquidium-sdk/packages/client/src/modules/quote/types.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/quote/types.ts#L109)

Blocking validation errors. Empty when the calculation is usable.
