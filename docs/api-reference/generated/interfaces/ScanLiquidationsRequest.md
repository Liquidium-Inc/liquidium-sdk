[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / ScanLiquidationsRequest

# Interface: ScanLiquidationsRequest

Defined in: packages/client/src/modules/liquidations/types.ts:4

Fields used to scan for liquidation candidates.

## Properties

### cursor?

> `optional` **cursor?**: `string`

Defined in: packages/client/src/modules/liquidations/types.ts:6

Resume after this borrower profile principal. Omit for the first page.

***

### maxResults

> **maxResults**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:10

Maximum number of liquidatable borrowers to return. Must fit a positive nat64.

***

### scanLimit

> **scanLimit**: `bigint`

Defined in: packages/client/src/modules/liquidations/types.ts:8

Maximum number of borrower accounts to examine. Must fit a positive nat64.
