---
name: liquidium-sdk-integration
description: "Use this skill first for the Liquidium TypeScript SDK authless instant-loan flow, `@liquidium/client`, `LiquidiumClient`, `client.instantLoans`, wallet adapters, Liquidium profile creation, market data, quotes, borrowing, supply flows, positions, activities, or history. Use it whenever the user wants to integrate Liquidium into a TypeScript, React, or Vite app, or asks how to call Liquidium SDK methods correctly."
license: MIT
metadata:
  title: Liquidium SDK Integration
  category: TypeScript SDK
---

# Liquidium SDK Integration

`@liquidium/client` reads Liquidium market and position data, then executes authless instant loans and advanced profile-based lending flows.

Priority: authless instant loans are the default product flow. Use `client.instantLoans` first, deposit-address profile flows second, and ETH contract interaction only when explicitly needed.

## Default Decision

When the user asks for a simple borrow, loan, collateral deposit, repayment target, or Liquidium integration and does not explicitly ask to manage Liquidium profiles, implement the authless instant-loan flow with `client.instantLoans`.

Do not require the user to create a Liquidium profile, sign a borrow message, or call `client.lending.borrow(...)` for the default flow. The SDK creates the backing profile and returns generated initial-deposit and repayment quote targets.

Use profile-based `client.accounts` and `client.lending` only when the user explicitly asks for advanced profile management, existing profile positions, manual supply/repay tracking, signed borrow/withdraw flows, or lower-level wallet orchestration.

## Modules

```ts
import { LiquidiumClient } from "@liquidium/client";

const client = new LiquidiumClient({});
```

The client exposes: `instantLoans`, `accounts`, `lending`, `positions`, `market`, `activities`, `history`, `quote`.

## Setup

Install the client package:

```bash
npm install @liquidium/client
pnpm add @liquidium/client
bun add @liquidium/client
```

Use the SDK in browser apps and modern TypeScript runtimes. Browser integrations
need `fetch`, `BigInt`, and standard ESM support. Follow the host app's package
manager and build tooling.

Minimal config:

```ts
const client = new LiquidiumClient({});
```

Richer config when the flow requires it:

```ts
const client = new LiquidiumClient({
  environment: "mainnet",
  apiBaseUrl: "https://your-app.example.com/api/sdk",
  headers: { "x-client-name": "my-app" },
  evmRpcUrl: "https://mainnet.infura.io/v3/<key>",
  timeoutMs: 30_000,
});
```

**Config requirements:**

- `environment`: sets the canister preset. Only `mainnet` is bundled; pass `canisterIds` explicitly for custom deployments
- `apiBaseUrl`: overrides the default Liquidium service root for history, activities, inflow reporting, `instantLoans.create(...)`, `instantLoans.get(...)`, and `instantLoans.find(...)`. It is not needed for `borrow(...)`, `withdraw(...)`, or default ETH stablecoin deposit-address supply/repay targets
- `headers`: adds headers to Liquidium SDK HTTP API requests, for example app attribution or auth from a backend proxy
- `fetch`: supplies a custom fetch implementation when the runtime needs one
- `evmRpcUrl` / `evmPublicClient`: required for lower-level ETH contract-interaction supply planning and allowance polling. Use `evmRpcHeaders` when the RPC provider authenticates with HTTP headers
- `identity` / `icHost`: custom ICP agent configuration
- `canisterIds.instantLoans`: defaults to mainnet `u5rm3-niaaa-aaaar-qb7eq-cai`; override it for custom deployments

Missing required service configuration is a client configuration problem.
Affected methods throw `LiquidiumErrorCode.VALIDATION_ERROR`, not
`SERVICE_UNAVAILABLE`.

For Vite example apps, expose the RPC URL through a `VITE_` variable. If using
Infura, prefer `VITE_INFURA_API_KEY` and derive the URL in app config:

```ts
const evmRpcUrl = import.meta.env.VITE_INFURA_API_KEY
  ? `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_API_KEY}`
  : import.meta.env.VITE_EVM_RPC_URL;
```

Vite env vars are bundled client-side. Treat Infura browser keys as publishable
or route RPC calls through a server if the key must remain private.

## Module Guide

### instantLoans

Authless instant loans. This is the default simple borrow UX: create a loan,
show the fee-inclusive initial deposit quote and generated collateral deposit
address, restore by reference, and show the actionable repayment amount after
debt exists.

