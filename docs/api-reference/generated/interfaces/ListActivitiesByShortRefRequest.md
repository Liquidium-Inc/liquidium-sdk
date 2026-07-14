[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ListActivitiesByShortRefRequest

# Interface: ListActivitiesByShortRefRequest

Defined in: [packages/client/src/modules/activities/types.ts:88](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L88)

Activity list request scoped to a simple loan short reference.

## Extends

- [`BaseListActivitiesRequest`](BaseListActivitiesRequest.md)

## Properties

### filter?

> `optional` **filter?**: [`ActivityFilter`](../type-aliases/ActivityFilter.md)

Defined in: [packages/client/src/modules/activities/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L77)

Optional lifecycle filter; defaults to `active`.

#### Inherited from

[`BaseListActivitiesRequest`](BaseListActivitiesRequest.md).[`filter`](BaseListActivitiesRequest.md#filter)

***

### shortRef

> **shortRef**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L91)

Simple loan short reference to list activities for.
