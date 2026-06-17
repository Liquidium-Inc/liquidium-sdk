[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetActivityStatusByProfileRequest

# Interface: GetActivityStatusByProfileRequest

Defined in: [packages/client/src/modules/activities/types.ts:124](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L124)

Activity status lookup scoped to a Liquidium profile.

## Extends

- [`BaseGetActivityStatusRequest`](BaseGetActivityStatusRequest.md)

## Properties

### id

> **id**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:120](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L120)

Activity or receipt id to look up.

#### Inherited from

[`BaseGetActivityStatusRequest`](BaseGetActivityStatusRequest.md).[`id`](BaseGetActivityStatusRequest.md#id)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:127](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L127)

Profile principal text that owns the activity.
