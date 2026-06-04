[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanInitialDeposit

# Interface: InstantLoanInitialDeposit

Defined in: [packages/client/src/modules/instant-loans/types.ts:304](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L304)

Initial collateral deposit quote returned when an instant loan is created.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:306](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L306)

Full amount to send to the deposit target, including the estimated inflow fee.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:314](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L314)

Collateral asset to deposit.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:316](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L316)

Chain used for the collateral deposit.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:310](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L310)

Intended credited collateral amount in base units, before inflow fees.

***

### decimals

> **decimals**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:308](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L308)

Decimal scale for `amount`, `collateralAmount`, and `inflowFeeAmount`.

***

### detectedTimestamp

> **detectedTimestamp**: `bigint` \| `null`

Defined in: [packages/client/src/modules/instant-loans/types.ts:320](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L320)

Unix timestamp in seconds when the collateral deposit was detected, or null before detection.

***

### expiryTimestamp

> **expiryTimestamp**: `bigint` \| `null`

Defined in: [packages/client/src/modules/instant-loans/types.ts:322](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L322)

Unix timestamp in seconds when the collateral deposit window expires, or null when unavailable.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:312](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L312)

Inflow fee amount in base units added to the transfer amount.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:318](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L318)

Address or ICRC account where the collateral should be sent.
