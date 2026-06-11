[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / HistoryModule

# Class: HistoryModule

Defined in: [packages/client/src/modules/history/history.ts:40](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L40)

Historical pool, rate, user transaction, and liquidation data helpers.

## Constructors

### Constructor

> **new HistoryModule**(`apiClient`): `HistoryModule`

Defined in: [packages/client/src/modules/history/history.ts:41](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L41)

#### Parameters

##### apiClient

`ApiClient` \| `undefined`

#### Returns

`HistoryModule`

## Methods

### getBorrowRateHistory()

> **getBorrowRateHistory**(`poolId`, `window?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`ApySample`](../interfaces/ApySample.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:167](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L167)

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

#### Call Signature

> **getLiquidationHistory**(`user`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:260](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L260)

Returns liquidation history for a user.

##### Parameters

###### user

`string`

The Liquidium profile principal text.

###### filters?

[`UserLiquidationHistoryFilters`](../interfaces/UserLiquidationHistoryFilters.md)

Optional pool, time range, and pagination filters.

##### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Paginated liquidation history entries.

#### Call Signature

> **getLiquidationHistory**(`user`, `market?`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:264](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L264)

Returns liquidation history for a user.

##### Parameters

###### user

`string`

The Liquidium profile principal text.

###### market?

`string`

###### filters?

[`UserLiquidationHistoryFilters`](../interfaces/UserLiquidationHistoryFilters.md)

Optional pool, time range, and pagination filters.

##### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Paginated liquidation history entries.

***

### getPoolConfigHistory()

> **getPoolConfigHistory**(`poolId`, `cursor?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`PoolConfigHistoryEntry`](../interfaces/PoolConfigHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:92](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L92)

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

Defined in: [packages/client/src/modules/history/history.ts:61](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L61)

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

#### Call Signature

> **getUserTransactionHistory**(`user`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:195](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L195)

Returns transaction history for a user.

##### Parameters

###### user

`string`

The Liquidium profile principal text.

###### filters?

[`UserTransactionHistoryFilters`](../interfaces/UserTransactionHistoryFilters.md)

Optional pool, type, status, time range, and pagination filters.

##### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Paginated user history entries.

#### Call Signature

> **getUserTransactionHistory**(`user`, `market?`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:199](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L199)

Returns transaction history for a user.

##### Parameters

###### user

`string`

The Liquidium profile principal text.

###### market?

`string`

###### filters?

[`UserTransactionHistoryFilters`](../interfaces/UserTransactionHistoryFilters.md)

Optional pool, type, status, time range, and pagination filters.

##### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Paginated user history entries.
