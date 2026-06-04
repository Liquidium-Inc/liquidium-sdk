[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCollateral

# Interface: InstantLoanCollateral

Defined in: [packages/client/src/modules/instant-loans/types.ts:364](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L364)

Collateral leg selected for an instant loan.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:374](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L374)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:368](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L368)

Collateral asset symbol.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:370](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L370)

Chain used for collateral deposits.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:372](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L372)

Decimal scale for collateral amounts.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:366](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L366)

Principal text of the collateral pool.
