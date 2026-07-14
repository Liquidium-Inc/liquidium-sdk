![npm](https://img.shields.io/npm/v/@liquidium/client?label=%40liquidium%2Fclient)
![license](https://img.shields.io/badge/license-MIT-blue)

<p align="center">
  <img src="https://raw.githubusercontent.com/Liquidium-Inc/liquidium-sdk/main/sdk.svg" alt="Liquidium SDK illustration" width="700" />
</p>

<h1 align="center">Liquidium SDK</h1>

<p align="center">
  Use the Liquidium SDK from TypeScript apps. Start with accountless Simple Loans.
</p>

<p align="center">
  <a href="https://liquidium-inc.github.io/liquidium-sdk/"><b>SDK Docs</b></a> ·
  <a href="https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/simple-loans-flow"><b>Simple Loans Example</b></a> ·
  <a href="https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/sdk-method-query"><b>SDK Method Query Example</b></a> ·
  <a href="#core-api"><b>Core API</b></a>
</p>

## Documentation

Use the SDK docs for setup, guides, API reference, and examples.

[Open the Liquidium SDK docs](https://liquidium-inc.github.io/liquidium-sdk/)

## Why Start With Simple Loans

- **Accountless loan creation**: create simple loans without requiring a Liquidium profile.
- **Generated transfer targets**: get collateral deposit and repayment targets from the SDK response.
- **Reference-based restore**: save `loan.ref` and reload loan state from any browser session or support link.
- **LTV checks**: use market pools and prices to validate collateral and borrow amounts before loan creation.
- **Status and repayment quote**: reload lifecycle status, position state, and repayment amount in one call.

## Integration Paths

Liquidium supports two borrowing and lending integration paths:

| Path | Use when | Main SDK calls |
| --- | --- | --- |
| Recommended: accountless Simple Loans | You want a short checkout-style flow where users borrow against collateral without creating a Liquidium profile first | `client.simpleLoans.create(...)`, `client.simpleLoans.get(...)`, `client.simpleLoans.find(...)`, `client.activities.list(...)` |
| Account-based profile flows | You want users to keep a Liquidium profile, manage positions across sessions, supply funds, borrow, withdraw, or use ETH contract-interaction deposits | `client.accounts.createProfile(...)`, `client.lending.supply(...)`, `client.lending.borrow(...)`, `client.lending.withdraw(...)`, `client.positions.listPositions(...)` |

Use accountless Simple Loans for new borrow flows unless you need profile-level position management. Use account-based flows when your app owns the full lending dashboard experience.

## Quick Start

Install the client package:

```bash
npm install @liquidium/client
```

Create a simple loan, display the deposit target, and restore the loan by reference:

```ts
import {
  Asset,
  Chain,
  LiquidiumClient,
  type Pool,
  type SupplyTarget,
} from "@liquidium/client";

const client = new LiquidiumClient();

const [pools, prices] = await Promise.all([
  client.market.listPools(),
  client.market.getAssetPrices(),
]);

const collateralPool = requirePool(pools, Asset.BTC, Chain.BTC);
const borrowPool = requirePool(pools, Asset.USDC, Chain.ETH);

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

const loan = await client.simpleLoans.create({
  collateral: {
    poolId: collateralPool.id,
    asset: Asset.BTC,
    amount: collateralAmount,
  },
  borrow: {
    poolId: borrowPool.id,
    asset: Asset.USDC,
    amount: borrowAmount,
    chain: Chain.ETH,
    destination: "0x2222222222222222222222222222222222222222",
  },
  refund: {
    chain: Chain.BTC,
    destination: "1BoatSLRHtKNngkdXEeobR76b53LETtpyT",
  },
  ltvMaxBps: ltv.maxAllowedLtvBps,
  depositWindowSeconds: 3_600n,
});

const initialDeposit = loan.initialDeposit.targets[Chain.BTC];
if (!initialDeposit) {
  throw new Error("Missing BTC initial-deposit target.");
}

console.log("Save this loan reference:", loan.ref);
console.log("Send initial deposit amount:", initialDeposit.amount.toString());
console.log("Send collateral to:", formatSupplyTarget(initialDeposit.target));

const restoredLoan = await client.simpleLoans.get({ ref: loan.ref });
const repayment = restoredLoan.repayment.targets[Chain.ETH];

console.log("Loan status:", restoredLoan.status);
console.log("Repay amount:", repayment?.amount.toString() ?? "0");
console.log(
  "Repay target:",
  repayment ? formatSupplyTarget(repayment.target) : "No repayment due"
);

const activities = await client.activities.list({ shortRef: loan.ref });

console.log("Loan activities:", activities);

const foundLoans = await client.simpleLoans.find(loan.ref);

console.log("Found loan reference:", foundLoans[0]?.ref);
console.log("Found loan collateral:", foundLoans[0]?.collateral.amount.toString());

function requirePool(
  pools: Pool[],
  asset: Pool["asset"],
  chain: Pool["chain"]
): Pool {
  const pool = pools.find(
    (candidate) => candidate.asset === asset && candidate.chain === chain
  );

  if (!pool) {
    throw new Error(`Missing ${chain}/${asset} pool.`);
  }

  if (pool.frozen) {
    throw new Error(`${chain}/${asset} pool is frozen.`);
  }

  return pool;
}

function formatSupplyTarget(target: SupplyTarget): string {
  return target.address;
}
```

## Simple Loans Flow

Simple Loans integrations use this sequence:

| Step | SDK call | What your app does |
| --- | --- | --- |
| Load market data | `client.market.listPools()` and `client.market.getAssetPrices()` | Show supported collateral and borrow assets |
| Validate amounts | `client.quote.calculateLtv(...)` | Block too-small borrow amounts, invalid LTV, or frozen-pool input before creating a loan |
| Create loan | `client.simpleLoans.create(...)` | Store `loan.ref` and show the quote in `loan.initialDeposit.targets[chain]` |
| Track loan | `client.simpleLoans.get({ ref })`, `client.simpleLoans.find(...)`, and `client.activities.list({ shortRef: ref })` | Reload loan state, initial deposit quote, and repayment activity |
| Repay loan | Read `loan.repayment.targets[chain]` | Ask the user to send the quote amount to its target; no quote means no repayment is due on that chain |

`client.simpleLoans.create(...)` and `client.simpleLoans.get(...)` return the generated Liquidium profile, current position state, and transfer quotes keyed by the chain the user will send on. Users do not manage the generated profile.

`client.market.listPools()` returns only pools whose asset and chain variants are supported by this SDK version. BTC, USDC, USDT, and ICP lending pools are returned. Future unsupported variants such as `SOL` are omitted from the returned list.

`client.market.findPool({ chain, asset })` accepts the same Chain + Asset identifiers used by transfer flows. Chain-key identifiers resolve to their backing pool, so both `{ chain: "ETH", asset: "USDT" }` and `{ chain: "ICP", asset: "USDT" }` return the USDT pool.

## Core API

### `client.simpleLoans.create(request)`

Creates an accountless simple loan and returns generated transfer targets.

| Field | Description |
| --- | --- |
| `collateral` | Collateral `poolId`, `asset`, and intended credited `amount` in base units |
| `borrow` | Borrow `poolId`, `asset`, `amount`, delivery `chain`, and `destination` |
| `refund` | Refund `chain` and `destination` for returned collateral |
| `ltvMaxBps` | Maximum LTV in basis points, where `6_000n` is 60% |
| `depositWindowSeconds` | How long the user has to send collateral |

`borrow.destination` and `refund.destination` can be address strings or typed account objects such as `{ type: "ChainAddress", address: "bc1q..." }`, `{ type: "IcPrincipal", address: "aaaaa-aa" }`, or `{ type: "IcrcAccount", address: "aaaaa-aa" }`. Prefer typed objects when the destination family matters.

Destination validation is chain-specific and runs before loan creation:

| Asset path | Chain | Valid destination family |
| --- | --- | --- |
| BTC L1 | `"BTC"` | BTC mainnet chain address |
| ETH L1 USDC/USDT | `"ETH"` | EVM chain address |
| ICP native | `"ICP"` | IC principal, ICRC account, or ICP account identifier |
| ckBTC, ckUSDC, ckUSDT | `"ICP"` | IC principal |

The SDK rejects mismatched L1-vs-IC destination families, such as an ETH address for a ck-ledger delivery or a BTC/EVM address for an ICP destination.

If creation succeeds remotely but response hydration fails, the SDK throws `SimpleLoanCreatedError`. The error includes `loanId` and `ref`; recover with `simpleLoans.get(...)` and do not submit `create(...)` again.

### `client.simpleLoans.get({ ref })`

Loads loan state from a saved user-facing reference.

Use this for status pages, refreshes, and support links. The SDK combines canister state with the Liquidium SDK API lookup so the restored loan includes the original collateral deposit hint.

### `client.simpleLoans.get({ loanId })`

Loads loan state by numeric canister loan id.

Use this when your backend stores the numeric id instead of the short reference.

### `client.simpleLoans.find(query)`

Finds simple loans by short reference, numeric canister loan id string, generated deposit or repayment address, borrow or refund destination address, or indexed transaction id/hash through the SDK API search index.

Use this for recovery and manage pages where the user may paste any loan identifier. The method returns lightweight matches because address and transaction-id lookups can match many loans. Use `client.simpleLoans.get(...)` after the user selects a match.

```ts
const results = await client.simpleLoans.find("bc1q...");
const byRef = await client.simpleLoans.find("ABC123");
const byLoanId = await client.simpleLoans.find("42");

for (const result of results) {
  console.log(result.ref);
  console.log(result.loanId);
  console.log(result.collateral.asset, result.borrow.asset);
  console.log(result.collateral.amount);
}

const selectedLoan = await client.simpleLoans.get({ loanId: results[0].loanId });
```

Call `get(...)` when you already have an exact canister identifier and want direct canister lookup without an array:

```ts
const loanById = await client.simpleLoans.get({ loanId: 123n });
const loanByRef = await client.simpleLoans.get({ ref: "ABC123" });
```

### `client.quote.calculateLtv(request, pools, prices)`

Calculates implied LTV from selected pools, prices, borrow amount, and collateral amount.

Use this before `client.simpleLoans.create(...)` so your app can block invalid input and choose a safe `ltvMaxBps`.

### Borrow minimums

The SDK enforces product minimums before borrow creation:

| Asset | Minimum borrow amount |
| --- | --- |
| BTC | `5_100n` sats |
| USDC | `1_000_000n` base units |
| USDT | `1_000_000n` base units |

Use `getMinimumBorrowAmount(asset)` to display the same minimum that `client.quote.calculateLtv(...)`, `client.quote.getQuote(...)`, `client.simpleLoans.create(...)`, and `client.lending.prepareBorrow(...)` enforce.

### Withdraw minimums

The SDK enforces product minimums before withdraw creation:

| Asset | Minimum withdraw amount |
| --- | --- |
| BTC | `5_000n` sats |
| USDC | `1_000_000n` base units |
| USDT | `1_000_000n` base units |

Use `getMinimumWithdrawAmount(asset)` to display the same minimum that `client.lending.prepareWithdraw(...)` enforces.

### Profile full withdraw amounts

For profile-based withdraw flows, call `client.positions.getFullWithdrawAmount(profileId, poolId)` before building the withdraw request. The helper returns `{ amount, decimals }`: pass `amount` to `client.lending.withdraw(...)` or `client.lending.prepareWithdraw(...)`, and use `decimals` for display formatting. Do not add `earnedInterest`; the returned amount already uses the current supplied balance.

## Response Fields

Most Simple Loans UIs show or store these fields:

| Field | Use |
| --- | --- |
| `loan.ref` | Save and show this reference so the loan can be restored later |
| `loan.status` | Shared lifecycle status: `{ operation, state, confirmations, requiredConfirmations }` |
| `loan.initialDeposit.collateralAmount` | Intended credited collateral target used for LTV |
| `loan.initialDeposit.targets[chain]` | Fee-inclusive amount, fee estimate, and destination for that transfer chain |
| `loan.initialDeposit.detectedTimestamp` | Unix timestamp in seconds when the collateral deposit was detected, or `null` before detection |
| `loan.initialDeposit.expiryTimestamp` | Unix timestamp in seconds when the collateral deposit window expires, or `null` before detection when unavailable |
| `loan.repayment.targets[chain]` | Full repayment quote and destination for that transfer chain |
| `loan.position` | Current collateral, debt, and interest state for the generated profile |

`client.simpleLoans.find(...)` returns lightweight search matches with `loanId`, `ref`, `createdAt`, `profileId`, `collateral`, and `borrow`. Use `client.simpleLoans.get(...)` to load full loan fields, and use `client.activities.list(...)` separately when you need deposit, borrow, repayment, or withdrawal activity.

## Amounts

The SDK returns amount fields as `bigint` values in the asset's smallest unit.

| Asset type | Example |
| --- | --- |
| BTC | Satoshis |
| ICP | e8s |
| USDC / USDT | Token base units using the pool decimals |

Use `Pool.decimals` from `client.market.listPools()` when converting user-entered decimals to base units. Hydrated simple loans also include `loan.collateral.decimals`, `loan.borrow.decimals`, and `loan.initialDeposit.decimals` for display.

## Status And Activity Tracking

Reload loans with `client.simpleLoans.get({ ref })` when you need current state, transfer targets, or the latest repayment quote.

Status-returning methods use the same `LiquidiumStatus` shape:

```ts
type LiquidiumStatus = {
  operation: "deposit" | "borrow" | "repayment" | "withdrawal" | "liquidation";
  state: "action_required" | "confirming" | "processing" | "active" | "completed" | "failed" | "expired";
  confirmations: number | null;
  requiredConfirmations: number | null;
};
```

`action_required` means the user or app must do something, such as sending funds. `confirming` means a tx is known but still needs confirmations. `processing` means confirmations are sufficient and Liquidium or the protocol is still processing. `active` means the loan is live and waiting for the next repayment action.

Use activities to track collateral deposits, borrow outflows, repayment deposits, confirmations, and fee top-ups. Activity confirmations are exposed on `activity.status`. Activity lists default to active items; pass `filter: "all"` when you need completed activity too. The activities module accepts the saved simple loan reference and resolves the generated profile for you:

Activities expose chain transaction ids on `activity.txids` when ids are available.

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
| [`examples/simple-loans-flow`](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/simple-loans-flow) | Accountless Simple Loans UX with manual destination addresses, pool selection, LTV preview, loan creation, status reload, activity status, and loan recovery |
| [`examples/sdk-method-query`](https://github.com/Liquidium-Inc/liquidium-sdk/tree/main/examples/sdk-method-query) | Developer tool for calling SDK methods, including Simple Loans method templates |

Run the Simple Loans example:

```bash
git clone https://github.com/Liquidium-Inc/liquidium-sdk.git
cd liquidium-sdk
pnpm install
pnpm --filter @liquidium/example-simple-loans-flow dev
```

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

This README covers `@liquidium/client`. Start new integrations with `client.simpleLoans`; profile-based deposit-address flows and ETH contract-interaction flows are advanced paths.

## License

MIT
