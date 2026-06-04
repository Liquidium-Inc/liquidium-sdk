[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / GetActivityStatusByShortRefRequest

# Interface: GetActivityStatusByShortRefRequest

Defined in: [packages/client/src/modules/activities/types.ts:162](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L162)

Activity status lookup scoped to an instant-loan short reference.

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

### shortRef

> **shortRef**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:165](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L165)

Instant-loan short reference that owns the activity.