```ts
client.instantLoans.create(...);
client.instantLoans.get({ ref });
client.instantLoans.get({ loanId });
client.instantLoans.find(query);
client.quote.calculateLtv(...); // pure helper for current LTV previews
```

`create(...)` accepts direct `collateralAmount`, `borrowAmount`, `ltvMaxBps`, and
`depositWindowSeconds` values in base units, plus external borrow/refund
destinations. It validates positive amounts, loads pools and prices, applies
SDK-side instant-loan LTV guards, creates the loan, then returns the hydrated
loan with `initialDeposit.amount` for the fee-inclusive collateral transfer.

Current LTV guards require `ltvMaxBps` to be at least the current implied LTV
plus the SDK slippage buffer and no higher than the collateral pool max LTV. Do
not confuse the quote module's `targetLtvBps` with `create(...)`'s `ltvMaxBps`. Use
`client.quote.calculateLtv(...)` when clients need to preview the current LTV
from chosen borrow and collateral amounts before calling `create(...)`.

`create(...)` and `get(...)` do not require a wallet adapter, profile ID, or
message signing. The SDK returns quote targets for the generated profile;
`create(...)` and `get(...)` return `initialDeposit.amount` for the full amount
to send to the deposit target, including the estimated inflow fee. They also
return `position` plus a non-null `repayment` quote. Repayment amount fields are
zero when no debt exists; once debt exists, `repayment.amount` is the full amount
to send to the repayment target, including inflow fee and interest buffer.

Deposit and repayment targets are distinct generated inflow targets. Show
`loan.initialDeposit.target` only when asking the user to send collateral. Show
`loan.repayment.target` only when `loan.repayment.amount > 0n` and the user
needs to repay debt. Do not assume these addresses/accounts match, do not reuse
the collateral deposit target for repayment, and do not cache one target for
both phases.

Hydrated instant loans use the current public shape: read terms from
`loan.terms.ltvMaxBps` and `loan.terms.depositWindowSeconds`; read deposit
instructions from `loan.initialDeposit.amount` and `loan.initialDeposit.target`;
read repayment instructions from `loan.repayment.amount` and
`loan.repayment.target`. Do not use removed top-level fields such as
`loan.depositTarget`, `loan.repayTarget`, `loan.ltvMaxBps`, or
`loan.depositWindowSeconds`.

Reload with `client.instantLoans.get({ ref })` before displaying repayment
instructions so the app uses the canonical repayment amount and target.

When showing deposit progress, always pair `instantLoans.get({ ref })` with
`activities.list({ shortRef: ref, filter: "active" })`. The canonical loan
status may still be `awaiting_deposit` while the activity stream already shows
detected or processing confirmations.

Use `find(...)` for recovery screens where the user may paste a short reference,
numeric loan id string, address, or transaction id. It returns hydrated loans with
activities.

### market

Pool discovery, asset prices, and per-reserve data.

```ts
client.market.listPools();
client.market.findPool({ asset, chain });
client.market.getReserveData({ asset, chain });
client.market.getAssetPrices();
client.market.getPoolRate(poolId);
```

`Pool` includes `decimals`, `availableLiquidity`, caps, rates, and index data.

### quote

Quote-first planning. Use this to calculate borrow USD value, required
collateral, current LTV, validation errors, and warnings from caller-supplied market data.
For default authless loans, the quote can help choose `collateralAmount` and
`borrowAmount`; execution still goes through `client.instantLoans.create(...)`.
For advanced profile-based borrowing, fetch pools and prices first, then call
`quote` before preparing the signed borrow.

```ts
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();
const quote = client.quote.getQuote(request, pools, prices);
const ltv = client.quote.calculateLtv(ltvRequest, pools, prices);
```

`getQuote(...)` is synchronous and pure after the app has already fetched pools
and prices. It returns `validationErrors` and `warnings`; it does not throw for
normal quote validation failures such as missing pools, missing prices, invalid
LTV, too-small borrow amounts, or disallowed same-asset borrowing. Treat a quote
with validation errors as non-executable.

`calculateLtv(...)` is also synchronous and pure after fetching pools and prices.
It accepts `borrowAmount`, `borrowPoolId`, `collateralAmount`, and
`collateralPoolId`, then returns `ltvBps`, `borrowUsd`, `collateralUsd`,
`maxAllowedLtvBps`, asset metadata, and `validationErrors`.

