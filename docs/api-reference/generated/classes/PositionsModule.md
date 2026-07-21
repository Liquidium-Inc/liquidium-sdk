[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PositionsModule

# Class: PositionsModule

Defined in: [packages/client/src/modules/positions/positions.ts:31](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L31)

Profile position, health factor, and reserve valuation helpers.

## Constructors

### Constructor

> **new PositionsModule**(`canisterContext`, `market`): `PositionsModule`

Defined in: [packages/client/src/modules/positions/positions.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L32)

#### Parameters

##### canisterContext

`CanisterContext`

##### market

[`MarketModule`](MarketModule.md)

#### Returns

`PositionsModule`

## Properties

### market

> `readonly` **market**: [`MarketModule`](MarketModule.md)

Defined in: [packages/client/src/modules/positions/positions.ts:34](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L34)

## Methods

### getFullWithdrawAmount()

> **getFullWithdrawAmount**(`profileId`, `poolId`): `Promise`\<[`FullWithdrawAmount`](../interfaces/FullWithdrawAmount.md)\>

Defined in: [packages/client/src/modules/positions/positions.ts:301](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L301)

Returns the current full withdraw amount for a position.

`Position.deposited` already reflects the current supplied balance at the
latest lending index; do not add `earnedInterest` to this amount.
Pass `amount` to withdraw calls and use `decimals` for display formatting.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

##### poolId

`string`

The pool principal text.

#### Returns

`Promise`\<[`FullWithdrawAmount`](../interfaces/FullWithdrawAmount.md)\>

Full withdraw amount in the supplied asset's base units.

***

### getHealthFactor()

> **getHealthFactor**(`profileId`): `Promise`\<[`HealthFactor`](../interfaces/HealthFactor.md)\>

Defined in: [packages/client/src/modules/positions/positions.ts:131](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L131)

Returns the current health factor for a profile.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

#### Returns

`Promise`\<[`HealthFactor`](../interfaces/HealthFactor.md)\>

The current health factor for the requested profile.

***

### getMaxRepayAmount()

> **getMaxRepayAmount**(`profileId`, `poolId`, `bufferBps?`): `Promise`\<[`MaxRepayAmount`](../interfaces/MaxRepayAmount.md)\>

Defined in: [packages/client/src/modules/positions/positions.ts:270](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L270)

Returns the full repayment amount for a position, with a small buffer to
account for interest that accrues between quote and submit.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

##### poolId

`string`

The pool principal text.

##### bufferBps?

`bigint` = `DEFAULT_REPAY_BUFFER_BPS`

Optional buffer in basis points (default 10 = 0.1%).

#### Returns

`Promise`\<[`MaxRepayAmount`](../interfaces/MaxRepayAmount.md)\>

Buffered repayment amount in the borrowed asset's base units.

***

### getPosition()

> **getPosition**(`profileId`, `poolId`): `Promise`\<[`Position`](../interfaces/Position.md) \| `null`\>

Defined in: [packages/client/src/modules/positions/positions.ts:44](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L44)

Returns a single position for a profile and pool.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

##### poolId

`string`

The pool principal text.

#### Returns

`Promise`\<[`Position`](../interfaces/Position.md) \| `null`\>

The position for the requested profile and pool, or `null` when no position exists.

***

### getUserPositionSummary()

> **getUserPositionSummary**(`profileId`): `Promise`\<[`UserPositionSummary`](../interfaces/UserPositionSummary.md)\>

Defined in: [packages/client/src/modules/positions/positions.ts:185](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L185)

Returns an aggregate summary of a profile's position.

Single canister round-trip (`get_health_factor`). Derived fields:
`availableBorrowsUsd = max(0, maxBorrowableUsd - debt)`,
`netWorthUsd = collateral - debt` (may be negative if underwater),
`currentLtvBps = debt * 10_000 / collateral` (0 when collateral is 0).

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

#### Returns

`Promise`\<[`UserPositionSummary`](../interfaces/UserPositionSummary.md)\>

Derived position summary for the requested profile.

***

### getUserReserves()

> **getUserReserves**(`profileId`): `Promise`\<[`UserReserve`](../interfaces/UserReserve.md)[]\>

Defined in: [packages/client/src/modules/positions/positions.ts:221](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L221)

Returns the per-reserve breakdown of a profile's supplies and borrows,
joined with pool metadata, rates, and current USD prices.

USD values are scaled to 27 decimals.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

#### Returns

`Promise`\<[`UserReserve`](../interfaces/UserReserve.md)[]\>

Per-reserve position rows joined with pool metadata and USD values.

***

### getUserStats()

> **getUserStats**(`profileId`): `Promise`\<[`UserStats`](../interfaces/UserStats.md)\>

Defined in: [packages/client/src/modules/positions/positions.ts:158](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L158)

Returns aggregate borrowing and collateral stats for a profile.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

#### Returns

`Promise`\<[`UserStats`](../interfaces/UserStats.md)\>

Aggregate debt, collateral, and borrowing power metrics for the requested profile.

***

### listPositions()

> **listPositions**(`profileId`): `Promise`\<[`Position`](../interfaces/Position.md)[]\>

Defined in: [packages/client/src/modules/positions/positions.ts:81](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/positions/positions.ts#L81)

Lists visible positions for a profile. Supplied-only positions below their
pool's same-asset dust threshold are omitted, while positions with debt are
retained.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

#### Returns

`Promise`\<[`Position`](../interfaces/Position.md)[]\>

Visible positions currently associated with the requested profile.
