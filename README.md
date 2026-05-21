![npm](https://img.shields.io/npm/v/@liquidium/client?label=%40liquidium%2Fclient)
![license](https://img.shields.io/npm/l/@liquidium/client)

<p align="center">
  <img src="./instant-loan-hero.svg" alt="Liquidium instant loan flow" width="700" />
</p>

<h1 align="center">Liquidium SDK</h1>

<p align="center">
  TypeScript SDK for creating and tracking Liquidium instant loans.
</p>

<p align="center">
  <a href="./examples/instant-loans-flow"><b>Instant Loan Example</b></a> ·
  <a href="./examples/vite-react-dynamic"><b>SDK Method Query Example</b></a> ·
  <a href="./packages/client/README.md"><b>Full Client API</b></a>
</p>

## Why Liquidium SDK

- **Accountless loan creation**: create an instant loan without asking users to create or manage a Liquidium profile first.
- **Generated transfer targets**: receive the collateral deposit target and repayment target directly from the SDK response.
- **Reference-based restore**: save `loan.ref` and reload canonical loan state from any browser session or support link.
- **Built-in LTV helpers**: use market pools and prices to validate collateral and borrow amounts before creating the loan.
- **Status and repayment quote**: reload the current lifecycle status, position state, and full repayment amount in one call.

## Quick Start

Install the client package and ICP packages used by the SDK:

```bash
npm install @liquidium/client @dfinity/agent @dfinity/candid @dfinity/principal
```

Create an instant loan, show the generated deposit target, and restore the loan by reference:

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
console.log("Send collateral to:", formatSupplyTarget(loan.depositTarget));

const restoredLoan = await client.instantLoans.get({ ref: loan.ref });

console.log("Loan status:", restoredLoan.status);
console.log("Repay amount:", restoredLoan.repayment.amount.toString());
console.log("Repay target:", formatSupplyTarget(restoredLoan.repayment.target));

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

The default integration is intentionally small:

| Step | SDK call | What your app does |
| --- | --- | --- |
| Load market data | `client.market.listPools()` and `client.market.getAssetPrices()` | Show supported collateral and borrow assets |
| Validate amounts | `client.quote.calculateLtv(...)` | Block invalid LTV or frozen-pool input before creating a loan |
| Create loan | `client.instantLoans.create(...)` | Store `loan.ref` and show `loan.depositTarget` |
| Track loan | `client.instantLoans.get({ ref })` | Reload status, position, deposit target, and repayment quote |
| Repay loan | Read `loan.repayment` | Ask the user to send `loan.repayment.amount` to `loan.repayment.target` |

`client.instantLoans.create(...)` returns the generated Liquidium profile, transfer targets, current position state, and repayment quote. The user does not need to manage the generated profile directly.

## Core API

### `client.instantLoans.create(request)`

Creates an accountless instant loan and returns generated transfer targets.

| Field | Description |
| --- | --- |
| `collateralPoolId` | Pool that receives the collateral deposit |
| `borrowPoolId` | Pool the loan borrows from |
| `collateralAsset` | Collateral asset symbol, for example `"BTC"` |
| `borrowAsset` | Borrow asset symbol, for example `"USDC"` |
| `collateralAmount` | Collateral amount in base units |
| `borrowAmount` | Borrow amount in base units |
| `ltvMaxBps` | Maximum LTV in basis points, where `6_000n` is 60% |
| `depositWindowSeconds` | How long the user has to send collateral |
| `borrowDestination` | External address that receives borrowed funds |
| `refundDestination` | External address that receives collateral refunds |

`borrowDestination` and `refundDestination` can be address strings or account objects such as `{ type: "External", address: "bc1q..." }`.

### `client.instantLoans.get({ ref })`

Loads canonical loan state from a saved user-facing reference.

Use this for status pages, refreshes, and support links.

### `client.instantLoans.get({ loanId })`

Loads canonical loan state by numeric canister loan id.

Use this when your backend stores the numeric id instead of the short reference.

### `client.instantLoans.findByAddress(address)`

Finds candidate loans associated with a borrow or refund address.

This is a recovery helper only. Candidates are intentionally lightweight; call `client.instantLoans.get({ ref })` or `client.instantLoans.get({ loanId })` before showing canonical loan state or transfer targets.

### `client.quote.calculateLtv(request, pools, prices)`

Calculates implied LTV from selected pools, prices, borrow amount, and collateral amount.

Use this before `client.instantLoans.create(...)` so your app can block invalid input and choose a safe `ltvMaxBps`.

## Response Fields

These are the fields most user-facing instant loan UIs should show or store:

| Field | Use |
| --- | --- |
| `loan.ref` | Save and show this reference so the loan can be restored later |
| `loan.status` | Show the simplified lifecycle: `awaiting_deposit`, `deposit_detected`, `active`, `settling`, or `closed` |
| `loan.depositTarget` | Address or ICRC account where the user sends collateral |
| `loan.repayment.amount` | Full amount to repay, including fee and interest buffer |
| `loan.repayment.target` | Address or ICRC account where the user sends repayment |
| `loan.position` | Current collateral, debt, and interest state for the generated profile |

## Amounts

All amount fields are `bigint` values in the asset's smallest unit.

| Asset type | Example |
| --- | --- |
| BTC | Satoshis |
| USDC / USDT | Token base units using the pool decimals |

Use `Pool.decimals` from `client.market.listPools()` when converting user-entered decimals to base units.

## Status And Activity Tracking

Reload the loan itself with `client.instantLoans.get({ ref })` when you need current loan state, transfer targets, or the latest repayment quote.

If you have a receipt or activity id from the flow, you can also load activity status:

```ts
const activityStatus = await client.activities.getStatus({
  shortRef: loan.ref,
  id: "<activity-or-receipt-id>",
});
```

## Example Apps

The examples are the best starting point for browser integrations.

| Example | What it shows |
| --- | --- |
| [`examples/instant-loans-flow`](./examples/instant-loans-flow) | Full instant loan UX with Dynamic wallet connection, pool selection, LTV preview, loan creation, status reload, activity status, and address recovery |
| [`examples/vite-react-dynamic`](./examples/vite-react-dynamic) | Developer tool for calling SDK methods directly, including instant loan method templates |

Run the instant loan example:

```bash
pnpm install
cp examples/instant-loans-flow/.env.example examples/instant-loans-flow/.env
pnpm --filter @liquidium/example-instant-loans-flow dev
```

Set `VITE_DYNAMIC_ENVIRONMENT_ID` in `examples/instant-loans-flow/.env` before starting the app. Set `VITE_INFURA_API_KEY` when your flow needs Ethereum reads through Infura.

## Browser And Runtime Support

The SDK is intended for browser apps and modern TypeScript runtimes.

| Requirement | Notes |
| --- | --- |
| Node.js | 20+ for this repository |
| Package manager | pnpm 9+ for local development |
| Browser APIs | `fetch`, `BigInt`, and standard ESM support |
| Wallet UI | Bring your own wallet provider; the example apps use Dynamic |

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run test
```

## More API Details

See [`packages/client/README.md`](./packages/client/README.md) for the full client API reference. Most new integrations should still start with `client.instantLoans`; profile-based deposit-address flows and ETH contract-interaction flows are advanced paths.

## License

MIT