### accounts

Profile creation and resolution.

```ts
client.accounts.prepareCreateProfile(...);  // returns a signable action
client.accounts.createProfile(...);         // signs and submits through a wallet adapter
client.accounts.getProfileId(walletAddress);
client.accounts.listLinkedWallets(profileId);
```

### lending

Advanced profile-based borrow, withdraw, supply, repay, inflow reporting, and supply tracking. Do not use this as the default borrow UX; most apps should start with `client.instantLoans`.

```ts
client.lending.prepareBorrow(...);
client.lending.prepareWithdraw(...);
client.lending.borrow(...);
client.lending.withdraw(...);
client.lending.supply(...);
client.lending.estimateInflowFee({ asset: "USDT", chain: "ETH" });
client.lending.submitInflow({ txid, chain: "BTC", type: "DEPOSIT" });
```

### positions

Existing profile state plus aggregate position reads.

```ts
client.positions.getPosition(profileId, poolId);
client.positions.listPositions(profileId);
client.positions.getHealthFactor(profileId);
client.positions.getUserStats(profileId);
client.positions.getUserPositionSummary(profileId);  // aggregate: collateral, debt, availableBorrows, netWorth, LTV, HF
client.positions.getUserReserves(profileId);         // per-reserve view joined with pool + price data
client.positions.getMaxRepayAmount(profileId, poolId, bufferBps?); // full-repay amount with accrual buffer
```

### activities

Receipt status and active/completed/all activity lists. Requires `apiBaseUrl`.

```ts
client.activities.list({ profileId, filter: "all" });
client.activities.getStatus({ profileId, id });
```

### history

User or pool history. Requires `apiBaseUrl`.

```ts
client.history.getUserTransactionHistory(profileId, filters?);
client.history.getLiquidationHistory(profileId, filters?);
client.history.getPoolHistory(poolId, window?);
client.history.getPoolConfigHistory(poolId, cursor?);
client.history.getBorrowRateHistory(poolId, window?);
```

User history entries expose `txids?: string[]`; do not expect separate inbound
or outbound txid fields. Pool history entries are rate/utilization samples.
Pool config history entries are reserve configuration-change snapshots
(`type: "configuration_change"`) with pool config, caps, indexes, liquidity,
debt, and `sameAssetBorrowing` fields.

## Rate and Amount Formatting

Amount fields are `bigint` base units. Format them with the asset or pool
`decimals`; do not display raw base-unit values as user amounts.

Rate and risk-ratio fields such as `lendingRate`, `borrowingRate`,
`utilizationRate`, `maxLtv`, `liquidationThreshold`, pool-history rates, and
reserve-history rates are fixed-point values scaled by `rateDecimals`, usually
`27`. Do not render raw scaled values as percentages.

Never convert a raw scaled rate directly to display text or append `%` to it.
That can produce impossible UI values such as `3.7e+24%`. Divide by
`10 ** rateDecimals` first, then multiply by `100` only for percentage display,
and format the final value with fixed decimals or `Intl.NumberFormat`.

```ts
function formatScaledRatePercent(
  scaledRate: bigint,
  rateDecimals: bigint,
  fractionDigits = 2,
): string {
  const scale = 10n ** rateDecimals;
  const percentScale = 100n;
  const displayScale = 10n ** BigInt(fractionDigits);
  const rounded =
    (scaledRate * percentScale * displayScale + scale / 2n) / scale;
  const whole = rounded / displayScale;
  const fraction = rounded % displayScale;

  if (fractionDigits === 0) {
    return `${whole}%`;
  }

  return `${whole}.${fraction.toString().padStart(fractionDigits, "0")}%`;
}
```

## Error Handling

Validate user-selected amounts before calling state-changing methods:

```ts
const ltv = client.quote.calculateLtv(request, pools, prices);

if (ltv.validationErrors.length > 0) {
  return {
    ok: false,
    message: ltv.validationErrors.map((error) => error.message).join(" "),
  };
}
```

Catch SDK errors at the boundary where the app can show user-facing copy,
retry, or log diagnostic context:

