[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / OutflowActivity

# Interface: OutflowActivity

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:109](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L109)

Borrow or withdraw activity returned by the activity API.

## Extends

- `BaseActivity`

## Properties

### amount

> **amount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:88](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L88)

#### Inherited from

`BaseActivity.amount`

***

### asset

> **asset**: `string` \| `null`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:86](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L86)

#### Inherited from

`BaseActivity.asset`

***

### chain

> **chain**: [`Chain`](../type-aliases/Chain.md) \| `null`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:87](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L87)

#### Inherited from

`BaseActivity.chain`

***

### confirmations

> **confirmations**: `number` \| `null`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:92](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L92)

#### Inherited from

`BaseActivity.confirmations`

***

### direction

> **direction**: `"outflow"`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:111](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L111)

Direction discriminator.

***

### id

> **id**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:84](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L84)

#### Inherited from

`BaseActivity.id`

***

### kind

> **kind**: [`OutflowActivityKind`](../type-aliases/OutflowActivityKind.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:113](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L113)

Borrow or withdraw kind.

***

### poolId

> **poolId**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:85](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L85)

#### Inherited from

`BaseActivity.poolId`

***

### requiredConfirmations

> **requiredConfirmations**: `number` \| `null`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:93](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L93)

#### Inherited from

`BaseActivity.requiredConfirmations`

***

### status

> **status**: [`OutflowActivityStatus`](../type-aliases/OutflowActivityStatus.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:115](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L115)

Single consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:89](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L89)

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: `undefined`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:117](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L117)

Outflows never carry top-up state.

***

### txid

> **txid**: `string` \| `null`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:90](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L90)

#### Inherited from

`BaseActivity.txid`

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:91](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L91)

#### Inherited from

`BaseActivity.txids`
