[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanCreatedEventType

# Interface: SimpleLoanCreatedEventType

Defined in: [packages/client/src/modules/simple-loans/types.ts:269](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L269)

Simple-loan-created event payload.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:274](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L274)

***

### borrowAsset

> **borrowAsset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:281](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L281)

***

### borrowDestination

> **borrowDestination**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:272](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L272)

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:280](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L280)

***

### collateralAsset

> **collateralAsset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:273](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L273)

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:275](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L275)

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:278](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L278)

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:271](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L271)

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:277](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L277)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:279](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L279)

***

### refundDestination

> **refundDestination**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:276](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L276)

***

### type

> **type**: `"LoanCreated"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:270](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L270)
