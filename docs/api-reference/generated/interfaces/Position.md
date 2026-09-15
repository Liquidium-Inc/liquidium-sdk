[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / Position

# Interface: Position

Defined in: packages/client/src/modules/positions/types.ts:5

Current profile position in one lending pool.

## Properties

### asset

> **asset**: [`Asset`](../type-aliases/Asset.md)

Defined in: packages/client/src/modules/positions/types.ts:9

Pool asset symbol.

***

### borrowed

> **borrowed**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:15

Borrowed principal in base units.

***

### borrowedDecimals

> **borrowedDecimals**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:17

Decimal scale for borrowed amounts.

***

### debtInterest

> **debtInterest**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:21

Accrued borrow interest in base units.

***

### deposited

> **deposited**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:11

Current supplied amount in base units.

***

### depositedDecimals

> **depositedDecimals**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:13

Decimal scale for supplied amounts.

***

### earnedInterest

> **earnedInterest**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:19

Accrued supply interest in base units.

***

### lastUpdate

> **lastUpdate**: `bigint`

Defined in: packages/client/src/modules/positions/types.ts:23

Unix timestamp in seconds of the last position update.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/positions/types.ts:7

Pool principal text.
