[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PaginatedResponse

# Interface: PaginatedResponse\<T\>

Defined in: [packages/client/src/modules/history/types.ts:96](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L96)

Generic SDK API paginated response.

## Type Parameters

### T

`T`

## Properties

### items

> **items**: `T`[]

Defined in: [packages/client/src/modules/history/types.ts:98](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L98)

Items in the current page.

***

### nextCursor?

> `optional` **nextCursor?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:100](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L100)

Cursor for the next page when more results are available.
