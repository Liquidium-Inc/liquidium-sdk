import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type {
  ActivityFilter,
  Pool,
  SupplyAction as SupplyActionType,
} from "@liquidium/client";
import { Chain, SupplyAction } from "@liquidium/client";
import { useEffect, useState } from "react";
import { formatConfig } from "./client";
import {
  createDynamicBitcoinWalletAdapter,
  getConnectedBitcoinAddress,
  getOptionalConnectedBitcoinAddress,
} from "./dynamic-wallet";
import {
  formatActivityStatus,
  formatAmount,
  formatBtcSupplyFlow,
  formatError,
  formatPool,
  getRecentActivityIds,
  parseAmountToBaseUnits,
  saveRecentActivityId,
} from "./format";
import {
  getActivityStatus,
  getOrCreateWalletProfile,
  listMarketPools,
  listProfileActivities,
  submitBtcSupply,
} from "./sdk-example";

const DEFAULT_SUPPLY_AMOUNT_BTC = "0.0001";

export function App() {
  const isStatusPage = window.location.pathname.endsWith("/status.html");

  return isStatusPage ? <ActivityTrackerPage /> : <BtcInteractionsPage />;
}

function BtcInteractionsPage() {
  const { primaryWallet } = useDynamicContext();
  const [pools, setPools] = useState<Pool[]>([]);
  const [profileId, setProfileId] = useState("");
  const [profileResult, setProfileResult] = useState(
    "Connect a Bitcoin wallet, then create or load a profile."
  );
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [supplyAction, setSupplyAction] = useState<SupplyActionType>(
    SupplyAction.deposit
  );
  const [supplyAmount, setSupplyAmount] = useState(DEFAULT_SUPPLY_AMOUNT_BTC);
  const [supplyResult, setSupplyResult] = useState(
    "No BTC transaction submitted yet."
  );
  const [status, setStatus] = useState("Ready.");
  const walletAddress = getOptionalConnectedBitcoinAddress(primaryWallet);
  const btcPools = getBtcPools(pools);

  useEffect(() => {
    void run(async () => {
      setStatus("Loading BTC pools...");
      const loadedPools = await listMarketPools();
      const availableBtcPools = getBtcPools(loadedPools);

      setPools(loadedPools);
      setSelectedPoolId(availableBtcPools[0]?.id ?? "");
      setStatus(`Loaded ${availableBtcPools.length} BTC pools.`);
    }, setStatus);
  }, []);

  async function loadPools(): Promise<void> {
    setStatus("Loading BTC pools...");
    const loadedPools = await listMarketPools();
    const availableBtcPools = getBtcPools(loadedPools);

    setPools(loadedPools);
    setSelectedPoolId(availableBtcPools[0]?.id ?? "");
    setStatus(`Loaded ${availableBtcPools.length} BTC pools.`);
  }

  async function createOrLoadProfile(): Promise<void> {
    setStatus("Loading BTC profile...");
    setProfileResult("Checking for an existing profile...");

    const { profileId: nextProfileId, wasCreated } =
      await getOrCreateConnectedBitcoinProfile(primaryWallet);

    setProfileId(nextProfileId);
    setProfileResult(
      `${wasCreated ? "Created" : "Loaded existing"} profile: ${nextProfileId}`
    );
    setStatus(`${wasCreated ? "Created" : "Loaded"} profile ${nextProfileId}.`);
  }

  async function submitBtcInteraction(): Promise<void> {
    const account = getConnectedBitcoinAddress(primaryWallet);
    const selectedPool = getSelectedBtcPool(btcPools, selectedPoolId);
    const amount = parseAmountToBaseUnits(supplyAmount, selectedPool.decimals);
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    setStatus(`Submitting BTC ${supplyAction}...`);
    setSupplyResult(`Submitting BTC ${supplyAction}...`);

    const supplyFlow = await submitBtcSupply({
      profileId: trimmedProfileId,
      poolId: selectedPool.id,
      action: supplyAction,
      account,
      amount,
      walletAdapter: createDynamicBitcoinWalletAdapter(primaryWallet),
    });

    if (supplyFlow.txid) {
      saveRecentActivityId(supplyFlow.txid);
    }

    setSupplyResult(
      [
        `Sent amount: ${formatAmount(amount, selectedPool.decimals)} ${selectedPool.asset}`,
        `Action: ${supplyAction}`,
        "",
        formatBtcSupplyFlow(supplyFlow, supplyAction),
        "",
        "Use the txid on the Activity tracker page to follow status.",
      ].join("\n")
    );
    setStatus(
      `Submitted BTC ${supplyAction} ${supplyFlow.txid ?? "without txid"}.`
    );
  }

  return (
    <main>
      <nav className="page-switcher" aria-label="Example pages">
        <a className="page-switcher-link page-switcher-link-active" href="/">
          BTC supply
        </a>
        <a className="page-switcher-link" href="/status.html">
          Activity tracker
        </a>
      </nav>

      <h1>Liquidium BTC Interactions Flow</h1>
      <p>
        Create or load a BTC-backed Liquidium profile, then supply or repay BTC
        through a Dynamic-connected Bitcoin wallet.
      </p>

      <section>
        <h2>Wallet</h2>
        <DynamicWidget />
        <div className="list-box">
          Connected wallet: {walletAddress || "Not connected"}
          {"\n"}
          Wallet chain: BTC
        </div>
      </section>

      <section>
        <h2>SDK Config</h2>
        <div className="list-box">{formatConfig()}</div>
      </section>

      <section>
        <h2>BTC Pools</h2>
        <button type="button" onClick={() => void run(loadPools, setStatus)}>
          Refresh Pools
        </button>
        <div className="list-box">
          {btcPools.length === 0
            ? "No BTC pools loaded."
            : btcPools.map(formatPool).join("\n\n")}
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
          Create or Load Connected BTC Profile
        </button>
        <div className="result-box">{profileResult}</div>
      </section>

      <section>
        <h2>BTC Supply Or Repay</h2>

        <label htmlFor="supply-pool-select">BTC pool</label>
        <select
          id="supply-pool-select"
          value={selectedPoolId}
          onChange={(event) => setSelectedPoolId(event.target.value)}
        >
          {btcPools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.asset} on {pool.chain}
            </option>
          ))}
        </select>

        <label htmlFor="supply-action-select">Action</label>
        <select
          id="supply-action-select"
          value={supplyAction}
          onChange={(event) =>
            setSupplyAction(event.target.value as SupplyActionType)
          }
        >
          <option value={SupplyAction.deposit}>Supply deposit</option>
          <option value={SupplyAction.repayment}>Repayment</option>
        </select>

        <label htmlFor="supply-amount-input">BTC amount</label>
        <input
          id="supply-amount-input"
          inputMode="decimal"
          value={supplyAmount}
          onChange={(event) => setSupplyAmount(event.target.value)}
        />

        <button
          type="button"
          onClick={() =>
            void run(submitBtcInteraction, setStatus, setSupplyResult)
          }
        >
          Submit BTC Transaction With Dynamic Wallet
        </button>
        <div className="result-box">{supplyResult}</div>
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
          BTC supply
        </a>
        <a
          className="page-switcher-link page-switcher-link-active"
          href="/status.html"
        >
          Activity tracker
        </a>
      </nav>

      <h1>Liquidium BTC Activity Tracker</h1>
      <p>
        Track BTC profile supply and repayment activity by profile id or txid.
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
          onClick={() =>
            void run(loadActivities, setStatus, setActivitiesOutput)
          }
        >
          Load Activities
        </button>
        <div className="result-box">{activitiesOutput}</div>
      </section>

      <section>
        <h2>Activity Status</h2>
        <label htmlFor="activity-id-input">Activity id or txid</label>
        <input
          id="activity-id-input"
          placeholder="Activity id or txid"
          value={activityId}
          onChange={(event) => setActivityId(event.target.value)}
        />

        <button
          type="button"
          onClick={() =>
            void run(loadActivityStatus, setStatus, setActivityOutput)
          }
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

async function getOrCreateConnectedBitcoinProfile(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): Promise<{ profileId: string; wasCreated: boolean }> {
  const account = getConnectedBitcoinAddress(primaryWallet);

  return await getOrCreateWalletProfile({
    account,
    walletAdapter: createDynamicBitcoinWalletAdapter(primaryWallet),
  });
}

function getBtcPools(pools: Pool[]): Pool[] {
  return pools.filter((pool) => pool.chain === Chain.BTC);
}

function getSelectedBtcPool(pools: Pool[], poolId: string): Pool {
  const pool = pools.find((candidatePool) => candidatePool.id === poolId);

  if (!pool) {
    throw new Error("Select an available BTC pool first.");
  }

  if (pool.chain !== Chain.BTC) {
    throw new Error(`${pool.asset} on ${pool.chain} is not a BTC pool.`);
  }

  if (pool.frozen) {
    throw new Error(`${pool.asset} on ${pool.chain} is currently frozen.`);
  }

  return pool;
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
