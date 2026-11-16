[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LtvCalculation

# Interface: LtvCalculation

Defined in: packages/client/src/modules/quote/types.ts:91

LTV calculation result for explicit borrow and collateral amounts.

## Properties

### activationFeeAmount

> **activationFeeAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:95

Activation fee rounded down in borrow asset base units; zero if calculation is skipped.

***

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:93

Requested amount before network fees, in borrow asset base units.

***

### borrowAsset

> **borrowAsset**: `string`

Defined in: packages/client/src/modules/quote/types.ts:113

Borrow asset symbol.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:109

Pool principal text for the borrow side.

***

### borrowUsd

> **borrowUsd**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:101

Opening debt value, including the activation fee, in internal USD units.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:99

Collateral amount in collateral asset base units.

***

### collateralAsset

> **collateralAsset**: `string`

Defined in: packages/client/src/modules/quote/types.ts:115

Collateral asset symbol.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:111

Pool principal text for the collateral side.

***

### collateralUsd

> **collateralUsd**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:103

Collateral value in internal USD units.

***

### ltvBps

> **ltvBps**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:105

Computed LTV in basis points.

***

### maxAllowedLtvBps

> **maxAllowedLtvBps**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:107

Maximum allowed LTV in basis points for the collateral pool.

***

### openingDebtAmount

> **openingDebtAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:97

Requested amount plus activation fee in borrow asset base units; zero if calculation is skipped.

***

### validationErrors

> **validationErrors**: [`QuoteValidationError`](QuoteValidationError.md)[]

Defined in: packages/client/src/modules/quote/types.ts:117

Blocking validation errors. Empty when the calculation is usable.
