[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ListActivitiesByShortRefRequest

# Interface: ListActivitiesByShortRefRequest

Defined in: [packages/client/src/modules/activities/types.ts:137](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L137)

Activity list request scoped to an instant-loan short reference.

## Extends

- [`BaseListActivitiesRequest`](BaseListActivitiesRequest.md)

## Properties

### filter?

> `optional` **filter?**: [`ActivityFilter`](../type-aliases/ActivityFilter.md)

Defined in: [packages/client/src/modules/activities/types.ts:126](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L126)

Optional state filter; defaults to `all`.

#### Inherited from

[`BaseListActivitiesRequest`](BaseListActivitiesRequest.md).[`filter`](BaseListActivitiesRequest.md#filter)

***

### shortRef

> **shortRef**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L140)

Instant-loan short reference to list activities for.
