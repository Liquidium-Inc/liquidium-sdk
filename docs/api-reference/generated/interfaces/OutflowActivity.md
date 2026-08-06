[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowActivity

# Interface: OutflowActivity

Defined in: packages/client/src/modules/activities/types.ts:64

Borrow or withdrawal activity returned by the activity API.

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

> **status**: [`OutflowActivityStatus`](../type-aliases/OutflowActivityStatus.md)

Defined in: packages/client/src/modules/activities/types.ts:66

Shared consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: packages/client/src/modules/activities/types.ts:50

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: `undefined`

Defined in: packages/client/src/modules/activities/types.ts:68

Outflows never carry top-up state.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: packages/client/src/modules/activities/types.ts:52

Chain transaction ids associated with the activity when available.

#### Inherited from

`BaseActivity.txids`
