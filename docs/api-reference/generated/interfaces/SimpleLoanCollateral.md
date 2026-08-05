[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanCollateral

# Interface: SimpleLoanCollateral

Defined in: [packages/client/src/modules/simple-loans/types.ts:447](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L447)

Collateral leg selected for a simple loan.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:455](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L455)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:451](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L451)

Asset deposited as collateral. Transfer rails are exposed by `initialDeposit.targets`.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:453](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L453)

Decimal scale for collateral amounts.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:449](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L449)

Principal text of the collateral pool.
