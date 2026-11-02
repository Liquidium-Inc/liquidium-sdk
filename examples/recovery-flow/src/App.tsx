import { encodeIcrcAccount } from "@icp-sdk/canisters/ledger/icrc";
import {
  Chain,
  LiquidiumClient,
  type RecoveryAction,
  type RecoveryRequest,
} from "@liquidium/client";
import { type SyntheticEvent, useRef, useState } from "react";
import { formatUnits } from "viem";
import {
  formatError,
  formatJson,
  getDeliveryChains,
  loadRecoveryBalances,
  type PoolRecoveryBalance,
  type RecoverySubmission,
  submitAndRefresh,
} from "./sdk-example";
import {
  connectEthereum,
  connectOisy,
  type EthereumConnection,
  type OisyConnection,
  signEthereumMessage,
  withOisyAuthorization,
} from "./wallet";

const client = new LiquidiumClient({});
type Connection =
  | { kind: "oisy"; value: OisyConnection }
  | { kind: "ethereum"; value: EthereumConnection };
interface SubmissionView extends RecoverySubmission {
  request: RecoveryRequest;
  asset: string;
}

export function App() {
  const [profileInput, setProfileInput] = useState("");
  const [loadedProfile, setLoadedProfile] = useState("");
  const [balances, setBalances] = useState<PoolRecoveryBalance[] | null>(null);
  const [poolId, setPoolId] = useState("");
  const [chain, setChain] = useState<Chain>(Chain.ICP);
  const [receiver, setReceiver] = useState("");
  const [connection, setConnection] = useState<Connection | null>(null);
  const [oisyAccountId, setOisyAccountId] = useState("");
  const [prepared, setPrepared] = useState<RecoveryAction | null>(null);
  const [submission, setSubmission] = useState<SubmissionView | null>(null);
  const [status, setStatus] = useState(
    "Enter a profile or connect a linked wallet to begin."
  );
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const actionInProgress = useRef(false);
  const selected = balances?.find(({ pool }) => pool.id === poolId);
  const oisyAccount =
    connection?.kind === "oisy"
      ? connection.value.accounts.find(
          (account) => encodeIcrcAccount(account) === oisyAccountId
        )
      : undefined;
  const walletAccount =
    connection?.kind === "ethereum" ? connection.value.address : oisyAccountId;
  const hasFunds = selected?.amount !== undefined && selected.amount > 0n;
  const hasSigner = connection?.kind === "ethereum" || !!oisyAccount;

  async function run(message: string, task: () => Promise<void>) {
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setIsBusy(true);
    setStatus(message);
    setError("");
    try {
      await task();
    } catch (failure) {
      setError(formatError(failure));
      setStatus("Action stopped. Read the result below.");
    } finally {
      actionInProgress.current = false;
      setIsBusy(false);
    }
  }

  async function loadProfile(profileId: string) {
    setPrepared(null);
    setBalances(null);
    setLoadedProfile("");
    const rows = await loadRecoveryBalances(client, profileId);
    setProfileInput(profileId);
    setLoadedProfile(profileId);
    setBalances(rows);
    setPoolId(
      rows.find((row) => row.amount !== undefined && row.amount > 0n)?.pool
        .id ??
        rows[0]?.pool.id ??
        ""
    );
    setChain(Chain.ICP);
    setStatus(
      `Checked ${rows.length} pools. ${rows.filter((row) => row.error !== undefined).length} balance reads failed.`
    );
  }

  async function recover() {
    if (!selected || !hasFunds || !connection || !hasSigner)
      throw new Error(
        "Load a funded recovery balance and connect a linked wallet first."
      );
    const request: RecoveryRequest = {
      profileId: loadedProfile,
      poolId,
      chain,
      receiver: receiver.trim(),
    };
    const asset = selected.pool.asset;

    if (connection.kind === "ethereum" && !prepared) {
      const action = await client.lending.prepareRecovery({
        ...request,
        signerWalletAddress: connection.value.address,
      });
      setPrepared(action);
      setStatus(
        "Recovery prepared. Review the exact message below, then sign."
      );
      return;
    }

    // Consume the prepared action before signing. A failed update must not be blindly replayed.
    setPrepared(null);
    let result: RecoverySubmission;
    if (connection.kind === "oisy") {
      if (!oisyAccount) throw new Error("Select an OISY account.");
      result = await withOisyAuthorization(
        connection.value,
        oisyAccount,
        (authorization) =>
          submitAndRefresh(client, loadedProfile, () =>
            client.lending.recover({ ...request, authorization })
          )
      );
    } else {
      if (!prepared) throw new Error("Prepare the recovery first.");
      const wallet = connection.value;
      result = await submitAndRefresh(client, loadedProfile, async () => {
        const signature = await signEthereumMessage(wallet, prepared.message);
        return prepared.submit({ signature, chain: Chain.ETH });
      });
    }
    setSubmission({ ...result, request, asset });
    setBalances(result.balances);
    setStatus(
      result.refreshError
        ? "Recovery submitted. Balance refresh failed; the receipt is saved below."
        : "Recovery submitted. Check the receiving wallet for delivery."
    );
  }

  return (
    <main>
      <header className="page-header">
        <a
          className="brand"
          href="https://liquidium-inc.github.io/liquidium-sdk/"
        >
          Liquidium <span>/ SDK examples</span>
        </a>
        <span className="network">IC mainnet</span>
      </header>
      <div className="intro">
        <p className="eyebrow">PROFILE RECOVERY</p>
        <h1>Bring your funds back.</h1>
        <p>
          Find repayment refunds and rejected deposits. Recover available funds
          to a wallet you choose.
        </p>
      </div>

      <section className="wallet-bar" aria-labelledby="wallet-heading">
        <div>
          <h2 id="wallet-heading">Authorize with a linked wallet</h2>
          <p>Reading balances does not require a wallet. Recovery does.</p>
        </div>
        <div className="button-row">
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              void run("Connecting to OISY…", async () => {
                const value = await connectOisy();
                setConnection({ kind: "oisy", value });
                setOisyAccountId(
                  value.accounts.length === 1
                    ? encodeIcrcAccount(value.accounts[0])
                    : ""
                );
                setPrepared(null);
                setStatus(
                  "OISY connected. Select an account, then load its profile or enter one below."
                );
              })
            }
          >
            Connect OISY
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() =>
              void run("Connecting to Ethereum…", async () => {
                const value = await connectEthereum();
                setConnection({ kind: "ethereum", value });
                setPrepared(null);
                setStatus("Ethereum wallet connected.");
              })
            }
          >
            Connect Ethereum
          </button>
          {connection ? (
            <button
              type="button"
              className="text-button"
              disabled={isBusy}
              onClick={() => {
                setConnection(null);
                setPrepared(null);
                setOisyAccountId("");
              }}
            >
              Disconnect
            </button>
          ) : null}
        </div>
        {connection?.kind === "oisy" ? (
          <label className="full-width">
            OISY account
            <select
              disabled={isBusy}
              value={oisyAccountId}
              onChange={(event) => {
                setOisyAccountId(event.target.value);
                setPrepared(null);
              }}
            >
              <option value="">Select a shared account</option>
              {connection.value.accounts.map((account) => {
                const id = encodeIcrcAccount(account);
                return (
                  <option key={id} value={id}>
                    {id}
                  </option>
                );
              })}
            </select>
          </label>
        ) : null}
        {walletAccount ? (
          <div className="connected full-width">
            <span>
              Connected: <code>{walletAccount}</code>
            </span>
            <button
              type="button"
              disabled={isBusy}
              onClick={() =>
                void run("Finding wallet profile…", async () => {
                  const profileId =
                    await client.accounts.getProfileId(walletAccount);
                  if (!profileId)
                    throw new Error(
                      "No Liquidium profile is linked to this account. Enter the original profile below or connect another account."
                    );
                  await loadProfile(profileId);
                })
              }
            >
              Load wallet profile
            </button>
          </div>
        ) : null}
      </section>

      <div className="workspace">
        <section className="panel" aria-labelledby="balances-heading">
          <div className="section-title">
            <span className="step">01</span>
            <h2 id="balances-heading">Find recovery funds</h2>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void run("Reading recovery balances…", () =>
                loadProfile(profileInput.trim())
              );
            }}
          >
            <fieldset disabled={isBusy}>
              <label htmlFor="profile">
                Liquidium profile principal (required)
              </label>
              <div className="input-action">
                <input
                  id="profile"
                  name="profile"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Profile principal, not your wallet address"
                  value={profileInput}
                  onInvalid={markInvalid}
                  onInput={clearInvalid}
                  onChange={(event) => {
                    setProfileInput(event.target.value);
                    setBalances(null);
                    setLoadedProfile("");
                    setPrepared(null);
                  }}
                />
                <button className="primary" type="submit">
                  Check balances
                </button>
              </div>
            </fieldset>
          </form>
          <p className="hint">
            Checks every pool, including pools with no open position.
          </p>
          {balances ? (
            <fieldset
              className="balance-list"
              aria-label="Pool recovery balances"
            >
              {balances.map((row) => (
                <label
                  className={`balance-row ${poolId === row.pool.id ? "selected" : ""}`}
                  key={row.pool.id}
                >
                  <input
                    type="radio"
                    name="pool"
                    value={row.pool.id}
                    checked={poolId === row.pool.id}
                    disabled={isBusy}
                    onChange={() => {
                      setPoolId(row.pool.id);
                      setChain(Chain.ICP);
                      setPrepared(null);
                    }}
                  />
                  <span className="asset-name">
                    {row.pool.asset}
                    <small>{row.pool.displayName}</small>
                  </span>
                  <span className="balance-value">
                    {row.error !== undefined ? (
                      <span className="error-text">Read failed</span>
                    ) : (
                      formatUnits(row.amount, Number(row.pool.decimals))
                    )}
                    <small>
                      {row.error !== undefined
                        ? row.error
                        : row.amount > 0n
                          ? "Available before fees"
                          : "No recovery funds"}
                    </small>
                  </span>
                </label>
              ))}
              {balances.length === 0 ? (
                <p className="empty">No pools returned by the protocol.</p>
              ) : null}
            </fieldset>
          ) : (
            <div className="empty">
              Your recovery balances will appear here.
            </div>
          )}
          <p className="hint">
            A zero balance can also mean a refund is still processing. Check
            again later.
          </p>
        </section>

        <section className="panel" aria-labelledby="recovery-heading">
          <div className="section-title">
            <span className="step">02</span>
            <h2 id="recovery-heading">Recover to your wallet</h2>
          </div>
          <div className="amount">
            <span>{selected?.pool.asset ?? "Select a pool"}</span>
            <strong>
              {selected?.amount !== undefined
                ? formatUnits(
                    prepared?.data.amount ?? selected.amount,
                    Number(selected.pool.decimals)
                  )
                : "—"}
            </strong>
            <small>
              {prepared ? "Prepared amount" : "Full recovery balance"} ·
              withdrawal fees are deducted
            </small>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void run(
                connection?.kind === "ethereum" && !prepared
                  ? "Checking fees and preparing recovery…"
                  : "Authorizing recovery…",
                async () => {
                  try {
                    await recover();
                  } catch (failure) {
                    // An uncertain update can have moved funds. Require a fresh balance read.
                    if (connection?.kind === "oisy" || prepared) {
                      setBalances(null);
                      setError(
                        `${formatError(failure)} Check balances and the receiving wallet before another attempt.`
                      );
                      setStatus("Recovery was not confirmed.");
                      return;
                    }
                    throw failure;
                  }
                }
              );
            }}
          >
            <fieldset disabled={isBusy || !hasFunds}>
              <label htmlFor="chain">Delivery chain</label>
              <select
                id="chain"
                name="chain"
                value={chain}
                onChange={(event) => {
                  setChain(event.target.value as Chain);
                  setPrepared(null);
                }}
              >
                {(selected
                  ? getDeliveryChains(selected.pool)
                  : [Chain.ICP]
                ).map((deliveryChain) => (
                  <option key={deliveryChain} value={deliveryChain}>
                    {deliveryChain === Chain.ICP
                      ? !selected || selected.pool.asset === "ICP"
                        ? "ICP"
                        : `ICP · ck${selected.pool.asset}`
                      : `${deliveryChain} · native asset`}
                  </option>
                ))}
              </select>
              <label htmlFor="receiver">Destination (required)</label>
              <input
                id="receiver"
                name="receiver"
                required
                autoComplete="off"
                spellCheck={false}
                placeholder={
                  chain === Chain.ICP
                    ? "Receiving IC principal"
                    : "Receiving wallet address"
                }
                value={receiver}
                onInvalid={markInvalid}
                onInput={clearInvalid}
                onChange={(event) => {
                  setReceiver(event.target.value);
                  setPrepared(null);
                }}
              />
              <p className="hint">
                {selected?.pool.asset === "ICP"
                  ? "Receives native ICP. You can also enter an ICRC account or ICP account identifier."
                  : "ICP delivery receives the chain-key asset. Small refunds may not cover native-chain withdrawal fees."}
              </p>
              <button
                className="primary full-width"
                type="submit"
                disabled={!hasSigner}
              >
                {isBusy
                  ? "Working…"
                  : connection?.kind === "ethereum"
                    ? prepared
                      ? "Sign and recover"
                      : "Prepare recovery"
                    : "Recover with OISY"}
              </button>
            </fieldset>
          </form>
          {!hasSigner ? (
            <p className="hint">
              Connect a wallet linked to this profile to authorize recovery.
            </p>
          ) : null}
          {prepared ? (
            <details open>
              <summary>Message to sign</summary>
              <pre>{prepared.message}</pre>
            </details>
          ) : null}
        </section>
      </div>

      <div className="feedback">
        <p role="status">{status}</p>
        <p role="alert" className="error-text">
          {error}
        </p>
      </div>

      {submission ? (
        <section className="panel receipt" aria-labelledby="receipt-heading">
          <div className="section-title">
            <span className="step">03</span>
            <h2 id="receipt-heading">Recovery submitted</h2>
          </div>
          <p>
            {submission.asset} · profile{" "}
            <code>{submission.request.profileId}</code>
          </p>
          <p>
            Check the receiving wallet for final delivery. This receipt records
            the recovery transfer; a reduced recovery balance does not prove
            delivery.
          </p>
          {submission.refreshError ? (
            <p className="error-text">
              Balance refresh failed: {submission.refreshError}. The submission
              above succeeded.
            </p>
          ) : null}
          <pre>
            {formatJson({ request: submission.request, ...submission.receipt })}
          </pre>
          <a
            href={`https://dashboard.internetcomputer.org/canister/${submission.receipt.ledgerCanisterId}`}
            target="_blank"
            rel="noreferrer"
          >
            Open recovery ledger ↗
          </a>
        </section>
      ) : null}

      <footer>
        <span>
          Uses your local <code>@liquidium/client</code> source.
        </span>
        <a
          href="https://liquidium-inc.github.io/liquidium-sdk/guides/recover-funds/"
          target="_blank"
          rel="noreferrer"
        >
          Recovery guide ↗
        </a>
      </footer>
    </main>
  );
}

function markInvalid(event: SyntheticEvent<HTMLInputElement>) {
  event.currentTarget.setAttribute("aria-invalid", "true");
}

function clearInvalid(event: SyntheticEvent<HTMLInputElement>) {
  if (event.currentTarget.validity.valid)
    event.currentTarget.removeAttribute("aria-invalid");
}
