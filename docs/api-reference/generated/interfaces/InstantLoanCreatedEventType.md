[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanCreatedEventType

# Interface: InstantLoanCreatedEventType

Defined in: [packages/client/src/modules/instant-loans/types.ts:194](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L194)

Loan-created instant-loan event payload.

## Properties

### borrowAmount

> **borrowAmount**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:199](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L199)

***

### borrowAsset

> **borrowAsset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:206](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L206)

***

### borrowDestination

> **borrowDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:197](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L197)

***

### borrowPoolId

> **borrowPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:205](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L205)

***

### collateralAsset

> **collateralAsset**: [`InstantLoanAsset`](../type-aliases/InstantLoanAsset.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:198](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L198)

***

### collateralPoolId

> **collateralPoolId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:200](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L200)

***

### depositWindowSeconds

> **depositWindowSeconds**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:203](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L203)

***

### loanId

> **loanId**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:196](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L196)

***

### ltvMaxBps

> **ltvMaxBps**: `bigint`

Defined in: [packages/client/src/modules/instant-loans/types.ts:202](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L202)

***

### profileId

> **profileId**: `string`

Defined in: [packages/client/src/modules/instant-loans/types.ts:204](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L204)

***

### refundDestination

> **refundDestination**: [`InstantLoanAccount`](../type-aliases/InstantLoanAccount.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:201](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L201)

***

### type

> **type**: `"LoanCreated"`

Defined in: [packages/client/src/modules/instant-loans/types.ts:195](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L195)
