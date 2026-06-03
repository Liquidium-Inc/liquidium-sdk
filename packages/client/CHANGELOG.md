# @liquidium/client

## 0.2.0

### Minor Changes

- Add external Bitcoin address validation support and include Liquidium inflow fees in instant-loan deposit and BTC repayment estimates, rounding fee estimates up to avoid underfunding.
- Breaking type change: restructure `InstantLoan` response fields by moving loan terms into `terms`, replacing top-level deposit/repay targets with `initialDeposit` and `repayment.target`, and renaming instant-loan candidate collateral hints to `collateralAmount`.

## 0.1.2

### Patch Changes

- Add SDK documentation links and publish the expanded API export surface.

## 0.1.1

### Patch Changes

- b99b996: Fix browser runtime compatibility for canister calls by migrating the SDK actor stack from deprecated `@dfinity/*` packages to `@icp-sdk/core` submodules, removing the need for browser consumers to provide a Node-style `global` polyfill.
