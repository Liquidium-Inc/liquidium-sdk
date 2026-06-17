[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ListActivitiesByShortRefRequest

# Interface: ListActivitiesByShortRefRequest

Defined in: [packages/client/src/modules/activities/types.ts:106](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L106)

Activity list request scoped to an instant-loan short reference.

## Extends

- [`BaseListActivitiesRequest`](BaseListActivitiesRequest.md)

## Properties

### filter?

> `optional` **filter?**: [`ActivityFilter`](../type-aliases/ActivityFilter.md)

Defined in: [packages/client/src/modules/activities/types.ts:95](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L95)

Optional lifecycle filter; defaults to `active`.

#### Inherited from

[`BaseListActivitiesRequest`](BaseListActivitiesRequest.md).[`filter`](BaseListActivitiesRequest.md#filter)

***

### shortRef

> **shortRef**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L109)

Instant-loan short reference to list activities for.
