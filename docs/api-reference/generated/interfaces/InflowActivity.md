[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InflowActivity

# Interface: InflowActivity

Defined in: packages/client/src/modules/activities/types.ts:79

Deposit or repayment activity returned by the activity API.

## Extends

- `BaseActivity`

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/activities/types.ts:72

#### Inherited from

`BaseActivity.amount`

***

### asset

> **asset**: `string` \| `null`

Defined in: packages/client/src/modules/activities/types.ts:70

#### Inherited from

`BaseActivity.asset`

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md) \| `null`

Defined in: packages/client/src/modules/activities/types.ts:71

#### Inherited from

`BaseActivity.chain`

***

### failure?

> `optional` **failure?**: [`InflowActivityFailure`](InflowActivityFailure.md)

Defined in: packages/client/src/modules/activities/types.ts:85

Protocol rejection details when `status.state` is `failed`.

***

### id

> **id**: `string`

Defined in: packages/client/src/modules/activities/types.ts:68

#### Inherited from

`BaseActivity.id`

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/activities/types.ts:69

#### Inherited from

`BaseActivity.poolId`

***

### status

> **status**: [`InflowActivityStatus`](../type-aliases/InflowActivityStatus.md)

Defined in: packages/client/src/modules/activities/types.ts:81

Shared consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: packages/client/src/modules/activities/types.ts:73

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: [`ActivityTopUp`](ActivityTopUp.md)

Defined in: packages/client/src/modules/activities/types.ts:83

Fee top-up state when the inflow is below the current processing fee.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: packages/client/src/modules/activities/types.ts:75

Chain transaction ids associated with the activity when available.

#### Inherited from

`BaseActivity.txids`
