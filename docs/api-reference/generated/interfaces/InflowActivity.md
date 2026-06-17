[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InflowActivity

# Interface: InflowActivity

Defined in: [packages/client/src/modules/activities/types.ts:66](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L66)

Deposit or repayment activity returned by the activity API.

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

> **direction**: `"inflow"`

Defined in: [packages/client/src/modules/activities/types.ts:68](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L68)

Direction discriminator.

***

### id

> **id**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:55](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L55)

#### Inherited from

`BaseActivity.id`

***

### kind

> **kind**: [`InflowActivityKind`](../type-aliases/InflowActivityKind.md)

Defined in: [packages/client/src/modules/activities/types.ts:70](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L70)

Deposit or repayment kind.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/activities/types.ts:56](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L56)

#### Inherited from

`BaseActivity.poolId`

***

### status

> **status**: [`LiquidiumStatus`](LiquidiumStatus.md)

Defined in: [packages/client/src/modules/activities/types.ts:72](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L72)

Shared consumer-facing lifecycle status.

***

### timestampMs

> **timestampMs**: `number`

Defined in: [packages/client/src/modules/activities/types.ts:60](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L60)

#### Inherited from

`BaseActivity.timestampMs`

***

### topUp?

> `optional` **topUp?**: [`ActivityTopUp`](ActivityTopUp.md)

Defined in: [packages/client/src/modules/activities/types.ts:74](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L74)

Fee top-up state when the inflow is below the current processing fee.

***

### txids?

> `optional` **txids?**: `string`[]

Defined in: [packages/client/src/modules/activities/types.ts:62](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/activities/types.ts#L62)

Chain transaction ids associated with the activity when available.

#### Inherited from

`BaseActivity.txids`
