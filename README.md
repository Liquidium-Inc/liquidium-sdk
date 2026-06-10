![npm](https://img.shields.io/npm/v/@liquidium/client?label=%40liquidium%2Fclient)
![license](https://img.shields.io/badge/license-MIT-blue)

<p align="center">
  <img src="https://raw.githubusercontent.com/Liquidium-Inc/liquidium-sdk/main/sdk.svg" alt="Liquidium SDK illustration" width="700" />
</p>

<h1 align="center">Liquidium SDK</h1>

<p align="center">
  Use the Liquidium SDK from TypeScript apps. Start with accountless instant loans.
</p>

<p align="center">
  <a href="https://liquidium-inc.github.io/liquidium-sdk/"><b>SDK Docs</b></a> ·
  <a href="https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/instant-loans-flow"><b>Instant Loan Example</b></a> ·
  <a href="https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/sdk-method-query"><b>SDK Method Query Example</b></a> ·
  <a href="#core-api"><b>Core API</b></a>
</p>

## Documentation

Use the SDK docs for setup, guides, API reference, and examples.

[Open the Liquidium SDK docs](https://liquidium-inc.github.io/liquidium-sdk/)

## Why Start With Instant Loans

- **Accountless loan creation**: create instant loans without requiring a Liquidium profile.
- **Generated transfer targets**: get collateral deposit and repayment targets from the SDK response.
- **Reference-based restore**: save `loan.ref` and reload loan state from any browser session or support link.
- **LTV checks**: use market pools and prices to validate collateral and borrow amounts before loan creation.
- **Status and repayment quote**: reload lifecycle status, position state, and repayment amount in one call.

## Integration Paths

Liquidium supports two borrowing and lending integration paths:

| Path | Use when | Main SDK calls |
| --- | --- | --- |
| Recommended: accountless instant loans | You want a short checkout-style flow where users borrow against collateral without creating a Liquidium profile first | `client.instantLoans.create(...)`, `client.instantLoans.get(...)`, `client.activities.list(...)` |
| Account-based profile flows | You want users to keep a Liquidium profile, manage positions across sessions, supply funds, borrow, withdraw, or use ETH contract-interaction deposits | `client.accounts.createProfile(...)`, `client.lending.supply(...)`, `client.lending.borrow(...)`, `client.lending.withdraw(...)`, `client.positions.list(...)` |

Use accountless instant loans for new borrow flows unless you need profile-level position management. Use account-based flows when your app owns the full lending dashboard experience.

## Quick Start

Install the client package:

```bash
npm install @liquidium/client
```

Create an instant loan, display the deposit target, and restore the loan by reference:

```ts
import { LiquidiumClient, type Pool, type SupplyTarget } from "@liquidium/client";

const client = new LiquidiumClient();

const [pools, prices] = await Promise.all([
  client.market.listPools(),
  client.market.getAssetPrices(),
]);

const collateralPool = requirePool(pools, "BTC");
const borrowPool = requirePool(pools, "USDC");

const collateralAmount = 50_000n; // BTC sats
const borrowAmount = 9_000_000n; // USDC base units

const ltv = client.quote.calculateLtv(
  {
    collateralPoolId: collateralPool.id,
    borrowPoolId: borrowPool.id,
    collateralAmount,
    borrowAmount,
  },
  pools,
  prices
);

if (ltv.validationErrors.length > 0) {
  throw new Error(ltv.validationErrors.map((error) => error.message).join(" "));
}

const loan = await client.instantLoans.create({
  collateralPoolId: collateralPool.id,
  borrowPoolId: borrowPool.id,
  collateralAsset: "BTC",
  borrowAsset: "USDC",
  collateralAmount,
  borrowAmount,
  ltvMaxBps: ltv.maxAllowedLtvBps,
  depositWindowSeconds: 3_600n,
  borrowDestination: {
    type: "External",
    address: "0x2222222222222222222222222222222222222222",
  },
  refundDestination: {
    type: "External",
    address: "bc1qrefunddestination",
  },
});

console.log("Save this loan reference:", loan.ref);
console.log("Send initial deposit amount:", loan.initialDeposit.amount.toString());
console.log("Send collateral to:", formatSupplyTarget(loan.initialDeposit.target));

const restoredLoan = await client.instantLoans.get({ ref: loan.ref });

console.log("Loan status:", restoredLoan.status);
console.log("Restored initial deposit amount:", restoredLoan.initialDeposit.amount.toString());
if (restoredLoan.repayment) {
  console.log("Repay amount:", restoredLoan.repayment.amount.toString());
  console.log("Repay target:", formatSupplyTarget(restoredLoan.repayment.target));
} else {
  console.log("No repayment due yet.");
}

const activities = await client.activities.list({ shortRef: loan.ref });

console.log("Loan activities:", activities);

function requirePool(pools: Pool[], asset: string): Pool {
  const pool = pools.find((candidatePool) => candidatePool.asset === asset);

  if (!pool) {
    throw new Error(`Missing ${asset} pool.`);
  }

  if (pool.frozen) {
    throw new Error(`${asset} pool is frozen.`);
  }

  return pool;
}

function formatSupplyTarget(target: SupplyTarget): string {
  if (target.type === "nativeAddress") {
    return target.address;
  }

  return target.account;
}
```

## Instant Loan Flow

Instant-loan integrations use this sequence:

| Step | SDK call | What your app does |
| --- | --- | --- |
| Load market data | `client.market.listPools()` and `client.market.getAssetPrices()` | Show supported collateral and borrow assets |
| Validate amounts | `client.quote.calculateLtv(...)` | Block too-small borrow amounts, invalid LTV, or frozen-pool input before creating a loan |
| Create loan | `client.instantLoans.create(...)` | Store `loan.ref` and show `loan.initialDeposit.amount` plus `loan.initialDeposit.target` |
| Track loan | `client.instantLoans.get({ ref })` and `client.activities.list({ shortRef: ref })` | Reload loan state, initial deposit quote, and repayment activity |
| Repay loan | Read `loan.repayment` | If non-null, ask the user to send `loan.repayment.amount` to `loan.repayment.target` |

`client.instantLoans.create(...)` and `client.instantLoans.get(...)` return the generated Liquidium profile, current position state, an initial deposit quote with its transfer target, and a nullable repayment quote with its transfer target. Users do not manage the generated profile.

## Core API

### `client.instantLoans.create(request)`

Creates an accountless instant loan and returns generated transfer targets.

| Field | Description |
| --- | --- |
| `collateralPoolId` | Pool that receives the collateral deposit |
| `borrowPoolId` | Pool the loan borrows from |
| `collateralAsset` | Collateral asset symbol, for example `"BTC"` |
| `borrowAsset` | Borrow asset symbol, for example `"USDC"` |
| `collateralAmount` | Intended credited collateral amount in base units, before deposit/inflow fees |
| `borrowAmount` | Borrow amount in base units. The SDK rejects values below the asset minimum. |
| `ltvMaxBps` | Maximum LTV in basis points, where `6_000n` is 60% |
| `depositWindowSeconds` | How long the user has to send collateral |
| `borrowDestination` | External address that receives borrowed funds |
| `refundDestination` | External address that receives collateral refunds |

`borrowDestination` and `refundDestination` can be address strings or account objects such as `{ type: "External", address: "bc1q..." }`.

### `client.instantLoans.get({ ref })`

Loads loan state from a saved user-facing reference.

Use this for status pages, refreshes, and support links. The SDK combines canister state with the Liquidium SDK API lookup so the restored loan includes the original collateral deposit hint.

### `client.instantLoans.get({ loanId })`

Loads loan state by numeric canister loan id.

Use this when your backend stores the numeric id instead of the short reference.

### `client.instantLoans.find(query)`

Finds instant loans by short reference, numeric canister loan id string, generated deposit or repayment address, borrow or refund destination address, or indexed transaction id/hash through the SDK API search index.

Use this for recovery and manage pages where the user may paste any loan identifier. The method returns lightweight matches with nested `collateral` and `borrow` fields because address and transaction-id lookups can match many loans. Use `client.instantLoans.get(...)` after the user selects a match.

### `client.quote.calculateLtv(request, pools, prices)`

Calculates implied LTV from selected pools, prices, borrow amount, and collateral amount.

Use this before `client.instantLoans.create(...)` so your app can block invalid input and choose a safe `ltvMaxBps`.

### Borrow minimums

The SDK enforces product minimums before borrow creation:

| Asset | Minimum borrow amount |
| --- | --- |
| BTC | `5_100n` sats |
| USDC | `1_000_000n` base units |
| USDT | `1_000_000n` base units |

Use `getMinimumBorrowAmount(asset)` to display the same minimum that `client.quote.calculateLtv(...)`, `client.quote.getQuote(...)`, `client.instantLoans.create(...)`, and `client.lending.prepareBorrow(...)` enforce.

## Response Fields

Most instant-loan UIs show or store these fields:

| Field | Use |
| --- | --- |
| `loan.ref` | Save and show this reference so the loan can be restored later |
| `loan.status` | Show the lifecycle: `awaiting_deposit`, `deposit_detected`, `active`, `settling`, `closed`, or `expired`. `active` means the canister has started the loan or live debt exists |
| `loan.initialDeposit.amount` | Fee-inclusive collateral amount to send after creation or restore |
| `loan.initialDeposit.collateralAmount` | Intended credited collateral target used for LTV |
| `loan.initialDeposit.target` | Address or ICRC account where the user sends collateral |
| `loan.initialDeposit.detectedTimestamp` | Unix timestamp in seconds when the collateral deposit was detected, or `null` before detection |
| `loan.initialDeposit.expiryTimestamp` | Unix timestamp in seconds when the collateral deposit window expires, or `null` before detection when unavailable |
| `loan.repayment?.amount` | Full amount to repay, including fee and interest buffer, when debt exists |
| `loan.repayment?.target` | Address or ICRC account where the user sends repayment, when debt exists |
| `loan.position` | Current collateral, debt, and interest state for the generated profile |

## Amounts

The SDK returns amount fields as `bigint` values in the asset's smallest unit.

| Asset type | Example |
| --- | --- |
| BTC | Satoshis |
| USDC / USDT | Token base units using the pool decimals |

Use `Pool.decimals` from `client.market.listPools()` when converting user-entered decimals to base units. Hydrated instant loans also include `loan.collateral.decimals`, `loan.borrow.decimals`, and `loan.initialDeposit.decimals` for display.

## Status And Activity Tracking

Reload loans with `client.instantLoans.get({ ref })` when you need current state, transfer targets, or the latest repayment quote.

Use activities to track collateral deposits, borrow outflows, repayment deposits, confirmations, and fee top-ups. The activities module accepts the saved instant-loan reference and resolves the generated profile for you:

```ts
const activities = await client.activities.list({
  shortRef: loan.ref,
  filter: "active",
});
```

If you have a receipt or activity id from the flow, you can also load activity status:

```ts
const activityStatus = await client.activities.getStatus({
  shortRef: loan.ref,
  id: "<activity-or-receipt-id>",
});
```

## Example Apps

Start browser integrations with the examples.

| Example | What it shows |
| --- | --- |
| [`examples/instant-loans-flow`](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/instant-loans-flow) | Accountless instant loan UX with manual destination addresses, pool selection, LTV preview, loan creation, status reload, activity status, and address recovery |
| [`examples/sdk-method-query`](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/sdk-method-query) | Developer tool for calling SDK methods, including instant loan method templates |

Run the instant loan example:

```bash
git clone https://github.com/Liquidium-Inc/liquidium-sdk.git
cd liquidium-sdk
pnpm install
cp examples/instant-loans-flow/.env.example examples/instant-loans-flow/.env
pnpm --filter @liquidium/example-instant-loans-flow dev
```

Set `VITE_INFURA_API_KEY` when your flow needs Ethereum reads through Infura.

## Browser And Runtime Support

Use the SDK in browser apps and modern TypeScript runtimes.

| Requirement | Notes |
| --- | --- |
| Node.js | 20+ for this repository |
| Package manager | pnpm 9+ for local development |
| Browser APIs | `fetch`, `BigInt`, and standard ESM support |
| Wallet UI | Bring your own wallet provider; wallet-backed examples use Dynamic |

## Development

```bash
git clone https://github.com/Liquidium-Inc/liquidium-sdk.git
cd liquidium-sdk
pnpm install
pnpm run build
pnpm run typecheck
pnpm run test
```

## More API Details

This README covers `@liquidium/client`. Start new integrations with `client.instantLoans`; profile-based deposit-address flows and ETH contract-interaction flows are advanced paths.

## License

MIT
