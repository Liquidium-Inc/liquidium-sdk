[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ActivitiesModule

# Class: ActivitiesModule

Defined in: [packages/client/src/modules/activities/activities.ts:68](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L68)

Receipt-oriented activity list and status helpers.

## Constructors

### Constructor

> **new ActivitiesModule**(`apiClient`, `canisterContext`): `ActivitiesModule`

Defined in: [packages/client/src/modules/activities/activities.ts:69](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L69)

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

Defined in: [packages/client/src/modules/activities/activities.ts:103](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L103)

Fetches the latest status for a single receipt/activity id.

Uses the Liquidium SDK API.

#### Parameters

##### request

[`GetActivityStatusRequest`](../type-aliases/GetActivityStatusRequest.md)

Activity id plus profile id or simple loan short reference.

#### Returns

`Promise`\<[`GetActivityStatusResponse`](../type-aliases/GetActivityStatusResponse.md)\>

The activity when found, otherwise `{ found: false }` with the requested id.

***

### list()

> **list**(`request`): `Promise`\<[`Activity`](../type-aliases/Activity.md)[]\>

Defined in: [packages/client/src/modules/activities/activities.ts:82](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/activities.ts#L82)

Lists profile activities. Defaults to active activities.

Uses the Liquidium SDK API.

#### Parameters

##### request

[`ListActivitiesRequest`](../type-aliases/ListActivitiesRequest.md)

Profile id or simple loan short reference plus optional lifecycle filter.

#### Returns

`Promise`\<[`Activity`](../type-aliases/Activity.md)[]\>

Activities owned by the resolved profile.
