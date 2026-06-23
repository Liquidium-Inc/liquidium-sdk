[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InflowActivity

# Interface: InflowActivity

Defined in: [packages/client/src/modules/activities/types.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L56)

Deposit or repayment activity returned by the activity API.

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

> **status**: [`InflowActivityStatus`](../type-aliases/InflowActivityStatus.md)

Defined in: [packages/client/src/modules/activities/types.ts:58](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L58)

Shared consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: [packages/client/src/modules/activities/types.ts:50](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L50)

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: [`ActivityTopUp`](ActivityTopUp.md)

Defined in: [packages/client/src/modules/activities/types.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L60)

Fee top-up state when the inflow is below the current processing fee.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [packages/client/src/modules/activities/types.ts:52](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L52)

Chain transaction ids associated with the activity when available.

#### Inherited from

`BaseActivity.txids`
