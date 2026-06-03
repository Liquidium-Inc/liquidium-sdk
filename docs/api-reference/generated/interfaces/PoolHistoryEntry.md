[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PoolHistoryEntry

# Interface: PoolHistoryEntry

Defined in: [packages/client/src/modules/history/types.ts:153](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L153)

Pool rate and utilization history entry returned to SDK consumers.

## Properties

### avgBorrowRate

> **avgBorrowRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:159](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L159)

Average borrow rate for the sample, scaled by `rateDecimals`.

***

### avgLendRate

> **avgLendRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:161](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L161)

Average lend rate for the sample, scaled by `rateDecimals`.

***

### avgUtilizationRate

> **avgUtilizationRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:163](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L163)

Average utilization rate for the sample, scaled by `rateDecimals`.

***

### date

> **date**: `string`

Defined in: [packages/client/src/modules/history/types.ts:155](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L155)

Sample date from the SDK API.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:157](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L157)

Decimal scale for rate fields.
