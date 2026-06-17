[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PoolConfigHistoryEntry

# Interface: PoolConfigHistoryEntry

Defined in: [packages/client/src/modules/history/types.ts:166](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L166)

Pool configuration snapshot returned to SDK consumers.

## Properties

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/history/types.ts:169](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L169)

***

### baseRate

> **baseRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:181](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L181)

***

### borrowCap?

> `optional` **borrowCap?**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:175](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L175)

***

### borrowIndex

> **borrowIndex**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:186](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L186)

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/history/types.ts:170](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L170)

***

### frozen

> **frozen**: `boolean`

Defined in: [packages/client/src/modules/history/types.ts:188](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L188)

***

### lendingIndex

> **lendingIndex**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:185](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L185)

***

### liquidationBonus

> **liquidationBonus**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:178](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L178)

***

### liquidationThreshold

> **liquidationThreshold**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:177](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L177)

***

### maxLtv

> **maxLtv**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:176](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L176)

***

### optimalUtilizationRate

> **optimalUtilizationRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:182](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L182)

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/history/types.ts:168](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L168)

***

### protocolLiquidationFee

> **protocolLiquidationFee**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:179](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L179)

***

### rateSlopeAfter

> **rateSlopeAfter**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:184](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L184)

***

### rateSlopeBefore

> **rateSlopeBefore**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:183](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L183)

***

### reserveFactor

> **reserveFactor**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L180)

***

### sameAssetBorrowing

> **sameAssetBorrowing**: `boolean`

Defined in: [packages/client/src/modules/history/types.ts:187](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L187)

***

### supplyCap?

> `optional` **supplyCap?**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:174](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L174)

***

### timestamp

> **timestamp**: `string`

Defined in: [packages/client/src/modules/history/types.ts:171](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L171)

***

### totalDebt

> **totalDebt**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:173](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L173)

***

### totalSupply

> **totalSupply**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:172](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L172)

***

### type

> **type**: `"configuration_change"`

Defined in: [packages/client/src/modules/history/types.ts:167](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L167)
