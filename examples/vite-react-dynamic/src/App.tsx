import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useMemo, useState } from "react";
import {
  bigintJsonReplacer,
  createBorrowOutflow,
  createOrResolveProfileIdSimple,
  findBtcPool,
  formatLiquidiumError,
  isNativeAddressSupplyInstruction,
  loadPoolsAndDefaultSelection,
  prepareBtcSupplyFlow,
  type OutflowDetails,
  type Pool,
  type SupplyAction,
  type SupplyFlow,
} from "./liquidium-client-sdk";
import {
  getBitcoinPaymentAddress,
  getWalletSignatureChain,
  signWalletMessage,
} from "./wallet-signing";

type DynamicPrimaryWallet = NonNullable<
  ReturnType<typeof useDynamicContext>["primaryWallet"]
>;

const DEFAULT_BORROW_AMOUNT = "50000";
const DEFAULT_SUPPLY_ACTION: SupplyAction = "deposit";

export default function App() {
  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut, primaryWallet, setShowAuthFlow } = useDynamicContext();

  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Connect a wallet to start.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [borrowAmount, setBorrowAmount] = useState(DEFAULT_BORROW_AMOUNT);
  const [borrowAddress, setBorrowAddress] = useState("");
  const [borrowResult, setBorrowResult] = useState<OutflowDetails | null>(null);
  const [supplyAction, setSupplyAction] =
    useState<SupplyAction>(DEFAULT_SUPPLY_ACTION);
  const [supplyFlow, setSupplyFlow] = useState<SupplyFlow | null>(null);

  const walletAddress = primaryWallet?.address ?? "";
  const liquidiumAccountAddress = getLiquidiumAccountAddress(primaryWallet) ?? "";
  const walletChain = getWalletChainLabel(primaryWallet);
  const selectedPool = useMemo(() => {
    return pools.find((pool) => pool.id === selectedPoolId) ?? null;
  }, [pools, selectedPoolId]);
  const btcPool = useMemo(() => {
    return findBtcPool(pools) ?? null;
  }, [pools]);

  async function runAction(action: () => Promise<void>) {
    setIsBusy(true);
    setErrorMessage(null);

    try {
      await action();
    } catch (error) {
      setErrorMessage(formatLiquidiumError(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateProfile() {
    await runAction(async () => {
      if (!primaryWallet || !liquidiumAccountAddress) {
        throw new Error("Connect an Ethereum or Bitcoin wallet first.");
      }

      const profileResult = await createOrResolveProfileIdSimple({
        walletAddress: liquidiumAccountAddress,
        chain: getWalletSignatureChain(primaryWallet),
        signMessage: (message) =>
          signWalletMessage(primaryWallet, message, liquidiumAccountAddress),
        onStep: setStatusMessage,
      });

      setProfileId(profileResult.profileId);
      setStatusMessage(
        profileResult.wasCreated
          ? `Created Liquidium profile ${profileResult.profileId}.`
          : `Resolved Liquidium profile ${profileResult.profileId}.`
      );
    });
  }

  async function handleLoadPools() {
    await runAction(async () => {
      setStatusMessage("Loading pools...");

      const nextPoolsResult = await loadPoolsAndDefaultSelection();

      setPools(nextPoolsResult.pools);
      setSelectedPoolId(nextPoolsResult.selectedPoolId);
      setStatusMessage(`Loaded ${nextPoolsResult.pools.length} pools.`);
    });
  }

  async function handleBorrow() {
    await runAction(async () => {
      if (!primaryWallet || !liquidiumAccountAddress) {
        throw new Error("Connect an Ethereum or Bitcoin wallet first.");
      }

      if (!profileId) {
        throw new Error("Create or resolve a Liquidium profile first.");
      }

      if (!selectedPoolId) {
        throw new Error("Load pools and choose a pool first.");
      }

      if (!borrowAddress.trim()) {
        throw new Error("Enter an outflow address first.");
      }

      if (!/^\d+$/.test(borrowAmount)) {
        throw new Error("Borrow amount must be a non-negative integer string.");
      }

      const nextBorrowResult = await createBorrowOutflow({
        profileId,
        poolId: selectedPoolId,
        amount: BigInt(borrowAmount),
        account: borrowAddress.trim(),
        signerAccount: liquidiumAccountAddress,
        chain: getWalletSignatureChain(primaryWallet),
        signMessage: (message) =>
          signWalletMessage(primaryWallet, message, liquidiumAccountAddress),
        onStep: setStatusMessage,
      });

      setBorrowResult(nextBorrowResult);
      setStatusMessage(`Created borrow outflow ${nextBorrowResult.id}.`);
    });
  }

  async function handleStartSupplyFlow() {
    await runAction(async () => {
      if (!profileId) {
        throw new Error("Create or resolve a Liquidium profile first.");
      }

      if (!selectedPoolId) {
        throw new Error("Load pools and choose a pool first.");
      }

      setStatusMessage(`Starting BTC ${supplyAction} flow...`);

      const nextSupplyFlow = await prepareBtcSupplyFlow({
        profileId,
        poolId: selectedPoolId,
        action: supplyAction,
      });

      setSupplyFlow(nextSupplyFlow);
      setStatusMessage(`Started BTC ${supplyAction} flow.`);
    });
  }

  async function handleCopyBtcAddress() {
    const supplyInstruction = supplyFlow?.instruction ?? null;

    if (!isNativeAddressSupplyInstruction(supplyInstruction)) {
      return;
    }

    await navigator.clipboard.writeText(supplyInstruction.target.address);
    setStatusMessage("Copied the BTC deposit address.");
  }

  function handleOpenBitcoinUri() {
    const supplyInstruction = supplyFlow?.instruction ?? null;

    if (!isNativeAddressSupplyInstruction(supplyInstruction)) {
      return;
    }

    window.open(
      `bitcoin:${supplyInstruction.target.address}`,
      "_blank",
      "noopener,noreferrer"
    );
    setStatusMessage("Opened a bitcoin URI.");
  }

  return (
    <main className="example-page">
      <header className="example-header">
        <p className="eyebrow">Liquidium SDK example</p>
        <h1>Use `@liquidium/client` in a few steps</h1>
        <p className="subtitle">
          This example keeps the flow intentionally small: connect a wallet,
          create a profile, load pools, borrow, and start a BTC supply flow.
        </p>
      </header>

      <section className="example-card example-card-accent">
        <h2>The SDK calls you care about</h2>
        <pre className="code-block">{`const profileId = await client.accounts.create({
  account: walletAddress,
  chain,
  walletAdapter,
});

const pools = await client.market.getPools();

const borrow = await client.lending.borrow({
  profileId,
  poolId,
  amount: 50_000n,
  account: outflowAddress,
  signerAccount: walletAddress,
  chain,
  walletAdapter,
});

const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  destination: "nativeAddress",
});`}</pre>
      </section>

      <section className="example-card">
        <h2>1. Connect a wallet</h2>
        <p>Use Dynamic for connection and signing. The SDK handles the protocol calls.</p>
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
        </div>
        <dl className="details-list">
          <div>
            <dt>Connected chain</dt>
            <dd>{walletChain ?? "Not connected"}</dd>
          </div>
          <div>
            <dt>Wallet address</dt>
            <dd>{walletAddress || "Not connected"}</dd>
          </div>
          <div>
            <dt>SDK account address</dt>
            <dd>{liquidiumAccountAddress || "Not connected"}</dd>
          </div>
        </dl>
      </section>

      <section className="example-card">
        <h2>2. Create or resolve a profile</h2>
        <p>This calls `client.accounts.create(...)` and falls back to `resolveProfile(...)` if needed.</p>
        <div className="button-row">
          <button
            disabled={isBusy || !primaryWallet || !liquidiumAccountAddress}
            onClick={() => void handleCreateProfile()}
            type="button"
          >
            Create or resolve profile
          </button>
        </div>
        <dl className="details-list">
          <div>
            <dt>Profile ID</dt>
            <dd>{profileId ?? "Not created yet"}</dd>
          </div>
        </dl>
      </section>

      <section className="example-card">
        <h2>3. Load pools</h2>
        <p>Fetch the pool list once, then pick the pool you want to use for the next calls.</p>
        <div className="button-row">
          <button disabled={isBusy} onClick={() => void handleLoadPools()} type="button">
            Load pools
          </button>
          <select
            disabled={pools.length === 0}
            value={selectedPoolId}
            onChange={(event) => setSelectedPoolId(event.target.value)}
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
          Suggested BTC pool: {btcPool?.id ?? "Load pools to detect it automatically."}
        </p>
      </section>

      <section className="example-card">
        <h2>4. Borrow from a pool</h2>
        <p>This is the shortest borrow path: enter an amount and destination address, then call `client.lending.borrow(...)`.</p>
        <pre className="code-block">{`await client.lending.borrow({
  profileId,
  poolId,
  amount: 50_000n,
  account: outflowAddress,
  signerAccount: walletAddress,
  chain,
  walletAdapter,
});`}</pre>
        <div className="form-grid">
          <label>
            Borrow amount
            <input
              value={borrowAmount}
              onChange={(event) => setBorrowAmount(event.target.value.trim())}
              placeholder="50000"
            />
          </label>
          <label>
            Outflow address
            <input
              value={borrowAddress}
              onChange={(event) => setBorrowAddress(event.target.value.trim())}
              placeholder="Address to receive the borrowed asset"
            />
          </label>
        </div>
        <div className="button-row">
          <button
            disabled={isBusy || !primaryWallet || !profileId || !selectedPoolId}
            onClick={() => void handleBorrow()}
            type="button"
          >
            Borrow
          </button>
        </div>
        <p className="inline-note">
          Selected pool: {selectedPool ? `${selectedPool.asset} on ${selectedPool.chain}` : "Choose a pool first."}
        </p>
        <pre className="code-block">
          {borrowResult
            ? JSON.stringify(borrowResult, bigintJsonReplacer, 2)
            : "No borrow result yet."}
        </pre>
      </section>

      <section className="example-card">
        <h2>5. Start a BTC supply flow</h2>
        <p>Use `client.lending.supply(...)` to get the BTC deposit address and flow metadata.</p>
        <pre className="code-block">{`const supplyFlow = await client.lending.supply({
  profileId,
  poolId,
  action: "deposit",
  destination: "nativeAddress",
});`}</pre>
        <div className="button-row">
          <select
            value={supplyAction}
            onChange={(event) =>
              setSupplyAction(event.target.value as SupplyAction)
            }
          >
            <option value="deposit">Deposit</option>
            <option value="repayment">Repayment</option>
          </select>
          <button
            disabled={isBusy || !profileId || !selectedPoolId}
            onClick={() => void handleStartSupplyFlow()}
            type="button"
          >
            Start BTC flow
          </button>
        </div>
        <div className="button-row">
          <button
            disabled={!isNativeAddressSupplyInstruction(supplyFlow?.instruction ?? null)}
            onClick={() => void handleCopyBtcAddress()}
            type="button"
          >
            Copy BTC address
          </button>
          <button
            disabled={!isNativeAddressSupplyInstruction(supplyFlow?.instruction ?? null)}
            onClick={handleOpenBitcoinUri}
            type="button"
          >
            Open bitcoin URI
          </button>
        </div>
        <pre className="code-block">
          {supplyFlow
            ? JSON.stringify(supplyFlow, bigintJsonReplacer, 2)
            : "No BTC supply flow yet."}
        </pre>
      </section>

      <section className="example-card">
        <h2>Status</h2>
        <p>{statusMessage}</p>
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
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
