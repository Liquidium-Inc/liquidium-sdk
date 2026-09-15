[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / QuoteResult

# Interface: QuoteResult

Defined in: packages/client/src/modules/quote/types.ts:59

Quote result for a requested borrow amount and target LTV.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:61

Requested borrow amount in borrow asset base units.

***

### borrowAsset

> **borrowAsset**: `string`

Defined in: packages/client/src/modules/quote/types.ts:77

Borrow asset symbol.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:73

Pool principal text for the borrow side.

***

### borrowUsd

> **borrowUsd**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:63

Borrow value in internal USD units.

***

### collateralAsset

> **collateralAsset**: `string`

Defined in: packages/client/src/modules/quote/types.ts:79

Collateral asset symbol.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:75

Pool principal text for the collateral side.

***

### maxAllowedLtvBps

> **maxAllowedLtvBps**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:69

Maximum allowed LTV in basis points for the collateral pool.

***

### requiredCollateralAmount

> **requiredCollateralAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:65

Required collateral amount in collateral asset base units.

***

### requiredCollateralUsd

> **requiredCollateralUsd**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:67

Required collateral value in internal USD units.

***

### targetLtvBps

> **targetLtvBps**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:71

Requested target LTV in basis points.

***

### validationErrors

> **validationErrors**: [`QuoteValidationError`](QuoteValidationError.md)[]

Defined in: packages/client/src/modules/quote/types.ts:81

Blocking validation errors. Empty when the quote is usable.

***

### warnings

> **warnings**: [`QuoteWarning`](QuoteWarning.md)[]

Defined in: packages/client/src/modules/quote/types.ts:83

Non-blocking quote warnings.
