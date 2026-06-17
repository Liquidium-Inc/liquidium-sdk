[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PaginatedResponse

# Interface: PaginatedResponse\<T\>

Defined in: [packages/client/src/modules/history/types.ts:103](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L103)

Generic SDK API paginated response.

## Type Parameters

### T

`T`

## Properties

### items

> **items**: `T`[]

Defined in: [packages/client/src/modules/history/types.ts:105](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L105)

Items in the current page.

***

### nextCursor?

> `optional` **nextCursor?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:107](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L107)

Cursor for the next page when more results are available.
