[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanInitialDepositTargetQuote

# Interface: SimpleLoanInitialDepositTargetQuote

Defined in: [packages/client/src/modules/simple-loans/types.ts:367](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L367)

Fee-inclusive collateral deposit quote for one transfer target.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:369](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L369)

Full amount to send to the collateral deposit target, including fee.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:371](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L371)

Inflow fee amount in base units added to the transfer amount. Native ETH falls back to 0.00025 ETH when the live estimate fails or is non-positive.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:373](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L373)

Address or ICRC account where the collateral should be sent.
