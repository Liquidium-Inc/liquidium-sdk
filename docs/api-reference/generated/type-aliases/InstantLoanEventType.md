[**@liquidium/client**](../README.md)

***

[@liquidium/client](../README.md) / InstantLoanEventType

# Type Alias: InstantLoanEventType

> **InstantLoanEventType** = \{ `borrowAmount`: `bigint`; `borrowAsset`: [`InstantLoanAsset`](InstantLoanAsset.md); `borrowDestination`: [`InstantLoanAccount`](InstantLoanAccount.md); `borrowPoolId`: `string`; `collateralAsset`: [`InstantLoanAsset`](InstantLoanAsset.md); `collateralPoolId`: `string`; `depositWindowSeconds`: `bigint`; `loanId`: `bigint`; `ltvMaxBps`: `bigint`; `profileId`: `string`; `refundDestination`: [`InstantLoanAccount`](InstantLoanAccount.md); `type`: `"LoanCreated"`; \} \| \{ `account`: [`InstantLoanAccount`](InstantLoanAccount.md); `loanId`: `bigint`; `poolId`: `string`; `type`: `"FullLendWithdrawalRequested"`; \} \| \{ `account`: [`InstantLoanAccount`](InstantLoanAccount.md); `amount`: `bigint`; `loanId`: `bigint`; `poolId`: `string`; `type`: `"BorrowRequested"`; \} \| \{ `loanId`: `bigint`; `type`: `"DepositTimerExceeded"`; \} \| \{ `account`: [`InstantLoanAccount`](InstantLoanAccount.md); `amount`: `bigint`; `leg`: [`InstantLoanLeg`](InstantLoanLeg.md); `loanId`: `bigint`; `poolId`: `string`; `type`: `"StuckFundsWithdrawalRequested"`; \} \| \{ `derivationIndex`: `Uint8Array`; `ethAddress`: `string`; `profileId`: `string`; `type`: `"ProfileWarmed"`; `warmedProfileId`: `bigint`; \} \| \{ `loanId`: `bigint`; `profileId`: `string`; `type`: `"RepayComplete"`; \} \| \{ `loanId`: `bigint`; `timestamp`: `bigint`; `type`: `"DepositTimerStarted"`; \}

Defined in: [packages/client/src/modules/instant-loans/types.ts:180](https://github.com/Liquidium-Inc/liquidium-sdk/blob/main/packages/client/src/modules/instant-loans/types.ts#L180)

Direct canister event payload returned by instant-loans event queries.
