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

Defined in: [packages/client/src/modules/market/types.ts:22](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L22)

Currently available liquidity in base units.

***

### baseRate

> **baseRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:50](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L50)

Base borrow rate, scaled by `rateDecimals`.

***

### borrowCap?

> `optional` **borrowCap?**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:26](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L26)

Optional borrow cap in base units.

***

### borrowIndex

> **borrowIndex**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L60)

Current borrow index.

***

### borrowingRate

> **borrowingRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L44)

Current borrow APR, scaled by `rateDecimals`.

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md)

Defined in: [packages/client/src/modules/market/types.ts:12](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L12)

Chain associated with the pool asset.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:14](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L14)

Number of base-unit decimals for pool amounts.

***

### displayName

> **displayName**: `string`

Defined in: [packages/client/src/modules/market/types.ts:10](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L10)

Human-readable name of the pool asset.

***

### estimatedBorrowingApy

> **estimatedBorrowingApy**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:46](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L46)

Estimated borrow APY, scaled by `rateDecimals`.

***

### estimatedLendingApy

> **estimatedLendingApy**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L42)

Estimated supply APY, scaled by `rateDecimals`.

***

### frozen

> **frozen**: `boolean`

Defined in: [packages/client/src/modules/market/types.ts:16](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L16)

Whether new pool activity is currently frozen.

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/market/types.ts:6](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L6)

Pool canister principal text.

***

### lastUpdated?

> `optional` **lastUpdated?**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:66](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L66)

Unix timestamp in seconds of the last pool update when available.

***

### lendingIndex

> **lendingIndex**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:58](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L58)

Current lending index.

***

### lendingRate

> **lendingRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L40)

Current supply APR, scaled by `rateDecimals`.

***

### liquidationBonus

> **liquidationBonus**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L32)

Liquidation bonus in basis points.

***

### liquidationThreshold

> **liquidationThreshold**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:30](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L30)

Liquidation threshold in basis points.

***

### maxLtv

> **maxLtv**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:28](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L28)

Maximum loan-to-value ratio in basis points.

***

### optimalUtilizationRate

> **optimalUtilizationRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:52](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L52)

Optimal utilization point, scaled by `rateDecimals`.

***

### protocolLiquidationFee

> **protocolLiquidationFee**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L34)

Protocol liquidation fee in basis points.

***

### rateDecimals

> **rateDecimals**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:38](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L38)

Decimal scale used by APR and utilization fields.

***

### rateSlopeAfter

> **rateSlopeAfter**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L56)

Rate slope after optimal utilization, scaled by `rateDecimals`.

***

### rateSlopeBefore

> **rateSlopeBefore**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:54](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L54)

Rate slope before optimal utilization, scaled by `rateDecimals`.

***

### reserveFactor

> **reserveFactor**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L36)

Reserve factor in basis points.

***

### sameAssetBorrowing

> **sameAssetBorrowing**: `boolean`

Defined in: [packages/client/src/modules/market/types.ts:62](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L62)

Whether borrowing the same asset as collateral is allowed.

***

### sameAssetBorrowingDustThreshold

> **sameAssetBorrowingDustThreshold**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:64](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L64)

Same-asset collateral below this base-unit amount is treated as dust.

***

### supplyCap?

> `optional` **supplyCap?**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:24](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L24)

Optional supply cap in base units.

***

### totalDebt

> **totalDebt**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:20](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L20)

Current borrowed amount in base units after applying the borrow index.

***

### totalSupply

> **totalSupply**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:18](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L18)

Current supplied amount in base units after applying the lending index.

***

### utilizationRate

> **utilizationRate**: `bigint`

Defined in: [packages/client/src/modules/market/types.ts:48](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/market/types.ts#L48)

Current pool utilization, scaled by `rateDecimals`.
