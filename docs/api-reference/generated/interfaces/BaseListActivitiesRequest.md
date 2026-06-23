[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / BaseListActivitiesRequest

# Interface: BaseListActivitiesRequest

Defined in: [packages/client/src/modules/activities/types.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L75)

Shared request fields for listing activities.

## Extended by

- [`ListActivitiesByProfileRequest`](ListActivitiesByProfileRequest.md)
- [`ListActivitiesByShortRefRequest`](ListActivitiesByShortRefRequest.md)

## Properties

### filter?

> `optional` **filter?**: [`ActivityFilter`](../type-aliases/ActivityFilter.md)

Defined in: [packages/client/src/modules/activities/types.ts:77](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L77)

Optional lifecycle filter; defaults to `active`.
