# SDK Method Drift Notes

This note records the method-shape and terminology drift that was resolved by the breaking SDK cleanup.

## Resolved Changes

### History State Filters

`UserTransactionHistoryFilters.states` now uses `UserTransactionHistoryState[]` instead of the full `LiquidiumState[]` union.

The supported filter states are:

```ts
"action_required" | "confirming" | "processing" | "completed" | "failed"
```

`active` and `expired` are excluded at the type level. Runtime validation still rejects unsupported values for JavaScript callers.

References:

- `packages/client/src/modules/history/types.ts`
- `packages/client/src/modules/history/history.ts`

### Canonical Operation Names

Public method surfaces now use the same operation vocabulary as `LiquidiumStatus.operation`:

```ts
"deposit" | "borrow" | "repayment" | "withdrawal" | "liquidation"
```

Changes:

- `ActivityKind.withdraw` became `ActivityKind.withdrawal`.
- `UserTransactionHistoryType` now uses `deposit`, `repayment`, and `withdrawal` instead of `supply`, `repay`, and `withdraw`.
- `OutflowType.withdraw` became `OutflowType.withdrawal`.
- `InflowSubmitType` was removed.
- Direct `lending.submitInflow(...)` now requires `operation: "deposit" | "repayment"`.
- `SupplyFlow.submit(...)` derives the operation from the flow action.

References:

- `packages/client/src/core/status.ts`
- `packages/client/src/core/types.ts`
- `packages/client/src/modules/activities/types.ts`
- `packages/client/src/modules/history/types.ts`
- `packages/client/src/modules/lending/types.ts`
- `packages/client/src/modules/lending/lending.ts`

### Instant-Loan Repayment Shape

The root `README.md` now matches the SDK source, package README, examples, generated API docs, and skill guidance:

- `loan.repayment` is always present.
- `loan.repayment.amount === 0n` means no repayment is due.
- Consumers should not model `loan.repayment` as nullable.

References:

- `README.md`
- `packages/client/src/modules/instant-loans/types.ts`
- `packages/client/src/modules/instant-loans/instant-loans.ts`
- `packages/client/README.md`
- `examples/instant-loans-flow/src/format.ts`
- `skills/liquidium-sdk-integration/SKILL.md`

### Deprecated V1 SDK API Consumers

Deprecated v1 SDK API consumers were removed or migrated.

Removed public history methods and their exported types:

- `history.getPoolHistory(...)`
- `history.getPoolConfigHistory(...)`
- `history.getBorrowRateHistory(...)`

Migrated SDK API paths:

- `lending.submitInflow(...)` now uses `/v2/inflow`.
- `instantLoans.create(...)` now uses `/v2/instant-loans`.
- `instantLoans.find(...)` now uses `/v2/instant-loans/find`.
- `instantLoans.get(...)` collateral hints now use `/v2/instant-loans/:loanId/collateral-hint`.

References:

- `packages/client/src/core/sdk-api-paths.ts`
- `packages/client/src/modules/history/history.ts`
- `packages/client/src/modules/history/types.ts`
- `packages/client/src/modules/lending/lending.ts`
- `packages/client/src/modules/instant-loans/instant-loans.ts`

## Verified Aligned Items

### Activity Confirmation Fields

Top-level `activity.confirmations` and `activity.requiredConfirmations` remain removed from the public `Activity` shape. Confirmations live under `activity.status`.

References:

- `packages/client/src/modules/activities/types.ts`
- `packages/client/src/modules/activities/activities.ts`
- `docs/api-reference/generated/interfaces/InflowActivity.md`
- `docs/api-reference/generated/interfaces/OutflowActivity.md`
- `examples/*/src/format.ts`

### Activity List Default

`activities.list(...)` defaults to active activities.

References:

- `packages/client/src/modules/activities/activities.ts`
- `packages/client/src/modules/activities/types.ts`
- `packages/client/src/_internal/modules.test.ts`
- `README.md`
- `packages/client/README.md`
- `skills/liquidium-sdk-integration/SKILL.md`