```ts
import { LiquidiumError, LiquidiumErrorCode } from "@liquidium/client";

try {
  return await client.instantLoans.get({ ref });
} catch (error) {
  if (error instanceof LiquidiumError) {
    if (error.code === LiquidiumErrorCode.REQUEST_TIMEOUT) {
      // Show retry copy or trigger the app's retry path.
    }

    throw error;
  }

  throw error;
}
```

Use exported `LiquidiumErrorCode` values when the UI needs different copy for
timeout, transport, validation, or protocol failures. Quote validation failures
are returned in `validationErrors`; do not rely on thrown errors for normal quote
invalidity.

## Wallet Adapter

The SDK uses a `WalletAdapter` for signing and transaction execution. Implement only the methods the selected flow needs.

Default authless instant loans do not need a `WalletAdapter`. Add one only
for advanced profile creation, signed borrow/withdraw, or automated transfer
execution.

```ts
import type { WalletAdapter } from "@liquidium/client";

const walletAdapter: WalletAdapter = {
  signMessage: async ({ message }) => wallet.signMessage(message),
  sendEthTransaction: async ({ transaction }) =>
    wallet.sendTransaction(transaction),
};
```

**Method selection:**

- `signMessage`: account creation, borrow, and withdraw flows (signs a Liquidium message)
- `sendBtcTransaction`: transfer-path supply automation for BTC targets
- `sendEthTransaction`: transfer-path automation for ETH targets and contract-interaction supply automation

## Flows

### Instant loan default flow

Use `client.instantLoans.create(...)` when the user should not create or manage
a Liquidium profile. The user supplies external destination addresses, receives
a short loan ID, then sends collateral to the generated deposit address.

Default app sequence:

1. Fetch pools and prices for pool selection and optional quote display.
2. Optionally call `client.quote.calculateLtv(...)` to show current LTV and the collateral pool's max allowed LTV.
3. Call `client.instantLoans.create(...)` with direct base-unit amounts and external destination addresses.
4. Persist or display `loan.ref` as the primary recovery key.
5. Show `loan.initialDeposit.amount` plus `loan.initialDeposit.target` for collateral deposit and, when `loan.repayment.amount > 0n`, `loan.repayment.target` plus `loan.repayment.amount` for repayment.

The default instant-loan flow does not need a wallet adapter. The user signs or
broadcasts only the external wallet transfer to the generated deposit or repay
target outside the SDK.

The deposit target and repayment target are not interchangeable. Collateral goes
to `loan.initialDeposit.target`. Repayment goes to `loan.repayment.target` when
`loan.repayment.amount > 0n`. If a UI has separate deposit and repay screens,
each screen must read the target for that exact phase instead of sharing one
saved address.

```ts
const ltv = client.quote.calculateLtv(
  {
    collateralPoolId: btcPool.id,
    borrowPoolId: usdtPool.id,
    collateralAmount: 10_000_000n,
    borrowAmount: 2_000_000n,
  },
  pools,
  prices
);

const loan = await client.instantLoans.create({
  collateralPoolId: btcPool.id,
  borrowPoolId: usdtPool.id,
  collateralAsset: "BTC",
  borrowAsset: "USDT",
  collateralAmount: 10_000_000n,
  borrowAmount: 2_000_000n,
  ltvMaxBps: ltv.maxAllowedLtvBps,
  depositWindowSeconds: 3_600n,
  borrowDestination: {
    type: "External",
    address: "0x2222222222222222222222222222222222222222",
  },
  refundDestination: { type: "External", address: "bc1qrefunddestination" },
});

const ref = loan.ref;
const initialDepositAmount = loan.initialDeposit.amount;
const depositTarget = loan.initialDeposit.target;
const repayTarget = loan.repayment.amount > 0n ? loan.repayment.target : null;
```

Create destinations are external-only. Pass an external address string or an
external account object: `{ type: "External", address: "..." }`.

`collateralAmount` and `borrowAmount` are in each asset's base units.
`collateralAmount` is the intended credited collateral target before
deposit/inflow fees; use `loan.initialDeposit.amount` as the amount to transfer
after creation. Use pool `decimals` and the quote module when building UI inputs.
Keep the initial loan LTV under the SDK's instant-loan starting-LTV guard and set
`ltvMaxBps` within the collateral pool's accepted max-LTV range.

If the target is a native address, show `target.address`. If it is an ICRC
account, show `target.account`.

```ts
const depositAddress =
  depositTarget.type === "nativeAddress"
    ? depositTarget.address
    : depositTarget.account;
```

