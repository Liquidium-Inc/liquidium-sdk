[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetActivityStatusByProfileRequest

# Interface: GetActivityStatusByProfileRequest

Defined in: [packages/client/src/modules/activities/types.ts:106](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L106)

Activity status lookup scoped to a Liquidium profile.

## Extends

- [`BaseGetActivityStatusRequest`](BaseGetActivityStatusRequest.md)

## Properties

### id

> **id**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:102](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L102)

Activity or receipt id to look up.

#### Inherited from

[`BaseGetActivityStatusRequest`](BaseGetActivityStatusRequest.md).[`id`](BaseGetActivityStatusRequest.md#id)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L109)

Profile principal text that owns the activity.
