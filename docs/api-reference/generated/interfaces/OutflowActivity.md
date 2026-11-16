[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowActivity

# Interface: OutflowActivity

Defined in: packages/client/src/modules/activities/types.ts:89

Borrow or withdrawal activity returned by the activity API.

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

> `optional` **failure?**: `undefined`

Defined in: packages/client/src/modules/activities/types.ts:95

Outflows never carry inflow rejection details.

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

> **status**: [`OutflowActivityStatus`](../type-aliases/OutflowActivityStatus.md)

Defined in: packages/client/src/modules/activities/types.ts:91

Shared consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: packages/client/src/modules/activities/types.ts:73

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: `undefined`

Defined in: packages/client/src/modules/activities/types.ts:93

Outflows never carry top-up state.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: packages/client/src/modules/activities/types.ts:75

Chain transaction ids associated with the activity when available.

#### Inherited from

`BaseActivity.txids`
