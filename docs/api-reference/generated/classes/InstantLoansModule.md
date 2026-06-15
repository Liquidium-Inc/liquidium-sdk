[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoansModule

# Class: InstantLoansModule

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:207](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L207)

Accountless instant-loan creation, lookup, recovery, and canister query helpers.

## Constructors

### Constructor

> **new InstantLoansModule**(`canisterContext`, `apiClient`, `activities`, `lending`, `positions`): `InstantLoansModule`

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:208](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L208)

#### Parameters

##### canisterContext

`CanisterContext`

##### apiClient

`ApiClient` \| `undefined`

##### activities

[`ActivitiesModule`](ActivitiesModule.md)

##### lending

[`LendingModule`](LendingModule.md)

##### positions

[`PositionsModule`](PositionsModule.md)

#### Returns

`InstantLoansModule`

## Methods

### countWarmedProfiles()

> **countWarmedProfiles**(): `Promise`\<`bigint`\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:404](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L404)

Returns the current size of the warmed-profile pool via direct query.

#### Returns

`Promise`\<`bigint`\>

Number of warmed profiles available on the canister.

***

### create()

> **create**(`request`): `Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:233](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L233)

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

> **find**(`query`): `Promise`\<[`InstantLoanFindResult`](../interfaces/InstantLoanFindResult.md)[]\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:311](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L311)

Finds instant loans by short reference, numeric loan id string, address, or transaction id.

Search returns lightweight matches. Call `get({ loanId })` or `get({ ref })`
when the user selects a match and you need hydrated loan state.

#### Parameters

##### query

`string`

Short reference, address, transaction id/hash, or numeric loan id string.

#### Returns

`Promise`\<[`InstantLoanFindResult`](../interfaces/InstantLoanFindResult.md)[]\>

Matching loan ids and references from the search index.

***

### get()

> **get**(`request`): `Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:292](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L292)

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

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:330](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L330)

Returns the active instant-loans canister config via direct query.

#### Returns

`Promise`\<[`InstantLoanConfig`](../interfaces/InstantLoanConfig.md)\>

Active canister configuration.

***

### getEvent()

> **getEvent**(`eventId`): `Promise`\<[`InstantLoanEvent`](../interfaces/InstantLoanEvent.md) \| `null`\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:350](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L350)

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

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:387](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L387)

Returns principals authorized for protected update callbacks.

#### Returns

`Promise`\<`string`[]\>

Principal text values on the canister access list.

***

### listEvents()

> **listEvents**(`request`): `Promise`\<[`InstantLoanEvent`](../interfaces/InstantLoanEvent.md)[]\>

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:368](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L368)

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

Defined in: [packages/client/src/modules/instant-loans/instant-loans.ts:422](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/instant-loans.ts#L422)

Returns warmed profiles currently available for future instant loans.

#### Returns

`Promise`\<[`InstantLoanWarmedProfile`](../interfaces/InstantLoanWarmedProfile.md)[]\>

Warmed profile records available for assignment.
