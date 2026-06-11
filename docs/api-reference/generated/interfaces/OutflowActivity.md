[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowActivity

# Interface: OutflowActivity

Defined in: [packages/client/src/modules/activities/types.ts:80](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L80)

Borrow or withdraw activity returned by the activity API.

## Extends

- `BaseActivity`

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/activities/types.ts:59](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L59)

#### Inherited from

`BaseActivity.amount`

***

### asset

> **asset**: `string` \| `null`

Defined in: [packages/client/src/modules/activities/types.ts:57](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L57)

#### Inherited from

`BaseActivity.asset`

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md) \| `null`

Defined in: [packages/client/src/modules/activities/types.ts:58](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L58)

#### Inherited from

`BaseActivity.chain`

***

### confirmations

> **confirmations**: `number` \| `null`

Defined in: [packages/client/src/modules/activities/types.ts:63](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L63)

#### Inherited from

`BaseActivity.confirmations`

***

### direction

> **direction**: `"outflow"`

Defined in: [packages/client/src/modules/activities/types.ts:82](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L82)

Direction discriminator.

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L55)

#### Inherited from

`BaseActivity.id`

***

### kind

> **kind**: [`OutflowActivityKind`](../type-aliases/OutflowActivityKind.md)

Defined in: [packages/client/src/modules/activities/types.ts:84](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L84)

Borrow or withdraw kind.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L56)

#### Inherited from

`BaseActivity.poolId`

***

### requiredConfirmations

> **requiredConfirmations**: `number` \| `null`

Defined in: [packages/client/src/modules/activities/types.ts:64](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L64)

#### Inherited from

`BaseActivity.requiredConfirmations`

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/activities/types.ts:86](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L86)

Shared consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: [packages/client/src/modules/activities/types.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L60)

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: `undefined`

Defined in: [packages/client/src/modules/activities/types.ts:88](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L88)

Outflows never carry top-up state.

***

### txid

> **txid**: `string` \| `null`

Defined in: [packages/client/src/modules/activities/types.ts:61](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L61)

#### Inherited from

`BaseActivity.txid`

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [packages/client/src/modules/activities/types.ts:62](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L62)

#### Inherited from

`BaseActivity.txids`
