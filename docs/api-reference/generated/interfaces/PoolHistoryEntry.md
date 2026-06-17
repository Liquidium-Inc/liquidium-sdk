[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PoolHistoryEntry

# Interface: PoolHistoryEntry

Defined in: [packages/client/src/modules/history/types.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L136)

Pool rate and utilization history entry returned to SDK consumers.

## Properties

### avgBorrowRate

> **avgBorrowRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L142)

Average borrow rate for the sample, scaled by `rateDecimals`.

***

### avgLendRate

> **avgLendRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L144)

Average lend rate for the sample, scaled by `rateDecimals`.

***

### avgUtilizationRate

> **avgUtilizationRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:146](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L146)

Average utilization rate for the sample, scaled by `rateDecimals`.

***

### date

> **date**: `string`

Defined in: [packages/client/src/modules/history/types.ts:138](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L138)

Sample date from the SDK API.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L140)

Decimal scale for rate fields.