Transfer targets also include `poolId`, `asset`, `chain`, and `action`. Use
those fields to label and validate the UI before asking the user to send funds.

Restore a loan by `ref` whenever possible:

```ts
const loan = await client.instantLoans.get({ ref: "8Y9AQQ" });
const repayAmount = loan.repayment.amount;
const repayAddress =
  repayAmount === 0n
    ? null
    : loan.repayment.target.type === "nativeAddress"
      ? loan.repayment.target.address
      : loan.repayment.target.account;
```

Use search only as recovery when the user lost the loan reference:

```ts
const results = await client.instantLoans.find("bc1qrefunddestination");
const loan = results[0]?.loan;
```

Reference lookup is canonical. Search may return multiple hydrated matches;
prefer `get({ ref })` once the app has a saved reference.

Do not use `client.lending.borrow(...)` for this flow. `lending.borrow(...)` is
the profile-based signed borrow primitive. Instant loans automate the borrow
after collateral arrives.

Instant loan status values are UI-facing:

- `awaiting_deposit`: show `loan.initialDeposit.target` and the deposit deadline
- `deposit_detected`: keep polling and show a pending state
- `active`: show `loan.repayment.amount` and `loan.repayment.target`
- `settling`: keep polling and avoid duplicate user actions
- `closed`: show final state and stop prompting for repayment
- `expired`: show timeout state and stop prompting for collateral deposit

### Advanced: create a profile

Only use this when the app intentionally manages Liquidium profiles. Do not add
profile creation to the default authless instant-loan flow.

Convenience method when the app already has wallet signing wired:

```ts
const profileId = await client.accounts.createProfile({
  account: walletAddress,
  chain: "ETH",
  walletAdapter: {
    signMessage: async ({ message }) => wallet.signMessage(message),
  },
});
```

Prepare flow when you want explicit control over signing:

```ts
const createAction = await client.accounts.prepareCreateProfile({
  account: walletAddress,
});

const signature = await wallet.signMessage(createAction.message);

const profileId = await createAction.submit({
  signature,
  chain: "ETH",
  account: walletAddress,
});
```

`prepareCreateProfile(...)` normalizes the account and fetches the signing nonce;
it does not pre-check profile uniqueness. Handle existing profiles by catching
`PROFILE_ALREADY_EXISTS` from submission/canister validation and resolving the
profile instead of retrying the create flow.

### Read market data and positions

```ts
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();
const positions = await client.positions.listPositions(profileId);
const healthFactor = await client.positions.getHealthFactor(profileId);
```

For an aggregate position summary (`availableBorrowsUsd`, `netWorthUsd`,
`currentLtvBps`, `healthFactor`) plus a per-reserve USD breakdown:

```ts
const summary = await client.positions.getUserPositionSummary(profileId);
const reserves = await client.positions.getUserReserves(profileId);
```

### Advanced profile-based quote-first borrow

Use this only for apps that already manage profiles and need signed borrow
execution. For the authless product flow, use the quote only for planning and
execute with `client.instantLoans.create(...)`.

```ts
const pools = await client.market.listPools();
const prices = await client.market.getAssetPrices();

const quote = client.quote.getQuote(request, pools, prices);

const outflow = await client.lending.borrow({
  profileId,
  poolId: quote.borrowPoolId,
  amount: quote.borrowAmount,
  receiverAddress,
  signerWalletAddress: walletAddress,
  signerChain: "ETH",
  signerWalletAdapter: {
    signMessage: async ({ message }) => wallet.signMessage(message),
  },
});

// `outflow.id` is the outflow reference assigned by the canister. `outflow.txid`
// may be null until the canister broadcasts the on-chain transaction. The SDK
// does not poll for the txid; consumers should display `outflow.id` immediately
// and resolve the txid separately if needed.
```

### Advanced profile-based supply flow

Use this only for profile-based integrations that intentionally manage Liquidium
profiles. Use `client.instantLoans` for the default authless borrow UX.

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
});

if (
  supplyFlow.type === "transfer" &&
  supplyFlow.target.type === "nativeAddress"
) {
  const depositAddress = supplyFlow.target.address;
}

