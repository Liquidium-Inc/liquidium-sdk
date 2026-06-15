[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ActivitiesModule

# Class: ActivitiesModule

Defined in: [packages/client/src/modules/activities/activities.ts:74](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L74)

Receipt-oriented activity list and status helpers.

## Constructors

### Constructor

> **new ActivitiesModule**(`apiClient`, `canisterContext`): `ActivitiesModule`

Defined in: [packages/client/src/modules/activities/activities.ts:75](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L75)

#### Parameters

##### apiClient

`ApiClient` \| `undefined`

##### canisterContext

`CanisterContext`

#### Returns

`ActivitiesModule`

## Methods

### getStatus()

> **getStatus**(`request`): `Promise`\<[`GetActivityStatusResponse`](../type-aliases/GetActivityStatusResponse.md)\>

Defined in: [packages/client/src/modules/activities/activities.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L109)

Fetches the latest status for a single receipt/activity id.

Uses the Liquidium SDK API.

#### Parameters

##### request

[`GetActivityStatusRequest`](../type-aliases/GetActivityStatusRequest.md)

Activity id plus profile id or instant-loan short reference.

#### Returns

`Promise`\<[`GetActivityStatusResponse`](../type-aliases/GetActivityStatusResponse.md)\>

The activity when found, otherwise `{ found: false }` with the requested id.

***

### list()

> **list**(`request`): `Promise`\<[`Activity`](../type-aliases/Activity.md)[]\>

Defined in: [packages/client/src/modules/activities/activities.ts:88](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L88)

Lists profile activities. Defaults to all activities.

Uses the Liquidium SDK API.

#### Parameters

##### request

[`ListActivitiesRequest`](../type-aliases/ListActivitiesRequest.md)

Profile id or instant-loan short reference plus optional state filter.

#### Returns

`Promise`\<[`Activity`](../type-aliases/Activity.md)[]\>

Activities owned by the resolved profile.
