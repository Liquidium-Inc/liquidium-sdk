[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ActivitiesModule

# Class: ActivitiesModule

Defined in: [packages/client/src/modules/activities/activities.ts:71](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L71)

Receipt-oriented activity list and status helpers.

## Constructors

### Constructor

> **new ActivitiesModule**(`apiClient`, `canisterContext`): `ActivitiesModule`

Defined in: [packages/client/src/modules/activities/activities.ts:72](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L72)

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

Defined in: [packages/client/src/modules/activities/activities.ts:106](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L106)

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

Defined in: [packages/client/src/modules/activities/activities.ts:85](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L85)

Lists profile activities. Defaults to active activities.

Uses the Liquidium SDK API.

#### Parameters

##### request

[`ListActivitiesRequest`](../type-aliases/ListActivitiesRequest.md)

Profile id or instant-loan short reference plus optional lifecycle filter.

#### Returns

`Promise`\<[`Activity`](../type-aliases/Activity.md)[]\>

Activities owned by the resolved profile.
