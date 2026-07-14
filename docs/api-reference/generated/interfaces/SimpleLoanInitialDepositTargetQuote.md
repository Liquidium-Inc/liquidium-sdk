[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanInitialDepositTargetQuote

# Interface: SimpleLoanInitialDepositTargetQuote

Defined in: [packages/client/src/modules/simple-loans/types.ts:335](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L335)

Fee-inclusive collateral deposit quote for one transfer target.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:337](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L337)

Full amount to send to the collateral deposit target, including fee.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:339](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L339)

Inflow fee amount in base units added to the transfer amount.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:341](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L341)

Address or ICRC account where the collateral should be sent.
