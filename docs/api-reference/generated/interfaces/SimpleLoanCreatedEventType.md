[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanCreatedEventType

# Interface: SimpleLoanCreatedEventType

Defined in: [packages/client/src/modules/simple-loans/types.ts:251](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L251)

Simple-loan-created event payload.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:256](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L256)

***

### borrowAsset

> **borrowAsset**: `"BTC"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:263](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L263)

***

### borrowDestination

> **borrowDestination**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:254](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L254)

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:262](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L262)

***

### collateralAsset

> **collateralAsset**: `"BTC"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:255](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L255)

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:257](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L257)

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:260](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L260)

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:253](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L253)

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: [packages/client/src/modules/simple-loans/types.ts:259](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L259)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/simple-loans/types.ts:261](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L261)

***

### refundDestination

> **refundDestination**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: [packages/client/src/modules/simple-loans/types.ts:258](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L258)

***

### type

> **type**: `"LoanCreated"`

Defined in: [packages/client/src/modules/simple-loans/types.ts:252](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/simple-loans/types.ts#L252)
