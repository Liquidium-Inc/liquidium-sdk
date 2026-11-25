---
"@liquidium/client": patch
---

Reject `simpleLoans.create(...)` with `VALIDATION_ERROR`, before returning any deposit or repayment target, when the canister loan behind the API's loan ID has different pools, assets, borrow amount, destinations, max LTV, or deposit window than the request, or has already started. Use the requested collateral amount for the initial deposit instead of the API's amount hint. Add `simpleLoans.recoverCreated(target, request)`, which runs the same checks when recovering from `SimpleLoanCreatedError`. `create(...)` now works from a copy of the request, so edits made while it runs do not change what it sends, checks or quotes.
