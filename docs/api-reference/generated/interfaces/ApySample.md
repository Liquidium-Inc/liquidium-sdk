[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ApySample

# Interface: ApySample

Defined in: [packages/client/src/modules/history/types.ts:94](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L94)

Borrow APY sample returned to SDK consumers.

## Properties

### avgRate

> **avgRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:100](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L100)

Average borrow rate for the sample, scaled by `rateDecimals`.

***

### date

> **date**: `string`

Defined in: [packages/client/src/modules/history/types.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L96)

Sample date from the SDK API.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:98](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L98)

Decimal scale for `avgRate`.
