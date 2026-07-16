import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type {
  ActivityFilter,
  AssetPrices,
  Pool,
  SupplyFlow,
} from "@liquidium/client";
import { Chain, SupplyAction } from "@liquidium/client";
import { useEffect, useState } from "react";
import { formatConfig } from "./client";
import {
  createDynamicWalletAdapter,
  getConnectedWalletAddress,
} from "./dynamic-wallet";
import {
  formatActivityStatus,
  formatAmount,
  formatError,
  formatOutflowDetails,
  formatPool,
  formatSupplyTarget,
  getRecentActivityIds,
  parseAmountToBaseUnits,
  saveRecentActivityId,
} from "./format";
import {
  borrowWithWallet,
  createSupplyFlow,
  getActivityStatus,
  getOrCreateWalletProfile,
  listProfileActivities,
  loadMarketData,
  registerSupplyTxid,
  validateDepositAmount,
} from "./sdk-example";

const DEFAULT_SUPPLY_ASSET = "USDC";
const DEFAULT_BORROW_ASSET = "USDC";

export function App() {
  const isStatusPage = window.location.pathname.endsWith("/status.html");

  return isStatusPage ? <ActivityTrackerPage /> : <SupplyBorrowPage />;
}

function SupplyBorrowPage() {
  const { primaryWallet } = useDynamicContext();
  const [pools, setPools] = useState<Pool[]>([]);
  const [assetPrices, setAssetPrices] = useState<AssetPrices>({});
  const [profileId, setProfileId] = useState("");
  const [selectedSupplyPoolId, setSelectedSupplyPoolId] = useState("");
  const [supplyAction, setSupplyAction] = useState<SupplyAction>(
    SupplyAction.deposit
  );
  const [supplyChainSelection, setSupplyChainSelection] = useState<Chain>(
    Chain.ETH
  );
  const [selectedBorrowPoolId, setSelectedBorrowPoolId] = useState("");
  const [supplyAmount, setSupplyAmount] = useState("10");
  const [supplyTxid, setSupplyTxid] = useState("");
  const [currentSupplyFlow, setCurrentSupplyFlow] = useState<SupplyFlow | null>(
    null
  );
  const [supplyResult, setSupplyResult] = useState(
    "No deposit or repayment target loaded yet."
  );
  const [submitSupplyResult, setSubmitSupplyResult] = useState(
    "Generate a deposit or repayment target first, then track the txid."
  );
  const [borrowAmount, setBorrowAmount] = useState("9");
  const [borrowChainSelection, setBorrowChainSelection] = useState<Chain>(
    Chain.ETH
  );
  const [borrowDestination, setBorrowDestination] = useState("");
  const [borrowResult, setBorrowResult] = useState(
    "Connect a wallet, then submit a borrow."
  );
  const [profileResult, setProfileResult] = useState(
    "Connect a wallet, then create or load a profile."
  );
  const [status, setStatus] = useState("Ready.");
  const walletAddress = primaryWallet?.address ?? "";
  const walletChain =
    primaryWallet && isEthereumWallet(primaryWallet) ? "ETH" : "Not connected";

  useEffect(() => {
    void run(async () => {
      setStatus("Loading pools...");
      const { pools: loadedPools, assetPrices: loadedAssetPrices } =
        await loadMarketData();
      const defaultSupplyPool = findPoolByAsset(
        loadedPools,
        DEFAULT_SUPPLY_ASSET
      );
      const defaultBorrowPool = findPoolByAsset(
        loadedPools,
        DEFAULT_BORROW_ASSET
      );

      setPools(loadedPools);
      setAssetPrices(loadedAssetPrices);
      setSelectedSupplyPoolId(
        defaultSupplyPool?.id ?? loadedPools[0]?.id ?? ""
      );
      setSelectedBorrowPoolId(
        defaultBorrowPool?.id ?? loadedPools[0]?.id ?? ""
      );
      setSupplyChainSelection(getDefaultChain(defaultSupplyPool));
      setBorrowChainSelection(getDefaultChain(defaultBorrowPool));
      setStatus(`Loaded ${loadedPools.length} pools.`);
    }, setStatus);
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    const selectedBorrowPool = pools.find(
      (pool) => pool.id === selectedBorrowPoolId
    );

    if (
      !selectedBorrowPool ||
      selectedBorrowPool.chain !== Chain.ETH ||
      borrowChainSelection !== Chain.ETH
    ) {
      return;
    }

    setBorrowDestination(walletAddress);
  }, [walletAddress, selectedBorrowPoolId, borrowChainSelection, pools]);

  async function loadPools(): Promise<void> {
    setStatus("Loading pools...");
    const { pools: loadedPools, assetPrices: loadedAssetPrices } =
      await loadMarketData();
    const defaultSupplyPool = findPoolByAsset(
      loadedPools,
      DEFAULT_SUPPLY_ASSET
    );
    const defaultBorrowPool = findPoolByAsset(
      loadedPools,
      DEFAULT_BORROW_ASSET
    );

    setPools(loadedPools);
    setAssetPrices(loadedAssetPrices);
    setSelectedSupplyPoolId(defaultSupplyPool?.id ?? loadedPools[0]?.id ?? "");
    setSelectedBorrowPoolId(defaultBorrowPool?.id ?? loadedPools[0]?.id ?? "");
    setSupplyChainSelection(getDefaultChain(defaultSupplyPool));
    setBorrowChainSelection(getDefaultChain(defaultBorrowPool));
    setStatus(`Loaded ${loadedPools.length} pools.`);
  }

  async function generateSupplyTarget(): Promise<void> {
    const selectedSupplyPool = getSelectedPool(pools, selectedSupplyPoolId);
    const parsedSupplyAmount = parseAmountToBaseUnits(
      supplyAmount,
      selectedSupplyPool.decimals
    );
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    validateDepositAmount({
      action: supplyAction,
      amount: parsedSupplyAmount,
      asset: selectedSupplyPool.asset,
    });

    const actionLabel = formatSupplyAction(supplyAction);

    setStatus(`Generating ${actionLabel.toLowerCase()} target...`);
    setSupplyResult(`Generating ${actionLabel.toLowerCase()} target...`);

    const supplyFlow = await createSupplyFlow({
      profileId: trimmedProfileId,
      poolId: selectedSupplyPool.id,
      action: supplyAction,
      chain: supplyChainSelection,
    });

    setCurrentSupplyFlow(supplyFlow);
    setSupplyResult(
      [
        `${actionLabel} amount to send: ${formatAmount(parsedSupplyAmount, selectedSupplyPool.decimals)} ${selectedSupplyPool.asset}`,
        `Transfer chain: ${supplyChainSelection}`,
        "",
        formatSupplyTarget(supplyFlow.target),
        "",
        "After broadcasting the transfer, paste the txid below to track it.",
      ].join("\n")
    );
    setStatus(`${actionLabel} target generated.`);
  }

  async function submitSupplyTxid(): Promise<void> {
    const txid = supplyTxid.trim();

    if (!currentSupplyFlow) {
      throw new Error("Generate a deposit or repayment target first.");
    }

    if (!txid) {
      throw new Error("Enter a txid.");
    }

    if (currentSupplyFlow.target.chain === Chain.ETH) {
      await trackEthSupplyTxid(txid);
      return;
    }

    const actionLabel = formatSupplyAction(currentSupplyFlow.target.action);

    setStatus(`Registering ${actionLabel.toLowerCase()} txid...`);
    setSubmitSupplyResult(`Registering ${actionLabel.toLowerCase()} txid...`);
    const response = await registerSupplyTxid({
      supplyFlow: currentSupplyFlow,
      txid,
    });
    saveRecentActivityId(response.txid);
    setSubmitSupplyResult(
      [`${actionLabel} txid registered.`, `Txid: ${response.txid}`].join("\n")
    );
    setStatus(`Registered ${actionLabel.toLowerCase()} txid ${response.txid}.`);
  }

  async function trackEthSupplyTxid(txid: string): Promise<void> {
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    setStatus("Loading supply txid activity...");
    setSubmitSupplyResult("Loading activity status...");

    const response = await getActivityStatus({
      profileId: trimmedProfileId,
      id: txid,
    });

    saveRecentActivityId(response.found ? response.activity.id : txid);
    setSubmitSupplyResult(formatActivityStatus(response));
    setStatus(`Loaded activity status for ${txid}.`);
  }

  async function createOrLoadProfile(): Promise<void> {
    setStatus("Loading profile...");
    setProfileResult("Checking for an existing profile...");

    const result = await getOrCreateConnectedWalletProfile(primaryWallet);

    setProfileId(result.profileId);
    setProfileResult(
      `${result.wasCreated ? "Created" : "Loaded existing"} profile: ${result.profileId}`
    );
    setStatus(
      `${result.wasCreated ? "Created" : "Loaded"} profile ${result.profileId}.`
    );
  }

  async function borrow(): Promise<void> {
    const selectedBorrowPool = getSelectedPool(pools, selectedBorrowPoolId);
    const parsedBorrowAmount = parseAmountToBaseUnits(
      borrowAmount,
      selectedBorrowPool.decimals
    );
    const destinationAddress = borrowDestination.trim();
    const signerWalletAddress = getConnectedWalletAddress(primaryWallet);

    if (!destinationAddress) {
      throw new Error("Enter a borrow destination address.");
    }

    setStatus("Loading wallet profile...");
    const result = await getOrCreateConnectedWalletProfile(primaryWallet);
    setProfileId(result.profileId);

    setStatus("Submitting borrow...");
    setBorrowResult("Submitting borrow...");

    const outflow = await borrowWithWallet({
      profileId: result.profileId,
      poolId: selectedBorrowPool.id,
      amount: parsedBorrowAmount,
      chain: borrowChainSelection,
      receiver: destinationAddress,
      signerWalletAddress,
      signerWalletAdapter: createDynamicWalletAdapter(primaryWallet),
    });
    saveRecentActivityId(outflow.id);
    setBorrowResult(
      [
        `Transfer chain: ${borrowChainSelection}`,
        "",
        formatOutflowDetails(outflow),
      ].join("\n")
    );
    setStatus(`Submitted borrow ${outflow.id}.`);
  }

  return (
    <main>
      <nav className="page-switcher" aria-label="Example pages">
        <a className="page-switcher-link page-switcher-link-active" href="/">
          Deposit / repay / borrow
        </a>
        <a className="page-switcher-link" href="/status.html">
          Activity tracker
        </a>
      </nav>

      <h1>Liquidium Deposit Address Flow</h1>
      <p>
        Create or load a profile, generate a native or ck deposit or repayment
        target, then borrow with a Dynamic-connected wallet.
      </p>

      <section>
        <h2>Wallet</h2>
        <DynamicWidget />
        <div className="list-box">
          Connected wallet: {walletAddress || "Not connected"}
          {"\n"}
          Wallet chain: {walletChain}
        </div>
      </section>

      <section>
        <h2>SDK Config</h2>
        <div className="list-box">{formatConfig()}</div>
      </section>

      <section>
        <h2>Available Pools</h2>
        <button type="button" onClick={() => void run(loadPools, setStatus)}>
          Refresh Pools
        </button>
        <div className="list-box">
          {pools.length === 0
            ? "No pools loaded."
            : pools
                .map((pool) =>
                  [
                    formatPool(pool),
                    `Price: ${formatUsdPrice(assetPrices[pool.asset])}`,
                  ].join("\n")
                )
                .join("\n\n")}
        </div>
      </section>

      <section>
        <h2>Profile</h2>
        <label htmlFor="profile-id-input">Profile id</label>
        <input
          id="profile-id-input"
          placeholder="Liquidium profile principal"
          value={profileId}
          onChange={(event) => setProfileId(event.target.value)}
        />
        <button
          type="button"
          onClick={() =>
            void run(createOrLoadProfile, setStatus, setProfileResult)
          }
        >
          Create Or Load Profile
        </button>
        <div className="result-box">{profileResult}</div>
      </section>

      <section>
        <h2>Deposit Or Repayment Target</h2>
        <label htmlFor="supply-action-select">Action</label>
        <select
          id="supply-action-select"
          value={supplyAction}
          onChange={(event) => {
            setSupplyAction(event.target.value as SupplyAction);
            setCurrentSupplyFlow(null);
          }}
        >
          <option value={SupplyAction.deposit}>Deposit</option>
          <option value={SupplyAction.repayment}>Repayment</option>
        </select>

        <label htmlFor="supply-pool-select">Pool</label>
        <select
          id="supply-pool-select"
          value={selectedSupplyPoolId}
          onChange={(event) => {
            const poolId = event.target.value;
            const pool = pools.find((candidate) => candidate.id === poolId);

            setSelectedSupplyPoolId(poolId);
            setSupplyChainSelection(getDefaultChain(pool));
            setCurrentSupplyFlow(null);
          }}
        >
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.asset} on {pool.chain}
            </option>
          ))}
        </select>

        <label htmlFor="supply-chain-select">Transfer chain</label>
        <select
          id="supply-chain-select"
          value={supplyChainSelection}
          onChange={(event) =>
            setSupplyChainSelection(event.target.value as Chain)
          }
        >
          {getChainOptions(
            pools.find((pool) => pool.id === selectedSupplyPoolId)
          ).map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
        <p>
          Choose the chain you will use to send funds. The SDK returns the
          correct deposit or repayment target for that chain.
        </p>

        <label htmlFor="supply-amount-input">
          {formatSupplyAction(supplyAction)} amount to send manually
        </label>
        <input
          id="supply-amount-input"
          inputMode="decimal"
          value={supplyAmount}
          onChange={(event) => setSupplyAmount(event.target.value)}
        />

        <button
          type="button"
          onClick={() => void run(generateSupplyTarget, setStatus)}
        >
          Get {formatSupplyAction(supplyAction)} Target
        </button>
        <div className="result-box">{supplyResult}</div>

        <label htmlFor="supply-txid-input">Broadcast txid</label>
        <input
          id="supply-txid-input"
          placeholder="Paste txid after sending funds"
          value={supplyTxid}
          onChange={(event) => setSupplyTxid(event.target.value)}
        />

        <button
          type="button"
          onClick={() => void run(submitSupplyTxid, setStatus)}
        >
          Track Transfer Txid
        </button>
        <div className="result-box">{submitSupplyResult}</div>
      </section>

      <section>
        <h2>Borrow</h2>
        <label htmlFor="borrow-pool-select">Borrow pool</label>
        <select
          id="borrow-pool-select"
          value={selectedBorrowPoolId}
          onChange={(event) => {
            const poolId = event.target.value;
            const pool = pools.find((candidate) => candidate.id === poolId);

            setSelectedBorrowPoolId(poolId);
            setBorrowChainSelection(getDefaultChain(pool));
            setBorrowDestination("");
          }}
        >
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.asset} on {pool.chain}
            </option>
          ))}
        </select>

        <label htmlFor="borrow-chain-select">Borrow chain</label>
        <select
          id="borrow-chain-select"
          value={borrowChainSelection}
          onChange={(event) => {
            setBorrowChainSelection(event.target.value as Chain);
            setBorrowDestination("");
          }}
        >
          {getChainOptions(
            pools.find((pool) => pool.id === selectedBorrowPoolId)
          ).map((chain) => (
            <option key={chain} value={chain}>
              {chain}
            </option>
          ))}
        </select>
        <p>
          Choose the chain where borrowed funds should arrive. The SDK uses the
          right destination format for that chain.
        </p>

        <label htmlFor="borrow-amount-input">Borrow amount</label>
        <input
          id="borrow-amount-input"
          inputMode="decimal"
          value={borrowAmount}
          onChange={(event) => setBorrowAmount(event.target.value)}
        />

        <label htmlFor="borrow-destination-input">
          {formatDestinationInputLabel(
            "Borrow destination",
            pools.find((pool) => pool.id === selectedBorrowPoolId),
            borrowChainSelection
          )}
        </label>
        <input
          id="borrow-destination-input"
          value={borrowDestination}
          onChange={(event) => setBorrowDestination(event.target.value)}
        />

        <button type="button" onClick={() => void run(borrow, setStatus)}>
          Borrow With Dynamic Wallet
        </button>
        <div className="result-box">{borrowResult}</div>
      </section>

      <section>
        <h2>Status</h2>
        <pre>{status}</pre>
      </section>
    </main>
  );
}

function ActivityTrackerPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const [profileId, setProfileId] = useState(
    searchParams.get("profileId") ?? ""
  );
  const [activityId, setActivityId] = useState(
    searchParams.get("activityId") ?? ""
  );
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [activitiesOutput, setActivitiesOutput] = useState(
    "Enter a profile id to load activities."
  );
  const [activityOutput, setActivityOutput] = useState(
    "Enter a profile id and activity id."
  );
  const [recentActivityIds, setRecentActivityIds] = useState<string[]>(() =>
    getRecentActivityIds()
  );
  const [status, setStatus] = useState("Ready.");

  async function loadActivities(): Promise<void> {
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    setStatus("Loading activities...");
    setActivitiesOutput("Loading activities...");

    const activities = await listProfileActivities({
      profileId: trimmedProfileId,
      filter: activityFilter,
    });

    if (activities.length === 0) {
      setActivitiesOutput("No activities found.");
      setStatus("No activities found.");
      return;
    }

    for (const activity of activities) {
      saveRecentActivityId(activity.id);
    }

    setRecentActivityIds(getRecentActivityIds());
    setActivitiesOutput(
      activities
        .map((activity) => formatActivityStatus({ found: true, activity }))
        .join("\n\n")
    );
    setStatus(
      `Loaded ${activities.length} activit${activities.length === 1 ? "y" : "ies"}.`
    );
  }

  async function loadActivityStatus(): Promise<void> {
    const trimmedProfileId = profileId.trim();
    const trimmedActivityId = activityId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    if (!trimmedActivityId) {
      throw new Error("Enter an activity id.");
    }

    setStatus("Loading activity status...");
    setActivityOutput("Loading activity status...");

    const response = await getActivityStatus({
      profileId: trimmedProfileId,
      id: trimmedActivityId,
    });

    if (response.found) {
      saveRecentActivityId(response.activity.id);
      setRecentActivityIds(getRecentActivityIds());
    }

    setActivityOutput(formatActivityStatus(response));
    setStatus(`Loaded activity status for ${trimmedActivityId}.`);
  }

  return (
    <main>
      <nav className="page-switcher" aria-label="Example pages">
        <a className="page-switcher-link" href="/">
          Supply / borrow
        </a>
        <a
          className="page-switcher-link page-switcher-link-active"
          href="/status.html"
        >
          Activity tracker
        </a>
      </nav>

      <h1>Liquidium Activity Tracker</h1>
      <p>
        Track normal pool supply and borrow activity by profile id or
        receipt/activity id.
      </p>

      <section>
        <h2>SDK Config</h2>
        <div className="list-box">{formatConfig()}</div>
      </section>

      <section>
        <h2>Profile Activities</h2>
        <label htmlFor="profile-id-input">Profile id</label>
        <input
          id="profile-id-input"
          placeholder="Liquidium profile principal"
          value={profileId}
          onChange={(event) => setProfileId(event.target.value)}
        />

        <label htmlFor="activity-filter-select">Activity filter</label>
        <select
          id="activity-filter-select"
          value={activityFilter}
          onChange={(event) =>
            setActivityFilter(event.target.value as ActivityFilter)
          }
        >
          <option value="active">In progress</option>
          <option value="all">All activity</option>
          <option value="completed">Completed</option>
        </select>

        <button
          type="button"
          onClick={() => void run(loadActivities, setStatus)}
        >
          Load Activities
        </button>
        <div className="result-box">{activitiesOutput}</div>
      </section>

      <section>
        <h2>Activity Status</h2>
        <label htmlFor="activity-id-input">Activity id</label>
        <input
          id="activity-id-input"
          placeholder="Activity or receipt id"
          value={activityId}
          onChange={(event) => setActivityId(event.target.value)}
        />

        <button
          type="button"
          onClick={() => void run(loadActivityStatus, setStatus)}
        >
          Load Activity Status
        </button>
        <div className="result-box">{activityOutput}</div>
      </section>

      <section>
        <h2>Recent Activity Ids</h2>
        <div className="list-box">
          {recentActivityIds.length === 0
            ? "No recent activity ids stored in this browser."
            : recentActivityIds.map((recentActivityId) => (
                <a
                  key={recentActivityId}
                  className="recent-loan-link"
                  href={`/status.html?activityId=${encodeURIComponent(recentActivityId)}`}
                >
                  {recentActivityId}
                </a>
              ))}
        </div>
      </section>

      <section>
        <h2>Status</h2>
        <pre>{status}</pre>
      </section>
    </main>
  );
}

