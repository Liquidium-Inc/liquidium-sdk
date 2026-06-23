[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowActivity

# Interface: OutflowActivity

Defined in: [packages/client/src/modules/activities/types.ts:64](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L64)

Borrow or withdrawal activity returned by the activity API.

## Extends

- `BaseActivity`

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/activities/types.ts:49](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L49)

#### Inherited from

`BaseActivity.amount`

***

### asset

> **asset**: `string` \| `null`

Defined in: [packages/client/src/modules/activities/types.ts:47](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L47)

#### Inherited from

`BaseActivity.asset`

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md) \| `null`

Defined in: [packages/client/src/modules/activities/types.ts:48](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L48)

#### Inherited from

`BaseActivity.chain`

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:45](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L45)

#### Inherited from

`BaseActivity.id`

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:46](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L46)

#### Inherited from

`BaseActivity.poolId`

***

### status

> **status**: [`OutflowActivityStatus`](../type-aliases/OutflowActivityStatus.md)

Defined in: [packages/client/src/modules/activities/types.ts:66](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L66)

Shared consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: [packages/client/src/modules/activities/types.ts:50](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L50)

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: `undefined`

Defined in: [packages/client/src/modules/activities/types.ts:68](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L68)

Outflows never carry top-up state.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [packages/client/src/modules/activities/types.ts:52](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L52)

Chain transaction ids associated with the activity when available.

#### Inherited from

`BaseActivity.txids`