await supplyFlow.submit({ txid: "<broadcast-txid>" });
```

For profile-based inflows, `action: "deposit"` and `action: "repayment"`
derive different targets. Use the `supplyFlow.target` returned by the exact
`client.lending.supply(...)` call for the action being executed. Do not use a
deposit flow, cached deposit address, or previous `supplyFlow.target` for a
repayment transfer.

`supply(...)` returns a receipt. When the SDK broadcast for you (wallet-adapter
path), `supplyFlow.txid` is populated. The SDK does not poll inflow status;
when you have a txid, you are responsible for polling confirmation state.

If the app wants the SDK to broadcast the transfer-path transaction, provide
`walletAdapter`, `account`, and `amount`:

```ts
const autoBroadcastFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  amount: 100_000n,
  account: walletAddress,
  walletAdapter: {
    sendBtcTransaction: async ({ toAddress, amountSats }) =>
      wallet.sendBtcTransaction({ toAddress, amountSats }),
  },
});
```

ETH stablecoin pools default to the deposit-address transfer path. With an ETH
wallet adapter, the SDK sends an ERC-20 transfer directly to the generated
deposit address:

```ts
const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter: {
    sendEthTransaction: async ({ transaction }) =>
      wallet.sendTransaction(transaction),
  },
});
```

This default flow does not require `apiBaseUrl` or an EVM RPC. Use lower-level
`getEvmSupplyContext(...)` only if you are intentionally building the
contract-interaction flow.

#### ETH Stablecoin Deposit Addresses

ETH USDT/USDC deposit-address supply uses the ETH deposit-address canister
directly. It does not require `apiBaseUrl` for target resolution.

For `mechanism: "transfer"`, the SDK resolves the deposit address by calling:

```ts
get_deposit_address(
  {
    owner: Principal.fromText(poolId),
    subaccount: [
      encodeInflowSubaccount({
        action,
        principal: Principal.fromText(profileId),
      }),
    ],
  },
  [tokenContractAddress]
);
```

Important details:

- `owner` is the selected pool principal (`poolId`)
- `subaccount` is encoded from the Liquidium `profileId` and inflow `action`
- `tokenContractAddress` is the ETH token contract address for USDT or USDC
- The SDK calls `get_deposit_address`
- The user's EVM wallet address is not used to derive the deposit address
- `apiBaseUrl` is not involved in this deposit-address lookup

If this returns `DEPOSIT_ADDRESS_ERROR: unauthorized`, do not diagnose it as a
missing API URL. Check that the selected pool principal is authorized by the ETH
deposit-address canister for the same deployment/environment.

For prod/mainnet, the SDK default ETH deposit-address canister is:
`z5jz7-nyaaa-aaaar-qb6pq-cai`.

When testing manually in the IC dashboard, use a pool principal from the same
deployment as the deposit-address canister.

Override the default route only when the app intentionally needs a specific
mechanism:

```ts
const contractInteractionFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  mechanism: "contractInteraction",
  account: walletAddress,
  amount: 10_000_000n,
  walletAdapter: {
    sendEthTransaction: async ({ transaction }) =>
      wallet.sendTransaction(transaction),
  },
});
```

`mechanism: "transfer"` keeps the deposit-address path explicit. `mechanism: "contractInteraction"` requires `apiBaseUrl`, `evmRpcUrl` or `evmPublicClient`, `account`, `amount`, and `sendEthTransaction`.

## Common Mistakes

1. Treating profile lending as the default borrow flow. Use `client.instantLoans.create(...)` for the authless product flow unless the user explicitly asks for profiles.
2. Adding profile creation, signed borrow, or wallet adapter requirements to instant loans. `instantLoans.create(...)` and `instantLoans.get(...)` do not need them.
3. Confusing `quote.targetLtvBps` with instant-loan `ltvMaxBps`. The quote target helps plan amounts; `ltvMaxBps` is validated by the instant-loan LTV guards.
4. `new LiquidiumClient({})` uses the default Liquidium service configuration. Override `apiBaseUrl` for custom service deployments. Lower-level contract-interaction planning also needs `evmRpcUrl` or `evmPublicClient`. Default ETH stablecoin deposit-address supply, `borrow(...)`, and `withdraw(...)` do not use the service configuration.
5. Prepare methods return signable actions, not completed actions. `prepareCreateProfile`, `prepareBorrow`, and `prepareWithdraw` still need signing and submission.
6. Build a wallet adapter with only the methods the selected flow needs. Avoid adding `signMessage`, `sendBtcTransaction`, or `sendEthTransaction` unless the flow uses them.
7. Do not `await client.quote.getQuote(...)`; it is synchronous once pools and prices are available.
8. Check `quote.validationErrors` before enabling borrow execution. Quote validation failures are returned in-band rather than thrown.
9. `client.lending.supply(...)` auto-routes by pool. BTC and ETH USDT pools currently resolve to deposit-address transfer targets by default; use `mechanism` only when intentionally overriding that route.
10. Handle existing profiles explicitly when account creation can race with existing state. Do not rely on `prepareCreateProfile(...)` to reject an existing profile before signing.
11. Work from the public modules and names exported by `@liquidium/client`. Do not invent SDK methods.
12. After `borrow(...)`, treat `outflow.id` as the user-visible reference immediately. Do not assume `outflow.txid` is set on the first response; resolve it later via activities or history if you need the chain transaction id.
13. History entries use `txids?: string[]`; do not look for legacy direction-specific txid fields.
14. ETH deposit-address `unauthorized` is usually not an `apiBaseUrl` problem. The deposit-address lookup is a direct canister call. Check the `poolId`, `ethDeposit` canister ID, token address, and deployment/environment alignment first.
15. Do not model instant loans as a `lending.supply(...)` mechanism. Use `client.instantLoans` for the authless product flow and `client.lending.supply(...)` only for advanced profile-based supply/repay integrations.
16. Do not trust address lookup as canonical loan state. Use it to find candidates, then hydrate the selected loan through `instantLoans.get(...)`.
17. Do not confuse deposit/supply targets with repayment targets. They are generated for different inflow actions and may be different addresses/accounts.
18. Do not render raw `rateDecimals = 27` fixed-point values as percentages. Format scaled rates first or the UI can show scientific notation such as `3.7e+24%`.
19. Do not model `loan.repayment` as nullable. It is always present; check `loan.repayment.amount > 0n` before prompting repayment.
20. Do not use removed instant-loan fields: `loan.depositTarget`, `loan.repayTarget`, `loan.ltvMaxBps`, or `loan.depositWindowSeconds`.

## Preferred Style

- Keep examples minimal and app-shaped
- Use convenience methods for end-to-end app flows
- Use prepare/sign/submit flows when the user asks for signing control or custom wallet orchestration
- Reuse the app's existing wallet provider instead of adding a parallel wallet framework
- Preserve the app's state management and fetch patterns

## Defaults

- Prefer `client.instantLoans.create(...)` for the simple authless borrow UX
- Start with `new LiquidiumClient({})` for market reads and authless `instantLoans.create(...)`
- Override `apiBaseUrl` only when the app uses a custom Liquidium service deployment
- Add `evmRpcUrl` or `evmPublicClient` when the requested flow reads Ethereum chain state
- Use `chain: "ETH"` or `chain: "BTC"` exactly as required by the SDK
- Prefer a quote-first flow for advanced profile-based borrowing
- Prefer the BTC payment address when the wallet exposes both ordinals and payment addresses

## Source Files

When unsure, check these first:

- `packages/client/README.md`
- `README.md`
- `packages/client/src/modules/instant-loans/instant-loans.ts`
- `packages/client/src/modules/history/types.ts`
- `packages/client/src/modules/instant-loans/types.ts`
- `packages/client/src/modules/lending/types.ts`
- `packages/client/src/modules/quote/types.ts`
- `examples/instant-loans-flow/src/App.tsx`
- `examples/instant-loans-flow/src/sdk-example.ts`
- `examples/deposit-address-flow/src/dynamic-wallet.ts`
- `examples/deposit-address-flow/src/sdk-example.ts`
- `examples/contract-interaction-flow/src/dynamic-wallet.ts`
- `examples/contract-interaction-flow/src/sdk-example.ts`
- `examples/sdk-method-query/README.md`
- `examples/sdk-method-query/src/lib/client.ts`
- `examples/sdk-method-query/src/SdkMethodQueryPage.tsx`

## Useful Resources

- General Liquidium docs for context: https://liquidium.fi/docs
- SDK docs overview: https://liquidium.fi/docs/sdk
- GitHub repo: https://github.com/Liquidium-Inc/liquidium-sdk
- npm package: https://www.npmjs.com/package/@liquidium/client
- Open SDK Developer Docs: https://liquidium-inc.github.io/liquidium-sdk/
