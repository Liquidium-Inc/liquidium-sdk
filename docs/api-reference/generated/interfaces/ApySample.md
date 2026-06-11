[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ApySample

# Interface: ApySample

Defined in: [packages/client/src/modules/history/types.ts:107](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L107)

Borrow APY sample returned to SDK consumers.

## Properties

### avgRate

> **avgRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:113](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L113)

Average borrow rate for the sample, scaled by `rateDecimals`.

***

### date

> **date**: `string`

Defined in: [packages/client/src/modules/history/types.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L109)

Sample date from the SDK API.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:111](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L111)

Decimal scale for `avgRate`.
