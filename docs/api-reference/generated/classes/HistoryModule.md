[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / HistoryModule

# Class: HistoryModule

Defined in: [packages/client/src/modules/history/history.ts:20](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L20)

Historical user transaction and liquidation data helpers.

## Constructors

### Constructor

> **new HistoryModule**(`apiClient`): `HistoryModule`

Defined in: [packages/client/src/modules/history/history.ts:21](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L21)

#### Parameters

##### apiClient

`ApiClient` \| `undefined`

#### Returns

`HistoryModule`

## Methods

### getLiquidationHistory()

> **getLiquidationHistory**(`user`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:92](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L92)

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

### getUserTransactionHistory()

> **getUserTransactionHistory**(`user`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:41](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L41)

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
