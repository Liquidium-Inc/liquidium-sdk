---
"@liquidium/client": patch
---

Rename the Instant Loans SDK surface to Simple Loans. Use
`client.simpleLoans`, `SimpleLoansModule`, `SimpleLoan*` types, and
`canisterIds.simpleLoans`.

Expose each pool's `sameAssetBorrowingDustThreshold` and enforce the pool's
same-asset borrowing policy in quotes, Simple Loans creation, and profile-based
borrow preparation.
