# Profile recovery example

Read repayment refunds and rejected-inflow recovery balances, then withdraw with
a linked OISY account or browser Ethereum wallet. Uses the local SDK source and
mainnet canisters. No API key or environment file is required.

## Run

From the SDK repository root:

```bash
pnpm install
pnpm --filter @liquidium/example-recovery-flow dev
```

Open http://127.0.0.1:5178.

## Try it

1. Enter an existing Liquidium profile principal and select **Check balances**.
   This is read-only and does not need a wallet. All pools are checked, including
   pools with no position. Failed reads are shown separately from zero balances.
2. Connect OISY or an Ethereum browser wallet linked to that profile. With OISY,
   select the linked account if the wallet shares more than one. **Load wallet
   profile** can find the profile for the selected account.
3. Select a pool with recovery funds, choose the delivery chain, and enter a
   destination. ICP delivery sends ICP or the pool's chain-key token. For
   chain-key tokens, enter an IC principal, not an Ethereum or Bitcoin address.
4. With OISY, select **Recover with OISY** and approve the canister call. With
   Ethereum, select **Prepare recovery**, review the message, then select
   **Sign and recover**. Approval moves real funds and deducts withdrawal fees.
5. Read the receipt and check the receiving wallet. A reduced recovery balance
   alone does not confirm delivery. For non-ICP pools, the receipt records the
   transfer into an outflow subaccount; delivery happens later.

Keep popups enabled for OISY. **Disconnect** clears the example's local
connection; it does not revoke permissions in the wallet.

If recovery is not confirmed, check the recovery balance and destination before
another attempt. The example does not retry updates. If a balance refresh fails
after a successful submission, the receipt is still displayed.

Native-chain fees can exceed a small refund. Choose ICP delivery to receive the
chain-key token instead. A zero balance can mean a refund is still processing;
this example does not generate refunds or replay old repayments.

## Checks

```bash
pnpm --filter @liquidium/example-recovery-flow test
pnpm --filter @liquidium/example-recovery-flow build
```

Tests use mocked clients and signers; they do not move funds.
`src/sdk-example.ts` contains balance discovery and receipt handling.
`src/wallet.ts` contains OISY and Ethereum authorization.

See the [recovery guide](../../docs/guides/recover-funds.mdx) for fee boundaries,
refund eligibility, and receipt fields.
