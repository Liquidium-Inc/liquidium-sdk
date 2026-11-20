---
"@liquidium/client": patch
---

Reject `simpleLoans.create(...)` with `VALIDATION_ERROR`, before returning any deposit or repayment target, when the canister loan behind the API's loan ID has different pools, assets, borrow amount, destinations, max LTV, or deposit window than the request. Use the requested collateral amount for the initial deposit instead of the API's amount hint.
