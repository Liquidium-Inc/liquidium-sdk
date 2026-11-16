[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / LiquidationScanResult

# Interface: LiquidationScanResult

Defined in: packages/client/src/modules/liquidations/types.ts:51

One cursor page of liquidation candidates.

## Properties

### candidates

> **candidates**: [`LiquidationCandidate`](LiquidationCandidate.md)[]

Defined in: packages/client/src/modules/liquidations/types.ts:53

Liquidatable borrowers found in this scan.

***

### nextCursor?

> `optional` **nextCursor?**: `string`

Defined in: packages/client/src/modules/liquidations/types.ts:57

Cursor for the next scan page, or undefined at the end.

***

### scanned

> **scanned**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:55

Borrower accounts examined in this scan.
