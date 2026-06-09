[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoansModule

# Class: InstantLoansModule

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:182](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L182)

Accountless instant-loan creation, lookup, recovery, and canister query helpers.

## Constructors

### Constructor

> **new InstantLoansModule**(`canisterContext`, `apiClient`, `lending`, `positions`, `activities`): `InstantLoansModule`

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:183](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L183)

#### Parameters

##### canisterContext

`CanisterContext`

##### apiClient

`ApiClient` \| `undefined`

##### lending

[`LendingModule`](LendingModule.md)

##### positions

[`PositionsModule`](PositionsModule.md)

##### activities

[`ActivitiesModule`](ActivitiesModule.md)

#### Returns

`InstantLoansModule`

## Methods

### countWarmedProfiles()

> **countWarmedProfiles**(): `Promise`\<`bigint`\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:385](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L385)

Returns the current size of the warmed-profile pool via direct query.

#### Returns

`Promise`\<`bigint`\>

Number of warmed profiles available on the canister.

***

### create()

> **create**(`request`): `Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:208](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L208)

Creates a profileless instant loan and returns canonical canister state plus
generated initial-deposit and repayment quote targets.

Choose `collateralPoolId` and `borrowPoolId` from
`client.market.listPools()`, convert UI amounts to base units with the
selected pool decimals, and call `client.quote.calculateLtv(...)` before
creation to block invalid LTV input.

`borrowDestination` receives the borrowed asset after the loan starts.
`refundDestination` receives collateral refunds or withdrawals. Use
`depositWindowSeconds` for the user-facing collateral deposit timeout; the
SDK maps it to the canister's internal `ltv_timer_s` field.

#### Parameters

##### request

[`CreateInstantLoanRequest`](../interfaces/CreateInstantLoanRequest.md)

Pool ids, assets, base-unit amounts, LTV limit, timeout, and destinations.

#### Returns

`Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Hydrated loan state plus generated initial-deposit and repayment quote targets.

***

### find()

#### Call Signature

> **find**(`request`): `Promise`\<[`InstantLoanFindResult`](../interfaces/InstantLoanFindResult.md)[]\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:282](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L282)

Finds instant loans by short reference, numeric loan id, address, or transaction id.

String input first tries the short-reference path used by the web app, then
numeric loan-id lookup for all-digit strings. If neither resolves, the SDK
searches generated deposit/repay addresses, borrow/refund destinations, and
indexed transaction ids through the SDK API.

##### Parameters

###### request

`string` \| `bigint`

Short reference, address, transaction id/hash, numeric loan id, or explicit request object.

##### Returns

`Promise`\<[`InstantLoanFindResult`](../interfaces/InstantLoanFindResult.md)[]\>

Hydrated loan state plus active and completed activities for each match.

#### Call Signature

> **find**(`request`): `Promise`\<[`InstantLoanFindResult`](../interfaces/InstantLoanFindResult.md)[]\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:283](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L283)

Finds instant loans by short reference, numeric loan id, address, or transaction id.

String input first tries the short-reference path used by the web app, then
numeric loan-id lookup for all-digit strings. If neither resolves, the SDK
searches generated deposit/repay addresses, borrow/refund destinations, and
indexed transaction ids through the SDK API.

##### Parameters

###### request

[`InstantLoanFindRequest`](../type-aliases/InstantLoanFindRequest.md)

Short reference, address, transaction id/hash, numeric loan id, or explicit request object.

##### Returns

`Promise`\<[`InstantLoanFindResult`](../interfaces/InstantLoanFindResult.md)[]\>

Hydrated loan state plus active and completed activities for each match.

***

### ~~findByAddress()~~

> **findByAddress**(`address`): `Promise`\<[`InstantLoanCandidate`](../interfaces/InstantLoanCandidate.md)[]\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:426](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L426)

Finds candidate loans associated with an address through the Liquidium SDK
API. Returns discovery candidates only; call `get(...)` to hydrate canister state.

Candidates are useful for recovery flows where the user knows a borrow or
refund address but not the loan reference.

#### Parameters

##### address

`string`

Borrow or refund address to search for.

#### Returns

`Promise`\<[`InstantLoanCandidate`](../interfaces/InstantLoanCandidate.md)[]\>

Lightweight loan candidates associated with the address.

#### Deprecated

Use `instantLoans.find(...)` for address, transaction id, short reference, or loan id lookup with hydrated loan state and activities.

***

### get()

> **get**(`request`): `Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:261](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L261)

Resolves canonical canister state by loan id or short reference.

References are decoded locally, then the corresponding loan id is loaded
from the instant-loans canister.

#### Parameters

##### request

[`InstantLoanGetRequest`](../type-aliases/InstantLoanGetRequest.md)

Canister loan id or short public reference.

#### Returns

`Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Hydrated loan state plus generated initial-deposit and repayment quote targets.

***

### getConfig()

> **getConfig**(): `Promise`\<[`InstantLoanConfig`](../interfaces/InstantLoanConfig.md)\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:311](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L311)

Returns the active instant-loans canister config via direct query.

#### Returns

`Promise`\<[`InstantLoanConfig`](../interfaces/InstantLoanConfig.md)\>

Active canister configuration.

***

### getEvent()

> **getEvent**(`eventId`): `Promise`\<[`InstantLoanEvent`](../interfaces/InstantLoanEvent.md) \| `null`\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:331](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L331)

Returns a single canister event by id via direct query.

#### Parameters

##### eventId

`bigint`

Event id to load.

#### Returns

`Promise`\<[`InstantLoanEvent`](../interfaces/InstantLoanEvent.md) \| `null`\>

The event when found, otherwise `null`.

***

### listAccessList()

> **listAccessList**(): `Promise`\<`string`[]\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:368](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L368)

Returns principals authorized for protected update callbacks.

#### Returns

`Promise`\<`string`[]\>

Principal text values on the canister access list.

***

### listEvents()

> **listEvents**(`request`): `Promise`\<[`InstantLoanEvent`](../interfaces/InstantLoanEvent.md)[]\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:349](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L349)

Returns a page of canister events via direct query.

#### Parameters

##### request

[`InstantLoanListEventsRequest`](../interfaces/InstantLoanListEventsRequest.md)

Start event id and maximum number of events to return.

#### Returns

`Promise`\<[`InstantLoanEvent`](../interfaces/InstantLoanEvent.md)[]\>

Canister events in ascending id order.

***

### listWarmedProfiles()

> **listWarmedProfiles**(): `Promise`\<[`InstantLoanWarmedProfile`](../interfaces/InstantLoanWarmedProfile.md)[]\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:403](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L403)

Returns warmed profiles currently available for future instant loans.

#### Returns

`Promise`\<[`InstantLoanWarmedProfile`](../interfaces/InstantLoanWarmedProfile.md)[]\>

Warmed profile records available for assignment.
