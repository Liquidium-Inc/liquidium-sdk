[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ApySample

# Interface: ApySample

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:111](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L111)

Borrow APY sample returned to SDK consumers.

## Properties

### avgRate

> **avgRate**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:117](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L117)

Average borrow rate for the sample, scaled by `rateDecimals`.

***

### date

> **date**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:113](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L113)

Sample date from the SDK API.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:115](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L115)

Decimal scale for `avgRate`.
