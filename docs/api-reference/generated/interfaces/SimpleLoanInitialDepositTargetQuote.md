[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanInitialDepositTargetQuote

# Interface: SimpleLoanInitialDepositTargetQuote

Defined in: [packages/client/src/modules/simple-loans/types.ts:337](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L337)

Fee-inclusive collateral deposit quote for one transfer target.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:339](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L339)

Full amount to send to the collateral deposit target, including fee.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:341](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L341)

Inflow fee amount in base units added to the transfer amount. Native ETH falls back to 0.00025 ETH when the live estimate fails or is non-positive.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:343](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L343)

Address or ICRC account where the collateral should be sent.
