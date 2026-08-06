[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanCollateral

# Interface: SimpleLoanCollateral

Defined in: packages/client/src/modules/simple-loans/types.ts:447

Collateral leg selected for a simple loan.

## Properties

### amount

> **amount**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:455

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: packages/client/src/modules/simple-loans/types.ts:451

Asset deposited as collateral. Transfer rails are exposed by `initialDeposit.targets`.

***

### decimals

> **decimals**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:453

Decimal scale for collateral amounts.

***

### poolId

> **poolId**: `string`

Defined in: packages/client/src/modules/simple-loans/types.ts:449

Principal text of the collateral pool.
