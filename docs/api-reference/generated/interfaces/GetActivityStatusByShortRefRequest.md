[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetActivityStatusByShortRefRequest

# Interface: GetActivityStatusByShortRefRequest

Defined in: [packages/client/src/modules/activities/types.ts:133](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L133)

Activity status lookup scoped to an instant-loan short reference.

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

### shortRef

> **shortRef**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:136](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L136)

Instant-loan short reference that owns the activity.
