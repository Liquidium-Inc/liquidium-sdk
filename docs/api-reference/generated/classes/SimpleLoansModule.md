[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoansModule

# Class: SimpleLoansModule

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:319](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L319)

Accountless Simple Loans creation, lookup, recovery, and canister query helpers.

## Constructors

### Constructor

> **new SimpleLoansModule**(`canisterContext`, `apiClient`, `activities`, `lending`, `positions`): `SimpleLoansModule`

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:320](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L320)

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

`SimpleLoansModule`

## Methods

### countWarmedProfiles()

> **countWarmedProfiles**(): `Promise`\<`bigint`\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:533](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L533)

Returns the current size of the warmed-profile pool via direct query.

#### Returns

`Promise`\<`bigint`\>

Number of warmed profiles available on the canister.

***

### create()

> **create**(`request`): `Promise`\<[`SimpleLoan`](../interfaces/SimpleLoan.md)\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:346](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L346)

Creates a profileless simple loan and returns canonical canister state plus
generated initial-deposit and repayment quote targets.

Choose `collateralPoolId` and `borrowPoolId` from
`client.market.listPools()`, convert UI amounts to base units with the
selected pool decimals, and call `client.quote.calculateLtv(...)` before
creation to block invalid LTV input.

`borrow.destination` receives the borrowed asset after the loan starts.
`refund.destination` receives collateral refunds or withdrawals. Use
`depositWindowSeconds` for the user-facing collateral deposit timeout; the
SDK maps it to the canister's internal `ltv_timer_s` field.
Pool assets and same-asset borrowing policy are validated before creation.

#### Parameters

##### request

[`CreateSimpleLoanRequest`](../interfaces/CreateSimpleLoanRequest.md)

Collateral, borrow, refund, LTV limit, timeout, and inflow options.

#### Returns

`Promise`\<[`SimpleLoan`](../interfaces/SimpleLoan.md)\>

Hydrated loan state plus generated initial-deposit and repayment quote targets.

***

### find()

> **find**(`query`): `Promise`\<[`SimpleLoanFindResult`](../interfaces/SimpleLoanFindResult.md)[]\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:433](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L433)

Finds simple loans by short reference, numeric loan id string, address, or transaction id.

Search returns lightweight matches. Call `get({ loanId })` or `get({ ref })`
when the user selects a match and you need hydrated loan state.

#### Parameters

##### query

`string`

Short reference, address, transaction id/hash, or numeric loan id string.

#### Returns

`Promise`\<[`SimpleLoanFindResult`](../interfaces/SimpleLoanFindResult.md)[]\>

Matching loan ids and references from the search index.

***

### get()

> **get**(`request`): `Promise`\<[`SimpleLoan`](../interfaces/SimpleLoan.md)\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:414](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L414)

Resolves canonical canister state by loan id or short reference.

References are decoded locally, then the corresponding loan id is loaded
from the Simple Loans canister.

#### Parameters

##### request

[`SimpleLoanGetRequest`](../type-aliases/SimpleLoanGetRequest.md)

Canister loan id or short public reference.

#### Returns

`Promise`\<[`SimpleLoan`](../interfaces/SimpleLoan.md)\>

Hydrated loan state plus generated initial-deposit and repayment quote targets.

***

### getConfig()

> **getConfig**(): `Promise`\<[`SimpleLoanConfig`](../interfaces/SimpleLoanConfig.md)\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:452](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L452)

Returns the active Simple Loans canister config via direct query.

#### Returns

`Promise`\<[`SimpleLoanConfig`](../interfaces/SimpleLoanConfig.md)\>

Active canister configuration.

***

### getEvent()

> **getEvent**(`eventId`): `Promise`\<[`SimpleLoanEvent`](../interfaces/SimpleLoanEvent.md) \| `null`\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:472](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L472)

Returns a single canister event by id via direct query.

#### Parameters

##### eventId

`bigint`

Event id to load.

#### Returns

`Promise`\<[`SimpleLoanEvent`](../interfaces/SimpleLoanEvent.md) \| `null`\>

The event when found, otherwise `null`.

***

### listAccessList()

> **listAccessList**(): `Promise`\<`string`[]\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:516](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L516)

Returns principals authorized for protected update callbacks.

#### Returns

`Promise`\<`string`[]\>

Principal text values on the canister access list.

***

### listEvents()

> **listEvents**(`request`): `Promise`\<[`SimpleLoanEvent`](../interfaces/SimpleLoanEvent.md)[]\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:494](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L494)

Returns a page of canister events via direct query.

#### Parameters

##### request

[`SimpleLoanListEventsRequest`](../interfaces/SimpleLoanListEventsRequest.md)

Start event id and maximum number of events to return.

#### Returns

`Promise`\<[`SimpleLoanEvent`](../interfaces/SimpleLoanEvent.md)[]\>

Canister events in ascending id order.

***

### listWarmedProfiles()

> **listWarmedProfiles**(): `Promise`\<[`SimpleLoanWarmedProfile`](../interfaces/SimpleLoanWarmedProfile.md)[]\>

Defined in: [packages/client/src/modules/simple-loans/simple-loans.ts:551](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/simple-loans.ts#L551)

Returns warmed profiles currently available for future simple loans.

#### Returns

`Promise`\<[`SimpleLoanWarmedProfile`](../interfaces/SimpleLoanWarmedProfile.md)[]\>

Warmed profile records available for assignment.
