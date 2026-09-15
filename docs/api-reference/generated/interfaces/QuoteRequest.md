[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / QuoteRequest

# Interface: QuoteRequest

Defined in: packages/client/src/modules/quote/types.ts:2

Input for calculating required collateral from a target LTV.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:4

Requested borrow amount in borrow asset base units.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:6

Pool principal text for the borrow side.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:8

Pool principal text for the collateral side.

***

### targetLtvBps

> **targetLtvBps**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:10

Target loan-to-value ratio in basis points.
