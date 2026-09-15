[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / SimpleLoanCreatedEventType

# Interface: SimpleLoanCreatedEventType

Defined in: packages/client/src/modules/simple-loans/types.ts:269

Simple-loan-created event payload.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:274

***

### borrowAsset

> **borrowAsset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: packages/client/src/modules/simple-loans/types.ts:281

***

### borrowDestination

> **borrowDestination**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: packages/client/src/modules/simple-loans/types.ts:272

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: packages/client/src/modules/simple-loans/types.ts:280

***

### collateralAsset

> **collateralAsset**: `"BTC"` \| `"ETH"` \| `"ICP"` \| `"USDC"` \| `"USDT"`

Defined in: packages/client/src/modules/simple-loans/types.ts:273

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: packages/client/src/modules/simple-loans/types.ts:275

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:278

***

### loanId

> **loanId**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:271

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: packages/client/src/modules/simple-loans/types.ts:277

***

### profileId

> **profileId**: `string`

Defined in: packages/client/src/modules/simple-loans/types.ts:279

***

### refundDestination

> **refundDestination**: [`LiquidiumAccount`](../type-aliases/LiquidiumAccount.md)

Defined in: packages/client/src/modules/simple-loans/types.ts:276

***

### type

> **type**: `"LoanCreated"`

Defined in: packages/client/src/modules/simple-loans/types.ts:270
