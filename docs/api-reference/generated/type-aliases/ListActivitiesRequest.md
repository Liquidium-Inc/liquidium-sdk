[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ListActivitiesRequest

# Type Alias: ListActivitiesRequest

> **ListActivitiesRequest** = `object` & \{ `profileId`: `string`; \} \| \{ `shortRef`: `string`; \}

Defined in: [packages/client/src/modules/activities/types.ts:124](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L124)

Request for listing activities by profile id or instant-loan short reference.

## Type Declaration

### filter?

> `optional` **filter?**: [`ActivityFilter`](ActivityFilter.md)

Optional state filter; defaults to `all`.
