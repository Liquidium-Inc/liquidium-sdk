[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanFindCollateral

# Interface: SimpleLoanFindCollateral

Defined in: [packages/client/src/modules/simple-loans/types.ts:174](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L174)

Collateral leg returned by Simple Loans search.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L180)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: `"BTC"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:178](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L178)

Asset the user deposits as collateral.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:176](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L176)

Principal text of the collateral pool.
