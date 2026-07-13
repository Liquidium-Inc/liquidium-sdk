---
"@liquidium/client": minor
---

Add native ICP and chain-key asset routes using explicit `Chain` + `Asset`
identifiers.

## Breaking changes

- Instant-loan creation now groups fields under `collateral`, `borrow`, and
  `refund`. Both `borrow` and `refund` require an explicit delivery `chain` and
  `destination`.
- Instant-loan deposit and repayment quotes now live in chain-keyed `targets`
  maps. Replace fields such as `initialDeposit.target` and `repayment.amount`
  with `initialDeposit.targets[chain]` and `repayment.targets[chain]`.
- Borrow and withdraw requests replace `receiverAddress` with `chain` and
  `receiver`.
- Every `lending.supply(...)` request requires `chain`. Transfer flows must no
  longer pass `mechanism: SupplyPlanType.transfer`.
- Account responses now use `LiquidiumAccount`: `External`, `Native`,
  `AccountIdentifier`, and `Icrc` become `ChainAddress`, `IcPrincipal`,
  `IcpAccountIdentifier`, and `IcrcAccount`. Response fields use `address`
  instead of `account` or `principal`.
- `SupplyTarget` is now a flat shape with `chain`, `asset`, and `address`.
  Remove `target.type` checks and stop reading ICRC-specific target fields.
- Pool canister overrides move from `btcPool` and `ercPool` to `pools.btc` and
  `pools.usdt`.
- `TransferMode`, `MarketAsset`, `MarketChain`, legacy account and supply-target
  types, and borrow/withdraw signature aliases are removed. Use
  `SignMessageWalletAction`, `Asset`, `Chain`, `LiquidiumAccount`,
  `SupplyTarget`, and `SignatureInfo` instead.
- `Asset.SOL` is removed. Chain-key activities now report `Chain.ICP`.

## Added

- Add ICP, ckBTC, ckUSDC, and ckUSDT transfer routes, ICRC wallet transfers,
  ledger fee estimates, and chain-keyed instant-loan quotes.
- Add `InstantLoanCreatedError` for recovering a created loan when subsequent
  state hydration fails. Retry `instantLoans.get(...)` instead of creation.
