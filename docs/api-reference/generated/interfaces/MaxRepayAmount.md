[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / MaxRepayAmount

# Interface: MaxRepayAmount

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:99](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L99)

Full repayment amount for a position, including any requested buffer.

## Properties

### amount

> **amount**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:101](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L101)

Amount to repay in the borrowed asset's base units.

***

### decimals

> **decimals**: `bigint`

Defined in: [external/liquidium-sdk/packages/client/src/modules/positions/types.ts:103](https://github.com/Liquidium-Inc/liquidium-sdk/blob/d95ecc3871409e06258f6093c589e6bd64be7565/packages/client/src/modules/positions/types.ts#L103)

Decimal scale for `amount`.
