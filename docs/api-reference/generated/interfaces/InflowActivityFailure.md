[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InflowActivityFailure

# Interface: InflowActivityFailure

Defined in: packages/client/src/modules/activities/types.ts:40

Protocol rejection details for a failed inflow.

## Properties

### code

> **code**: `string`

Defined in: packages/client/src/modules/activities/types.ts:42

Rejection code in lower_snake_case, such as `position_not_found`.

***

### message

> **message**: `string` \| `null`

Defined in: packages/client/src/modules/activities/types.ts:44

Readable rejection reason when Liquidium stored one.

***

### refund

> **refund**: [`InflowRefundState`](../type-aliases/InflowRefundState.md)

Defined in: packages/client/src/modules/activities/types.ts:46

Whether the rejected amount can be withdrawn with `lending.recover(...)`.
