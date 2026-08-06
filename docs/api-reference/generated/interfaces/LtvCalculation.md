[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LtvCalculation

# Interface: LtvCalculation

Defined in: packages/client/src/modules/quote/types.ts:87

LTV calculation result for explicit borrow and collateral amounts.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:89

Requested borrow amount in borrow asset base units.

***

### borrowAsset

> **borrowAsset**: `string`

Defined in: packages/client/src/modules/quote/types.ts:105

Borrow asset symbol.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:101

Pool principal text for the borrow side.

***

### borrowUsd

> **borrowUsd**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:93

Borrow value in internal USD units.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:91

Collateral amount in collateral asset base units.

***

### collateralAsset

> **collateralAsset**: `string`

Defined in: packages/client/src/modules/quote/types.ts:107

Collateral asset symbol.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:103

Pool principal text for the collateral side.

***

### collateralUsd

> **collateralUsd**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:95

Collateral value in internal USD units.

***

### ltvBps

> **ltvBps**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:97

Computed LTV in basis points.

***

### maxAllowedLtvBps

> **maxAllowedLtvBps**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:99

Maximum allowed LTV in basis points for the collateral pool.

***

### validationErrors

> **validationErrors**: [`QuoteValidationError`](QuoteValidationError.md)[]

Defined in: packages/client/src/modules/quote/types.ts:109

Blocking validation errors. Empty when the calculation is usable.
