[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ListActivitiesByProfileRequest

# Interface: ListActivitiesByProfileRequest

Defined in: [packages/client/src/modules/activities/types.ts:99](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L99)

Activity list request scoped to a Liquidium profile.

## Extends

- [`BaseListActivitiesRequest`](BaseListActivitiesRequest.md)

## Properties

### filter?

> `optional` **filter?**: [`ActivityFilter`](../type-aliases/ActivityFilter.md)

Defined in: [packages/client/src/modules/activities/types.ts:95](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L95)

Optional lifecycle filter; defaults to `all`.

#### Inherited from

[`BaseListActivitiesRequest`](BaseListActivitiesRequest.md).[`filter`](BaseListActivitiesRequest.md#filter)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:102](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L102)

Profile principal text to list activities for.
