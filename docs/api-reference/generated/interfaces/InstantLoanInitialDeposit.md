[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanInitialDeposit

# Interface: InstantLoanInitialDeposit

Defined in: [packages/client/src/modules/instant-loans/types.ts:252](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L252)

Initial collateral deposit quote returned when an instant loan is created.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:254](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L254)

Full amount to send to the deposit target, including the estimated inflow fee.

***

### asset

> **asset**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:260](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L260)

Collateral asset to deposit.

***

### chain

> **chain**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:262](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L262)

Chain used for the collateral deposit.

***

### collateralAmount

> **collateralAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:256](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L256)

Intended credited collateral amount in base units, before inflow fees.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:258](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L258)

Inflow fee amount in base units added to the transfer amount.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:264](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L264)

Address or ICRC account where the collateral should be sent.
