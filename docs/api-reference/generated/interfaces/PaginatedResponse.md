[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / PaginatedResponse

# Interface: PaginatedResponse\<T\>

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:248](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L248)

Generic SDK API paginated response.

## Type Parameters

### T

`T`

## Properties

### items

> **items**: `T`[]

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:250](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L250)

Items in the current page.

***

### nextCursor?

> `optional` **nextCursor?**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/history/types.ts:252](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/history/types.ts#L252)

Cursor for the next page when more results are available.
