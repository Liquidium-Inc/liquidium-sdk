[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowActivity

# Interface: OutflowActivity

Defined in: [packages/client/src/modules/activities/types.ts:78](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L78)

Borrow or withdrawal activity returned by the activity API.

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

### direction

> **direction**: `"outflow"`

Defined in: [packages/client/src/modules/activities/types.ts:80](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L80)

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

Defined in: [packages/client/src/modules/activities/types.ts:82](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L82)

Borrow or withdrawal kind.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L56)

#### Inherited from

`BaseActivity.poolId`

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/activities/types.ts:84](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L84)

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

Defined in: [packages/client/src/modules/activities/types.ts:86](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L86)

Outflows never carry top-up state.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [packages/client/src/modules/activities/types.ts:62](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L62)

Chain transaction ids associated with the activity when available.

#### Inherited from

`BaseActivity.txids`
