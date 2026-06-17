[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PaginatedResponse

# Interface: PaginatedResponse\<T\>

Defined in: [packages/client/src/modules/history/types.ts:231](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L231)

Generic SDK API paginated response.

## Type Parameters

### T

`T`

## Properties

### items

> **items**: `T`[]

Defined in: [packages/client/src/modules/history/types.ts:233](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L233)

Items in the current page.

***

### nextCursor?

> `optional` **nextCursor?**: `string`

Defined in: [packages/client/src/modules/history/types.ts:235](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/history/types.ts#L235)

Cursor for the next page when more results are available.
