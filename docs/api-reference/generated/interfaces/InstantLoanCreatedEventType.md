[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCreatedEventType

# Interface: InstantLoanCreatedEventType

Defined in: [packages/client/src/modules/instant-loans/types.ts:255](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L255)

Loan-created instant-loan event payload.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:260](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L260)

***

### borrowAsset

> **borrowAsset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:267](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L267)

***

### borrowDestination

> **borrowDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:258](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L258)

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:266](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L266)

***

### collateralAsset

> **collateralAsset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:259](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L259)

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:261](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L261)

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:264](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L264)

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:257](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L257)

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:263](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L263)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:265](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L265)

***

### refundDestination

> **refundDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:262](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L262)

***

### type

> **type**: `"LoanCreated"`

Defined in: [packages/client/src/modules/instant-loans/types.ts:256](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L256)
