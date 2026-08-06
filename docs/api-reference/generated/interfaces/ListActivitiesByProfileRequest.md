[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ListActivitiesByProfileRequest

# Interface: ListActivitiesByProfileRequest

Defined in: packages/client/src/modules/activities/types.ts:81

Activity list request scoped to a Liquidium profile.

## Extends

- [`BaseListActivitiesRequest`](BaseListActivitiesRequest.md)

## Properties

### filter?

> `optional` **filter?**: [`ActivityFilter`](../type-aliases/ActivityFilter.md)

Defined in: packages/client/src/modules/activities/types.ts:77

Optional lifecycle filter; defaults to `active`.

#### Inherited from

[`BaseListActivitiesRequest`](BaseListActivitiesRequest.md).[`filter`](BaseListActivitiesRequest.md#filter)

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/activities/types.ts:84

Profile principal text to list activities for.
