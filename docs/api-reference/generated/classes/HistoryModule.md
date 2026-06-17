[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / HistoryModule

# Class: HistoryModule

Defined in: [packages/client/src/modules/history/history.ts:32](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L32)

Historical pool, rate, user transaction, and liquidation data helpers.

## Constructors

### Constructor

> **new HistoryModule**(`apiClient`): `HistoryModule`

Defined in: [packages/client/src/modules/history/history.ts:33](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L33)

#### Parameters

##### apiClient

`ApiClient` \| `undefined`

#### Returns

`HistoryModule`

## Methods

### getBorrowRateHistory()

> **getBorrowRateHistory**(`poolId`, `window?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`ApySample`](../interfaces/ApySample.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:159](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L159)

Returns borrow rate history for a pool.

#### Parameters

##### poolId

`string`

The pool principal text.

##### window?

[`BorrowApyHistoryRequest`](../interfaces/BorrowApyHistoryRequest.md) = `{}`

Optional time window with from/to timestamps and limit.

#### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`ApySample`](../interfaces/ApySample.md)\>\>

Paginated APY samples.

***

### getLiquidationHistory()

> **getLiquidationHistory**(`user`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:238](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L238)

Returns liquidation history for a user.

#### Parameters

##### user

`string`

The Liquidium profile principal text.

##### filters?

[`UserLiquidationHistoryFilters`](../interfaces/UserLiquidationHistoryFilters.md) = `{}`

Optional pool, time range, and pagination filters.

#### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Paginated liquidation history entries.

***

### getPoolConfigHistory()

> **getPoolConfigHistory**(`poolId`, `cursor?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`PoolConfigHistoryEntry`](../interfaces/PoolConfigHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:84](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L84)

Returns paginated configuration change history for a pool.

#### Parameters

##### poolId

`string`

The pool principal text.

##### cursor?

`string`

An optional pagination cursor from a previous response.

#### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`PoolConfigHistoryEntry`](../interfaces/PoolConfigHistoryEntry.md)\>\>

A page of pool configuration changes and the next cursor when more results are available.

***

### getPoolHistory()

> **getPoolHistory**(`poolId`, `window?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`PoolHistoryEntry`](../interfaces/PoolHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:53](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L53)

Returns paginated rate and utilization history for a pool.

#### Parameters

##### poolId

`string`

The pool principal text.

##### window?

[`BorrowApyHistoryRequest`](../interfaces/BorrowApyHistoryRequest.md) = `{}`

Optional time window with from/to timestamps and limit.

#### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`PoolHistoryEntry`](../interfaces/PoolHistoryEntry.md)\>\>

A page of pool rate history entries and the next cursor when more results are available.

***

### getUserTransactionHistory()

> **getUserTransactionHistory**(`user`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:187](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L187)

Returns transaction history for a user.

#### Parameters

##### user

`string`

The Liquidium profile principal text.

##### filters?

[`UserTransactionHistoryFilters`](../interfaces/UserTransactionHistoryFilters.md) = `{}`

Optional pool, type, state, time range, and pagination filters.

#### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Paginated user history entries.
