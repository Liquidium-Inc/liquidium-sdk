[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCollateral

# Interface: InstantLoanCollateral

Defined in: [packages/client/src/modules/instant-loans/types.ts:387](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L387)

Collateral leg selected for an instant loan.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:397](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L397)

Intended credited collateral amount in base units, before inflow fees.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:391](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L391)

Collateral asset symbol.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:393](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L393)

Chain used for collateral deposits.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:395](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L395)

Decimal scale for collateral amounts.

***

### poolId

> **poolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:389](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L389)

Principal text of the collateral pool.
