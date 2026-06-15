[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ApySample

# Interface: ApySample

Defined in: [packages/client/src/modules/history/types.ts:100](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L100)

Borrow APY sample returned to SDK consumers.

## Properties

### avgRate

> **avgRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:106](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L106)

Average borrow rate for the sample, scaled by `rateDecimals`.

***

### date

> **date**: `string`

Defined in: [packages/client/src/modules/history/types.ts:102](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L102)

Sample date from the SDK API.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:104](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L104)

Decimal scale for `avgRate`.
