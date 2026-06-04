[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetActivityStatusByProfileRequest

# Interface: GetActivityStatusByProfileRequest

Defined in: [packages/client/src/modules/activities/types.ts:155](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L155)

Activity status lookup scoped to a Liquidium profile.

## Extends

- [`BaseGetActivityStatusRequest`](BaseGetActivityStatusRequest.md)

## Properties

### id

> **id**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:151](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L151)

Activity or receipt id to look up.

#### Inherited from

[`BaseGetActivityStatusRequest`](BaseGetActivityStatusRequest.md).[`id`](BaseGetActivityStatusRequest.md#id)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:158](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L158)

Profile principal text that owns the activity.
