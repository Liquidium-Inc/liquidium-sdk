[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / HistoryModule

# Class: HistoryModule

Defined in: [packages/client/src/modules/history/history.ts:42](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L42)

User and protocol history data helpers.

## Constructors

### Constructor

> **new HistoryModule**(`apiClient`): `HistoryModule`

Defined in: [packages/client/src/modules/history/history.ts:43](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L43)

#### Parameters

##### apiClient

`ApiClient` \| `undefined`

#### Returns

`HistoryModule`

## Methods

### getLiquidationHistory()

> **getLiquidationHistory**(`profileId`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:115](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L115)

Returns liquidation history for a user.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

##### filters?

[`UserLiquidationHistoryFilters`](../interfaces/UserLiquidationHistoryFilters.md) = `{}`

Optional pool, time range, and pagination filters.

#### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserLiquidationHistoryEntry`](../interfaces/UserLiquidationHistoryEntry.md)\>\>

Paginated liquidation history entries.

***

### getProtocolActivity()

> **getProtocolActivity**(`filters?`): `Promise`\<[`ProtocolActivityEntry`](../interfaces/ProtocolActivityEntry.md)[]\>

Defined in: [packages/client/src/modules/history/history.ts:156](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L156)

Returns recent protocol-wide lending activity across all users.

#### Parameters

##### filters?

[`ProtocolActivityFeedFilters`](../interfaces/ProtocolActivityFeedFilters.md) = `{}`

Optional pool, operation, and limit filters.

#### Returns

`Promise`\<[`ProtocolActivityEntry`](../interfaces/ProtocolActivityEntry.md)[]\>

Recent confirmed lending activity entries.

***

### getUserTransactionHistory()

> **getUserTransactionHistory**(`profileId`, `filters?`): `Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Defined in: [packages/client/src/modules/history/history.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/history.ts#L63)

Returns transaction history for a user.

#### Parameters

##### profileId

`string`

The Liquidium profile principal text.

##### filters?

[`UserTransactionHistoryFilters`](../interfaces/UserTransactionHistoryFilters.md) = `{}`

Optional pool, operation, state, time range, and pagination filters.

#### Returns

`Promise`\<[`PaginatedResponse`](../interfaces/PaginatedResponse.md)\<[`UserTransactionHistoryEntry`](../interfaces/UserTransactionHistoryEntry.md)\>\>

Paginated user history entries.
