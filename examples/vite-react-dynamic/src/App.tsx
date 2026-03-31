import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import {
  DynamicWidget,
  useDynamicContext,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { useState } from "react";
import {
  bigintJsonReplacer,
  isNativeAddressSupplyInstruction,
} from "./liquidium-client-sdk";
import { useCreateOrResolveAccount } from "./hooks/useCreateOrResolveAccount";
import { useLoadPools } from "./hooks/useLoadPools";
import { usePrepareBtcSupply } from "./hooks/usePrepareBtcSupply";
import { useGetBtcInflowStatus } from "./hooks/useGetBtcInflowStatus";
import { useSubmitBtcInflow } from "./hooks/useSubmitBtcInflow";
import RawRequestsPage from "./RawRequestsPage";

type DynamicPrimaryWallet = NonNullable<
  ReturnType<typeof useDynamicContext>["primaryWallet"]
>;

export default function App() {
  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut, primaryWallet, setShowAuthFlow } = useDynamicContext();

  const [statusMessage, setStatusMessage] = useState<string>(
    "Connect a wallet to start."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<"guided" | "raw-requests">(
    "guided"
  );

  const createOrResolveAccount = useCreateOrResolveAccount({
    onStatus: setStatusMessage,
    onError: setErrorMessage,
  });
  const loadPools = useLoadPools({
    onStatus: setStatusMessage,
    onError: setErrorMessage,
  });
  const prepareBtcSupply = usePrepareBtcSupply({
    onStatus: setStatusMessage,
    onError: setErrorMessage,
  });
  const submitBtcInflow = useSubmitBtcInflow({
    onStatus: setStatusMessage,
    onError: setErrorMessage,
  });
  const getBtcInflowStatus = useGetBtcInflowStatus({
    onStatus: setStatusMessage,
    onError: setErrorMessage,
  });

  const isLoading =
    createOrResolveAccount.isLoading ||
    loadPools.isLoading ||
    prepareBtcSupply.isLoading ||
    submitBtcInflow.isLoading ||
    getBtcInflowStatus.isLoading;

  const connectedWalletAddress = primaryWallet?.address ?? "";
  const liquidiumAccountAddress =
    getLiquidiumAccountAddress(primaryWallet) ?? "";
  const walletChain = getWalletChainLabel(primaryWallet);
  const profileId = createOrResolveAccount.profileId;
  const pools = loadPools.pools;
  const selectedPoolId = loadPools.selectedPoolId;
  const btcPool = loadPools.btcPool;
  const supplyAction = prepareBtcSupply.supplyAction;
  const supplyFlow = prepareBtcSupply.supplyFlow;
  const supplyInstruction = prepareBtcSupply.supplyInstruction;
  const btcInflowTxid = submitBtcInflow.btcInflowTxid;
  const btcInflowStatusResult = getBtcInflowStatus.result;

  async function handleCopyAddress() {
    if (!isNativeAddressSupplyInstruction(supplyInstruction)) {
      return;
    }

    await navigator.clipboard.writeText(supplyInstruction.target.address);
    setStatusMessage("Copied the BTC deposit address.");
  }

  function handleTryBitcoinUri() {
    if (!isNativeAddressSupplyInstruction(supplyInstruction)) {
      return;
    }

    window.open(
      `bitcoin:${supplyInstruction.target.address}`,
      "_blank",
      "noopener,noreferrer"
    );
    setStatusMessage("Opened a bitcoin URI with the returned address.");
  }

  return (
    <main className="example-page">
      <header className="example-header">
        <p className="eyebrow">Liquidium SDK basic example</p>
        <h1>Vite + Dynamic + @liquidium/client</h1>
        <p className="subtitle">
          This page keeps Dynamic limited to wallet connection and signing. The
          main goal is to show the SDK flow clearly.
        </p>
        <div className="button-row">
          <button
            className={activePage === "guided" ? "active-page-button" : ""}
            onClick={() => setActivePage("guided")}
            type="button"
          >
            Guided flow page
          </button>
          <button
            className={
              activePage === "raw-requests" ? "active-page-button" : ""
            }
            onClick={() => setActivePage("raw-requests")}
            type="button"
          >
            Raw SDK requests page
          </button>
        </div>
      </header>

      {activePage === "guided" ? (
        <>
          <section className="example-card">
            <h2>1. Connect a wallet</h2>
            <p>
              Use Dynamic to connect an Ethereum or Bitcoin wallet. The SDK
              examples below will use the connected wallet address and message
              signature.
            </p>
            <div className="button-row">
              {isLoggedIn ? (
                <button onClick={() => void handleLogOut()} type="button">
                  Log out
                </button>
              ) : (
                <button onClick={() => setShowAuthFlow(true)} type="button">
                  Connect wallet
                </button>
              )}
              <DynamicWidget variant="modal" />
            </div>
            <dl className="details-list">
              <div>
                <dt>Connected chain</dt>
                <dd>{walletChain ?? "None"}</dd>
              </div>
              <div>
                <dt>Wallet address</dt>
                <dd>{connectedWalletAddress || "Not connected"}</dd>
              </div>
              <div>
                <dt>SDK account address</dt>
                <dd>{liquidiumAccountAddress || "Not connected"}</dd>
              </div>
            </dl>
          </section>

          <section className="example-card">
            <h2>2. Create or resolve a Liquidium account</h2>
            <p>
              This uses `client.accounts.create(...)`. If the wallet already has
              a profile, the example resolves the existing profile instead.
            </p>
            <button
              disabled={isLoading || !primaryWallet || !liquidiumAccountAddress}
              onClick={() =>
                void createOrResolveAccount.run(
                  primaryWallet,
                  liquidiumAccountAddress
                )
              }
              type="button"
            >
              Create or resolve profile
            </button>
            <dl className="details-list">
              <div>
                <dt>Profile ID</dt>
                <dd>{profileId ?? "Not created yet"}</dd>
              </div>
            </dl>
          </section>

          <section className="example-card">
            <h2>3. Query pools and pick the BTC pool</h2>
            <p>
              This uses `client.market.getPools()` and stores the BTC pool if it
              is available.
            </p>
            <div className="button-row">
              <button
                disabled={isLoading}
                onClick={() => void loadPools.run()}
                type="button"
              >
                Load pools
              </button>
              <select
                disabled={pools.length === 0}
                value={selectedPoolId}
                onChange={(event) =>
                  loadPools.setSelectedPoolId(event.target.value)
                }
              >
                <option value="">Choose a pool</option>
                {pools.map((pool) => (
                  <option key={pool.id} value={pool.id}>
                    {pool.asset} on {pool.chain}
                  </option>
                ))}
              </select>
            </div>
            <p className="inline-note">
              BTC pool:{" "}
              {btcPool ? btcPool.id : "Load pools to see if BTC is available."}
            </p>
          </section>

          <section className="example-card">
            <h2>4. Get the BTC deposit address</h2>
            <p>
              This uses `client.lending.createSupplyFlow(...)` with the selected
              pool as the source of truth and asks for a native BTC address
              target.
            </p>
            <div className="button-row">
              <select
                value={supplyAction}
                onChange={(event) =>
                  prepareBtcSupply.setSupplyAction(
                    event.target.value as typeof supplyAction
                  )
                }
              >
                <option value="deposit">Deposit</option>
                <option value="repayment">Repayment</option>
              </select>
              <button
                disabled={isLoading || !profileId || !selectedPoolId}
                onClick={() =>
                  void prepareBtcSupply.run({ profileId, selectedPoolId })
                }
                type="button"
              >
                Prepare BTC flow
              </button>
            </div>
            <pre className="code-block">
              {supplyInstruction
                ? JSON.stringify(supplyInstruction, bigintJsonReplacer, 2)
                : "No supply instruction yet."}
            </pre>
            <div className="button-row">
              <button
                disabled={!isNativeAddressSupplyInstruction(supplyInstruction)}
                onClick={() => void handleCopyAddress()}
                type="button"
              >
                Copy BTC address
              </button>
              <button
                disabled={!isNativeAddressSupplyInstruction(supplyInstruction)}
                onClick={handleTryBitcoinUri}
                type="button"
              >
                Try send via bitcoin URI
              </button>
            </div>
          </section>

          <section className="example-card">
            <h2>5. Optional: submit your BTC transaction id</h2>
            <p>
              This is optional. The backend can detect inflows by watching known
              deposit addresses; submitting a txid through the prepared flow is
              just a faster hint path.
            </p>
            <div className="button-row">
              <input
                placeholder="BTC txid"
                value={btcInflowTxid}
                onChange={(event) =>
                  submitBtcInflow.setBtcInflowTxid(event.target.value.trim())
                }
              />
              <button
                disabled={isLoading || btcInflowTxid.length === 0}
                onClick={() => void submitBtcInflow.run({ supplyFlow })}
                type="button"
              >
                Submit optional txid hint
              </button>
            </div>
          </section>

          <section className="example-card">
            <h2>6. Watch BTC inflow status</h2>
            <p>
              Use the prepared BTC flow to poll current deposit or repayment
              progress every 5 seconds. If a txid is entered, the query narrows
              to that specific transaction.
            </p>
            <div className="button-row">
              <button
                disabled={isLoading || !profileId}
                onClick={() =>
                  void getBtcInflowStatus.run({
                    profileId,
                    txid: btcInflowTxid || undefined,
                    supplyFlow,
                  })
                }
                type="button"
              >
                Refresh BTC inflow status
              </button>
              <button
                disabled={
                  isLoading ||
                  getBtcInflowStatus.isWatching ||
                  !profileId ||
                  !supplyFlow
                }
                onClick={() =>
                  void getBtcInflowStatus.watch({
                    profileId,
                    txid: btcInflowTxid || undefined,
                    supplyFlow,
                  })
                }
                type="button"
              >
                Start 5 second polling
              </button>
              <button
                disabled={!getBtcInflowStatus.isWatching}
                onClick={getBtcInflowStatus.stopWatching}
                type="button"
              >
                Stop polling
              </button>
            </div>
            <pre className="code-block">
              {btcInflowStatusResult
                ? JSON.stringify(btcInflowStatusResult, bigintJsonReplacer, 2)
                : "No BTC inflow status fetched yet."}
            </pre>
          </section>

          <section className="example-card">
            <h2>Status</h2>
            <p>{statusMessage}</p>
            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          </section>
        </>
      ) : (
        <RawRequestsPage
          defaultAccountAddress={liquidiumAccountAddress}
          defaultWalletAddress={connectedWalletAddress}
        />
      )}
    </main>
  );
}

export function MissingEnvironmentScreen() {
  return (
    <main className="example-page">
      <section className="example-card">
        <h1>Set up Dynamic first</h1>
        <p>
          Copy `.env.example` to `.env` and set `VITE_DYNAMIC_ENVIRONMENT_ID`.
        </p>
      </section>
    </main>
  );
}

function getWalletChainLabel(
  primaryWallet: DynamicPrimaryWallet | null | undefined
): string | null {
  if (!primaryWallet) {
    return null;
  }

  if (isEthereumWallet(primaryWallet)) {
    return "Ethereum";
  }

  if (isBitcoinWallet(primaryWallet)) {
    return "Bitcoin";
  }

  return null;
}

function getLiquidiumAccountAddress(
  primaryWallet: DynamicPrimaryWallet | null | undefined
): string | null {
  if (!primaryWallet) {
    return null;
  }

  if (isBitcoinWallet(primaryWallet)) {
    return getBitcoinPaymentAddress(primaryWallet) ?? primaryWallet.address;
  }

  return primaryWallet.address;
}

function getBitcoinPaymentAddress(
  primaryWallet: DynamicPrimaryWallet
): string | null {
  const paymentAddress = primaryWallet.additionalAddresses?.find(
    (additionalAddress) => additionalAddress.type === "payment"
  )?.address;

  return paymentAddress ?? null;
}
