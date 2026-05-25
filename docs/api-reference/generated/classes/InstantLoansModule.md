[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoansModule

# Class: InstantLoansModule

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:140](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L140)

Accountless instant-loan creation, lookup, recovery, and canister query helpers.

## Constructors

### Constructor

> **new InstantLoansModule**(`canisterContext`, `apiClient`, `lending`, `positions`): `InstantLoansModule`

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:141](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L141)

#### Parameters

##### canisterContext

`CanisterContext`

##### apiClient

`ApiClient` \| `undefined`

##### lending

[`LendingModule`](LendingModule.md)

##### positions

[`PositionsModule`](PositionsModule.md)

#### Returns

`InstantLoansModule`

## Methods

### countWarmedProfiles()

> **countWarmedProfiles**(): `Promise`\<`bigint`\>

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:309](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L309)

Returns the current size of the warmed-profile pool via direct query.

#### Returns

`Promise`\<`bigint`\>

Number of warmed profiles available on the canister.

***

### create()

> **create**(`request`): `Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:165](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L165)

Creates a profileless instant loan and returns canonical canister state plus
deposit/repay targets for the generated lending profile.

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

Hydrated loan state plus generated deposit and repayment targets.

***

### findByAddress()

> **findByAddress**(`address`): `Promise`\<[`InstantLoanCandidate`](../interfaces/InstantLoanCandidate.md)[]\>

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:349](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L349)

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

***

### get()

> **get**(`request`): `Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:207](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L207)

Resolves canonical canister state by loan id or short reference.

References are decoded locally, then the corresponding loan id is loaded
from the instant-loans canister.

#### Parameters

##### request

[`InstantLoanGetRequest`](../type-aliases/InstantLoanGetRequest.md)

Canister loan id or short public reference.

#### Returns

`Promise`\<[`InstantLoan`](../interfaces/InstantLoan.md)\>

Hydrated loan state plus generated deposit and repayment targets.

***

### getConfig()

> **getConfig**(): `Promise`\<[`InstantLoanConfig`](../interfaces/InstantLoanConfig.md)\>

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:235](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L235)

Returns the active instant-loans canister config via direct query.

#### Returns

`Promise`\<[`InstantLoanConfig`](../interfaces/InstantLoanConfig.md)\>

Active canister configuration.

***

### getEvent()

> **getEvent**(`eventId`): `Promise`\<[`InstantLoanEvent`](../interfaces/InstantLoanEvent.md) \| `null`\>

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:255](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L255)

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

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:292](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L292)

Returns principals authorized for protected update callbacks.

#### Returns

`Promise`\<`string`[]\>

Principal text values on the canister access list.

***

### listEvents()

> **listEvents**(`request`): `Promise`\<[`InstantLoanEvent`](../interfaces/InstantLoanEvent.md)[]\>

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:273](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L273)

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

Defined in: [external/liquidium-sdk/packages/client/src/modules/instant-loans/instant-loans.ts:327](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/instant-loans/instant-loans.ts#L327)

Returns warmed profiles currently available for future instant loans.

#### Returns

`Promise`\<[`InstantLoanWarmedProfile`](../interfaces/InstantLoanWarmedProfile.md)[]\>

Warmed profile records available for assignment.
