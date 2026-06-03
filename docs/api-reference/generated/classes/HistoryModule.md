[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / HistoryModule

# Class: HistoryModule

Defined in: [packages/client/src/modules/history/history.ts:35](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L35)

Historical pool, rate, user transaction, and liquidation data helpers.

## Constructors

### Constructor

> **new HistoryModule**(`apiClient`): `HistoryModule`

Defined in: [packages/client/src/modules/history/history.ts:36](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L36)

#### Parameters

##### apiClient

`ApiClient` \| `undefined`

#### Returns

`HistoryModule`

## Methods

### getBorrowRateHistory()

> **getBorrowRateHistory**(`poolId`, `window?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`ApySample`](../interfaces/ApySample.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:162](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L162)

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

Defined in: [packages/client/src/modules/history/history.ts:255](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L255)

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

Defined in: [packages/client/src/modules/history/history.ts:259](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L259)

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

Defined in: [packages/client/src/modules/history/history.ts:87](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L87)

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

Defined in: [packages/client/src/modules/history/history.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L56)

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

Defined in: [packages/client/src/modules/history/history.ts:190](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L190)

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

Defined in: [packages/client/src/modules/history/history.ts:194](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L194)

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