function getChainOptions(pool: Pool | undefined): Chain[] {
  const defaultChain = getDefaultChain(pool);

  return defaultChain === Chain.ICP ? [Chain.ICP] : [defaultChain, Chain.ICP];
}

function formatSupplyAction(action: SupplyAction): string {
  return action === SupplyAction.repayment ? "Repayment" : "Deposit";
}

function getDefaultChain(pool: Pool | undefined): Chain {
  return (pool?.chain as Chain | undefined) ?? Chain.ETH;
}

function formatDestinationInputLabel(
  prefix: string,
  pool: Pool | undefined,
  chain: Chain
): string {
  if (pool?.chain === Chain.ICP) {
    return `${prefix} ICRC account`;
  }

  return chain === Chain.ICP ? `${prefix} IC principal` : `${prefix} address`;
}

async function getOrCreateConnectedWalletProfile(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): Promise<{ profileId: string; wasCreated: boolean }> {
  const account = getConnectedWalletAddress(primaryWallet);

  return await getOrCreateWalletProfile({
    account,
    walletAdapter: createDynamicWalletAdapter(primaryWallet),
  });
}

function findPoolByAsset(pools: Pool[], asset: string): Pool | undefined {
  return pools.find((pool) => pool.asset === asset);
}

function getSelectedPool(pools: Pool[], poolId: string): Pool {
  const pool = pools.find((candidatePool) => candidatePool.id === poolId);

  if (!pool) {
    throw new Error("Select an available pool first.");
  }

  if (pool.frozen) {
    throw new Error(`${pool.asset} on ${pool.chain} is currently frozen.`);
  }

  return pool;
}

function formatUsdPrice(price: number | undefined): string {
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return "unavailable";
  }

  return `$${price.toLocaleString(undefined, {
    maximumFractionDigits: 8,
  })}`;
}

async function run(
  action: () => Promise<void>,
  setStatus: (message: string) => void,
  setErrorResult?: (message: string) => void
): Promise<void> {
  try {
    await action();
  } catch (error) {
    const errorMessage = `Error: ${formatError(error)}`;
    setStatus(errorMessage);
    setErrorResult?.(errorMessage);
  }
}
