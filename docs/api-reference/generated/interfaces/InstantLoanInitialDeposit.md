[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanInitialDeposit

# Interface: InstantLoanInitialDeposit

Defined in: [packages/client/src/modules/instant-loans/types.ts:338](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L338)

Initial collateral deposit quote returned when an instant loan is created.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:340](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L340)

Full amount to send to the deposit target, including the estimated inflow fee.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:348](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L348)

Collateral asset to deposit.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:350](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L350)

Chain used for the collateral deposit.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:344](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L344)

Intended credited collateral amount in base units, before inflow fees.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:342](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L342)

Decimal scale for `amount`, `collateralAmount`, and `inflowFeeAmount`.

***

### detectedTimestamp

> **detectedTimestamp**: `bigint` \| `null`

Defined in: [packages/client/src/modules/instant-loans/types.ts:354](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L354)

Unix timestamp in seconds when the collateral deposit was detected, or null before detection.

***

### expiryTimestamp

> **expiryTimestamp**: `bigint` \| `null`

Defined in: [packages/client/src/modules/instant-loans/types.ts:356](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L356)

Unix timestamp in seconds when the collateral deposit window expires, or null before detection when unavailable.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:346](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L346)

Inflow fee amount in base units added to the transfer amount.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:352](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L352)

Address or ICRC account where the collateral should be sent.
