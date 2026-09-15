[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / CalculateLtvRequest

# Interface: CalculateLtvRequest

Defined in: packages/client/src/modules/quote/types.ts:14

Input for calculating LTV from explicit borrow and collateral amounts.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:16

Requested borrow amount in borrow asset base units.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:18

Pool principal text for the borrow side.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: packages/client/src/modules/quote/types.ts:20

Collateral amount in collateral asset base units.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: packages/client/src/modules/quote/types.ts:22

Pool principal text for the collateral side.
