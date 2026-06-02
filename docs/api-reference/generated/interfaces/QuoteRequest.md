[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / QuoteRequest

# Interface: QuoteRequest

Defined in: [packages/client/src/modules/quote/types.ts:2](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L2)

Input for calculating required collateral from a target LTV.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [packages/client/src/modules/quote/types.ts:4](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L4)

Requested borrow amount in borrow asset base units.

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/quote/types.ts:6](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L6)

Pool principal text for the borrow side.

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/quote/types.ts:8](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L8)

Pool principal text for the collateral side.

***

### targetLtvBps

> **targetLtvBps**: `bigint`

Defined in: [packages/client/src/modules/quote/types.ts:10](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/quote/types.ts#L10)

Target loan-to-value ratio in basis points.
