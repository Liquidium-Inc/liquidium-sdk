[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / Pool

# Interface: Pool

Defined in: [packages/client/src/modules/market/types.ts:4](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L4)

Current protocol metadata and rate state for a lending pool.

## Properties

### asset

> **asset**: [`Asset`](../type-aliases/Asset.md)

Defined in: [packages/client/src/modules/market/types.ts:8](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L8)

Asset supplied to and borrowed from the pool.

***

### availableLiquidity

> **availableLiquidity**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:20](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L20)

Currently available liquidity in base units.

***

### baseRate

> **baseRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L44)

Base borrow rate, scaled by `rateDecimals`.

***

### borrowCap?

> `optional` **borrowCap?**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:24](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L24)

Optional borrow cap in base units.

***

### borrowIndex

> **borrowIndex**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:54](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L54)

Current borrow index.

***

### borrowingRate

> **borrowingRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L40)

Current borrow APR, scaled by `rateDecimals`.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/market/types.ts:10](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L10)

Chain associated with the pool asset.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:12](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L12)

Number of base-unit decimals for pool amounts.

***

### frozen

> **frozen**: `boolean`

Defined in: [packages/client/src/modules/market/types.ts:14](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L14)

Whether new pool activity is currently frozen.

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/market/types.ts:6](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L6)

Pool canister principal text.

***

### lastUpdated?

> `optional` **lastUpdated?**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L60)

Unix timestamp in seconds of the last pool update when available.

***

### lendingIndex

> **lendingIndex**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:52](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L52)

Current lending index.

***

### lendingRate

> **lendingRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L38)

Current supply APR, scaled by `rateDecimals`.

***

### liquidationBonus

> **liquidationBonus**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:30](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L30)

Liquidation bonus, scaled by `rateDecimals`.

***

### liquidationThreshold

> **liquidationThreshold**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:28](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L28)

Liquidation threshold, scaled by `rateDecimals`.

***

### maxLtv

> **maxLtv**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:26](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L26)

Maximum loan-to-value ratio, scaled by `rateDecimals`.

***

### optimalUtilizationRate

> **optimalUtilizationRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:46](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L46)

Optimal utilization point, scaled by `rateDecimals`.

***

### protocolLiquidationFee

> **protocolLiquidationFee**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L32)

Protocol liquidation fee, scaled by `rateDecimals`.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L36)

Decimal scale used by rate and risk-ratio fields.

***

### rateSlopeAfter

> **rateSlopeAfter**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:50](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L50)

Rate slope after optimal utilization, scaled by `rateDecimals`.

***

### rateSlopeBefore

> **rateSlopeBefore**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:48](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L48)

Rate slope before optimal utilization, scaled by `rateDecimals`.

***

### reserveFactor

> **reserveFactor**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L34)

Reserve factor, scaled by `rateDecimals`.

***

### sameAssetBorrowing

> **sameAssetBorrowing**: `boolean`

Defined in: [packages/client/src/modules/market/types.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L56)

Whether borrowing the same asset as collateral is allowed.

***

### sameAssetBorrowingDustThreshold

> **sameAssetBorrowingDustThreshold**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:58](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L58)

Same-asset collateral below this base-unit amount is treated as dust.

***

### supplyCap?

> `optional` **supplyCap?**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:22](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L22)

Optional supply cap in base units.

***

### totalDebt

> **totalDebt**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:18](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L18)

Current borrowed amount in base units after applying the borrow index.

***

### totalSupply

> **totalSupply**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:16](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L16)

Current supplied amount in base units after applying the lending index.

***

### utilizationRate

> **utilizationRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L42)

Current pool utilization, scaled by `rateDecimals`.
