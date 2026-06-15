[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PoolHistoryEntry

# Interface: PoolHistoryEntry

Defined in: [packages/client/src/modules/history/types.ts:142](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L142)

Pool rate and utilization history entry returned to SDK consumers.

## Properties

### avgBorrowRate

> **avgBorrowRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:148](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L148)

Average borrow rate for the sample, scaled by `rateDecimals`.

***

### avgLendRate

> **avgLendRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:150](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L150)

Average lend rate for the sample, scaled by `rateDecimals`.

***

### avgUtilizationRate

> **avgUtilizationRate**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:152](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L152)

Average utilization rate for the sample, scaled by `rateDecimals`.

***

### date

> **date**: `string`

Defined in: [packages/client/src/modules/history/types.ts:144](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L144)

Sample date from the SDK API.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/history/types.ts:146](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L146)

Decimal scale for rate fields.
