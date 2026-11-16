[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InflowRefundState

# Variable: InflowRefundState

> `const` **InflowRefundState**: `object`

Defined in: packages/client/src/modules/activities/types.ts:27

Refund outcome for a failed inflow.

## Type Declaration

### none

> `readonly` **none**: `"none"` = `"none"`

The protocol does not refund this failure.

### recoverable

> `readonly` **recoverable**: `"recoverable"` = `"recoverable"`

The protocol refunds this failure to the profile recovery balance for the pool.

### recovered

> `readonly` **recovered**: `"recovered"` = `"recovered"`

A recovery withdrew the pool's recovery balance after this failure.
