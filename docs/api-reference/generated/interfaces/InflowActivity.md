[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InflowActivity

# Interface: InflowActivity

Defined in: packages/client/src/modules/activities/types.ts:56

Deposit or repayment activity returned by the activity API.

## Extends

- `BaseActivity`

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/activities/types.ts:49

#### Inherited from

`BaseActivity.amount`

***

### asset

> **asset**: `string` \| `null`

Defined in: packages/client/src/modules/activities/types.ts:47

#### Inherited from

`BaseActivity.asset`

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md) \| `null`

Defined in: packages/client/src/modules/activities/types.ts:48

#### Inherited from

`BaseActivity.chain`

***

### id

> **id**: `string`

Defined in: packages/client/src/modules/activities/types.ts:45

#### Inherited from

`BaseActivity.id`

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/activities/types.ts:46

#### Inherited from

`BaseActivity.poolId`

***

### status

> **status**: [`InflowActivityStatus`](../type-aliases/InflowActivityStatus.md)

Defined in: packages/client/src/modules/activities/types.ts:58

Shared consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: packages/client/src/modules/activities/types.ts:50

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: [`ActivityTopUp`](ActivityTopUp.md)

Defined in: packages/client/src/modules/activities/types.ts:60

Fee top-up state when the inflow is below the current processing fee.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: packages/client/src/modules/activities/types.ts:52

Chain transaction ids associated with the activity when available.

#### Inherited from

`BaseActivity.txids`
