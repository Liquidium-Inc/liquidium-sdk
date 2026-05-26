[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InflowActivity

# Interface: InflowActivity

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:97](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L97)

Deposit or repayment activity returned by the activity API.

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

> **direction**: `"inflow"`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:99](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L99)

Direction discriminator.

***

### id

> **id**: `string`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:84](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L84)

#### Inherited from

`BaseActivity.id`

***

### kind

> **kind**: [`InflowActivityKind`](../type-aliases/InflowActivityKind.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:101](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L101)

Deposit or repayment kind.

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

> **status**: [`InflowActivityStatus`](../type-aliases/InflowActivityStatus.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:103](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L103)

Single consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:89](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L89)

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: [`ActivityTopUp`](ActivityTopUp.md)

Defined in: [external/liquidium-sdk/packages/client/src/modules/activities/types.ts:105](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/activities/types.ts#L105)

Fee top-up state when the inflow is below the current processing fee.

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
