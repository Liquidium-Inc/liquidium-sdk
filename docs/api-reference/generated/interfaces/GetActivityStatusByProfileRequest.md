[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetActivityStatusByProfileRequest

# Interface: GetActivityStatusByProfileRequest

Defined in: [packages/client/src/modules/activities/types.ts:126](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L126)

Activity status lookup scoped to a Liquidium profile.

## Extends

- [`BaseGetActivityStatusRequest`](BaseGetActivityStatusRequest.md)

## Properties

### id

> **id**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:122](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L122)

Activity or receipt id to look up.

#### Inherited from

[`BaseGetActivityStatusRequest`](BaseGetActivityStatusRequest.md).[`id`](BaseGetActivityStatusRequest.md#id)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:129](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L129)

Profile principal text that owns the activity.
