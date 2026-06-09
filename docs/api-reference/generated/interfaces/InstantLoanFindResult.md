[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanFindResult

# Interface: InstantLoanFindResult

Defined in: [packages/client/src/modules/instant-loans/types.ts:433](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L433)

Hydrated instant-loan lookup result with production-style activity state.

## Properties

### activities

> **activities**: [`Activity`](../type-aliases/Activity.md)[]

Defined in: [packages/client/src/modules/instant-loans/types.ts:437](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L437)

Active and completed deposit, borrow, repay, and withdraw activities.

***

### loan

> **loan**: [`InstantLoan`](InstantLoan.md)

Defined in: [packages/client/src/modules/instant-loans/types.ts:435](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L435)

Canonical hydrated instant-loan state and transfer targets.
