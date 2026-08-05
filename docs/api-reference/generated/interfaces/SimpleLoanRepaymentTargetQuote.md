[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanRepaymentTargetQuote

# Interface: SimpleLoanRepaymentTargetQuote

Defined in: [packages/client/src/modules/simple-loans/types.ts:377](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L377)

Fee-inclusive repayment quote for one transfer target.

## Properties

### amount

> **amount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:379](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L379)

Full amount to send to the repayment target, including fee and interest buffer.

***

### inflowFeeAmount

> **inflowFeeAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:381](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L381)

Inflow fee amount in base units added to the repayment transfer. Native ETH falls back to 0.00025 ETH when the live estimate fails or is non-positive.

***

### inflowFeeEstimateAvailable

> **inflowFeeEstimateAvailable**: `boolean`

Defined in: [packages/client/src/modules/simple-loans/types.ts:383](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L383)

Whether `inflowFeeAmount` came from a live fee estimate.

***

### target

> **target**: [`SupplyTarget`](../type-aliases/SupplyTarget.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:385](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L385)

Address or ICRC account where the repayment should be sent.
