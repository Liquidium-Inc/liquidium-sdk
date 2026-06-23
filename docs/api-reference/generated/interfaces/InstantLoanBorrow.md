[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanBorrow

# Interface: InstantLoanBorrow

Defined in: [packages/client/src/modules/instant-loans/types.ts:425](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L425)

Borrow leg selected for an instant loan.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:435](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L435)

Requested borrow amount in base units.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:429](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L429)

Borrow asset symbol.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:431](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L431)

Chain used for repayment.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:433](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L433)

Decimal scale for borrow and debt amounts.

***

### destination

> **destination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:437](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L437)

Destination that receives the borrowed asset.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:427](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L427)

Principal text of the borrow pool.
