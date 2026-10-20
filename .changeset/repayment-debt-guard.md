---
"@liquidium/client": minor
---

Reject `lending.supply(...)` repayments with `NO_OUTSTANDING_DEBT` before returning a target or broadcasting when the profile has no debt in the pool, and document that `submit(...)` does not post ICP ledger transfers.
