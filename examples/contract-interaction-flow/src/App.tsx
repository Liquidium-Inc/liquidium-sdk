import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { ActivityFilter, Pool } from "@liquidium/client";
import { Chain } from "@liquidium/client";
import { useEffect, useState } from "react";
import { formatConfig } from "./client";
import {
  createDynamicWalletAdapter,
  getConnectedWalletAddress,
} from "./dynamic-wallet";
import {
  formatActivity,
  formatActivityStatus,
  formatAmount,
  formatError,
  formatOutflowDetails,
  formatPool,
  formatSupplyFlow,
  getRecentActivityIds,
  parseAmountToBaseUnits,
  saveRecentActivityId,
} from "./format";
import {
  borrowWithWallet,
  getActivityStatus,
  getOrCreateWalletProfile,
  listMarketPools,
  listProfileActivities,
  submitContractInteractionRepayment,
  submitContractInteractionSupply,
} from "./sdk-example";

const CONTRACT_INTERACTION_ASSETS = new Set(["USDC", "USDT"]);
const DEFAULT_CONTRACT_INTERACTION_ASSET = "USDC";
const DEFAULT_BORROW_ASSET = "USDC";

type ContractInteractionTab = "supply" | "repay" | "borrow";

export function App() {
  const isStatusPage = window.location.pathname.endsWith("/status.html");

  return isStatusPage ? <ActivityTrackerPage /> : <ContractInteractionPage />;
}

function ContractInteractionPage() {
  const { primaryWallet } = useDynamicContext();
  const [pools, setPools] = useState<Pool[]>([]);
  const [activeTab, setActiveTab] = useState<ContractInteractionTab>("supply");
  const [profileId, setProfileId] = useState("");
  const [profileResult, setProfileResult] = useState(
    "Connect a wallet, then create or load a profile."
  );
  const [selectedSupplyPoolId, setSelectedSupplyPoolId] = useState("");
  const [selectedRepaymentPoolId, setSelectedRepaymentPoolId] = useState("");
  const [selectedBorrowPoolId, setSelectedBorrowPoolId] = useState("");
  const [supplyAmount, setSupplyAmount] = useState("10");
  const [supplyResult, setSupplyResult] = useState(
    "No contract interaction submitted yet."
  );
  const [repaymentAmount, setRepaymentAmount] = useState("10");
  const [repaymentResult, setRepaymentResult] = useState(
    "No contract interaction repayment submitted yet."
  );
  const [borrowAmount, setBorrowAmount] = useState("9");
  const [borrowDestination, setBorrowDestination] = useState("");
  const [borrowResult, setBorrowResult] = useState(
    "Connect a wallet, then submit a borrow."
  );
  const [status, setStatus] = useState("Ready.");
  const walletAddress = primaryWallet?.address ?? "";
  const contractInteractionPools = getContractInteractionPools(pools);
  const borrowPools = getBorrowPools(pools);

  useEffect(() => {
    void run(async () => {
      setStatus("Loading pools...");
      const loadedPools = await listMarketPools();
      const availableContractInteractionPools =
        getContractInteractionPools(loadedPools);
      const availableBorrowPools = getBorrowPools(loadedPools);
      const defaultContractInteractionPool =
        availableContractInteractionPools.find(
          (pool) => pool.asset === DEFAULT_CONTRACT_INTERACTION_ASSET
        ) ?? availableContractInteractionPools[0];
      const defaultBorrowPool =
        availableBorrowPools.find(
          (pool) => pool.asset === DEFAULT_BORROW_ASSET
        ) ?? availableBorrowPools[0];

      setPools(loadedPools);
      setSelectedSupplyPoolId(defaultContractInteractionPool?.id ?? "");
      setSelectedRepaymentPoolId(defaultContractInteractionPool?.id ?? "");
      setSelectedBorrowPoolId(defaultBorrowPool?.id ?? "");
      setStatus(
        `Loaded ${availableContractInteractionPools.length} contract interaction pools.`
      );
    }, setStatus);
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    const selectedBorrowPool = pools.find(
      (pool) => pool.id === selectedBorrowPoolId
    );

    if (!selectedBorrowPool || selectedBorrowPool.chain !== Chain.ETH) {
      return;
    }

    setBorrowDestination(walletAddress);
  }, [walletAddress, selectedBorrowPoolId, pools]);

  async function loadPools(): Promise<void> {
    setStatus("Loading pools...");
    const loadedPools = await listMarketPools();
    const availableContractInteractionPools =
      getContractInteractionPools(loadedPools);
    const availableBorrowPools = getBorrowPools(loadedPools);
    const defaultContractInteractionPool =
      availableContractInteractionPools.find(
        (pool) => pool.asset === DEFAULT_CONTRACT_INTERACTION_ASSET
      ) ?? availableContractInteractionPools[0];
    const defaultBorrowPool =
      availableBorrowPools.find(
        (pool) => pool.asset === DEFAULT_BORROW_ASSET
      ) ?? availableBorrowPools[0];

    setPools(loadedPools);
    setSelectedSupplyPoolId(defaultContractInteractionPool?.id ?? "");
    setSelectedRepaymentPoolId(defaultContractInteractionPool?.id ?? "");
    setSelectedBorrowPoolId(defaultBorrowPool?.id ?? "");
    setStatus(
      `Loaded ${availableContractInteractionPools.length} contract interaction pools.`
    );
  }

  async function createOrLoadProfile(): Promise<void> {
    setStatus("Loading profile...");
    setProfileResult("Checking for an existing profile...");

    const { profileId: nextProfileId, wasCreated } =
      await getOrCreateConnectedWalletProfile(primaryWallet);

    setProfileId(nextProfileId);
    setProfileResult(
      `${wasCreated ? "Created" : "Loaded existing"} profile: ${nextProfileId}`
    );
    setStatus(`${wasCreated ? "Created" : "Loaded"} profile ${nextProfileId}.`);
  }

  async function submitContractSupply(): Promise<void> {
    const account = getConnectedWalletAddress(primaryWallet);
    const selectedPool = getSelectedPool(
      contractInteractionPools,
      selectedSupplyPoolId
    );
    const amount = parseAmountToBaseUnits(supplyAmount, selectedPool.decimals);
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    setStatus("Submitting contract interaction supply...");
    setSupplyResult("Submitting contract interaction supply...");

    const supplyFlow = await submitContractInteractionSupply({
      profileId: trimmedProfileId,
      poolId: selectedPool.id,
      account,
      amount,
      walletAdapter: createDynamicWalletAdapter(primaryWallet),
    });

    if (supplyFlow.txid) {
      saveRecentActivityId(supplyFlow.txid);
    }

    setSupplyResult(
      [
        `Supplied amount: ${formatAmount(amount, selectedPool.decimals)} ${selectedPool.asset}`,
        "",
        formatSupplyFlow(supplyFlow),
        "",
        "Use the txid on the Activity tracker page to follow status.",
      ].join("\n")
    );
    setStatus(
      `Submitted contract supply ${supplyFlow.txid ?? "without txid"}.`
    );
  }

  async function submitContractRepayment(): Promise<void> {
    const account = getConnectedWalletAddress(primaryWallet);
    const selectedPool = getSelectedPool(
      contractInteractionPools,
      selectedRepaymentPoolId
    );
    const amount = parseAmountToBaseUnits(
      repaymentAmount,
      selectedPool.decimals
    );
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    setStatus("Submitting contract interaction repayment...");
    setRepaymentResult("Submitting contract interaction repayment...");

    const repaymentFlow = await submitContractInteractionRepayment({
      profileId: trimmedProfileId,
      poolId: selectedPool.id,
      account,
      amount,
      walletAdapter: createDynamicWalletAdapter(primaryWallet),
    });

    if (repaymentFlow.txid) {
      saveRecentActivityId(repaymentFlow.txid);
    }

    setRepaymentResult(
      [
        `Repaid amount: ${formatAmount(amount, selectedPool.decimals)} ${selectedPool.asset}`,
        "",
        formatSupplyFlow(repaymentFlow),
        "",
        "Use the txid on the Activity tracker page to follow status.",
      ].join("\n")
    );
    setStatus(
      `Submitted contract repayment ${repaymentFlow.txid ?? "without txid"}.`
    );
  }

  async function borrow(): Promise<void> {
    const selectedBorrowPool = getSelectedPool(
      borrowPools,
      selectedBorrowPoolId
    );
    const amount = parseAmountToBaseUnits(
      borrowAmount,
      selectedBorrowPool.decimals
    );
    const receiverAddress = borrowDestination.trim();
    const signerWalletAddress = getConnectedWalletAddress(primaryWallet);
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    if (!receiverAddress) {
      throw new Error("Enter a borrow destination address.");
    }

    setStatus("Submitting borrow...");
    setBorrowResult("Submitting borrow...");

    const outflow = await borrowWithWallet({
      profileId: trimmedProfileId,
      poolId: selectedBorrowPool.id,
      amount,
      receiverAddress,
      signerWalletAddress,
      signerWalletAdapter: createDynamicWalletAdapter(primaryWallet),
    });

    saveRecentActivityId(outflow.id);
    setBorrowResult(formatOutflowDetails(outflow));
    setStatus(`Submitted borrow ${outflow.id}.`);
  }

  return (
    <main>
      <nav className="page-switcher" aria-label="Example pages">
        <a className="page-switcher-link page-switcher-link-active" href="/">
          Supply / repay / borrow
        </a>
        <a className="page-switcher-link" href="/status.html">
          Activity tracker
        </a>
      </nav>

      <h1>Liquidium Contract Interaction Flow</h1>
      <p>
        Supply and repay USDC or USDT through the ETH contract interaction path,
        then borrow from a Liquidium profile.
      </p>

      <section>
        <h2>Wallet</h2>
        <DynamicWidget />
        <div className="list-box">
          Connected wallet: {walletAddress || "Not connected"}
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
            : pools.map(formatPool).join("\n\n")}
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
          Create or Load Connected Wallet Profile
        </button>
        <div className="result-box">{profileResult}</div>
      </section>

      <section>
        <h2>Actions</h2>
        <div
          className="action-tabs"
          role="tablist"
          aria-label="Lending actions"
        >
          <button
            type="button"
            role="tab"
            className={getTabButtonClassName(activeTab === "supply")}
            aria-selected={activeTab === "supply"}
            onClick={() => setActiveTab("supply")}
          >
            Supply
          </button>
          <button
            type="button"
            role="tab"
            className={getTabButtonClassName(activeTab === "repay")}
            aria-selected={activeTab === "repay"}
            onClick={() => setActiveTab("repay")}
          >
            Repay
          </button>
          <button
            type="button"
            role="tab"
            className={getTabButtonClassName(activeTab === "borrow")}
            aria-selected={activeTab === "borrow"}
            onClick={() => setActiveTab("borrow")}
          >
            Borrow
          </button>
        </div>

        {activeTab === "supply" ? (
          <div className="tab-panel">
            <h3>Supply By Contract Interaction</h3>

            <label htmlFor="supply-pool-select">Supply pool</label>
            <select
              id="supply-pool-select"
              value={selectedSupplyPoolId}
              onChange={(event) => setSelectedSupplyPoolId(event.target.value)}
            >
              {contractInteractionPools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>

            <label htmlFor="supply-amount-input">Supply amount</label>
            <input
              id="supply-amount-input"
              inputMode="decimal"
              value={supplyAmount}
              onChange={(event) => setSupplyAmount(event.target.value)}
            />

            <button
              type="button"
              onClick={() => void run(submitContractSupply, setStatus)}
            >
              Submit Contract Supply
            </button>
            <div className="result-box">{supplyResult}</div>
          </div>
        ) : null}

        {activeTab === "repay" ? (
          <div className="tab-panel">
            <h3>Repay By Contract Interaction</h3>

            <label htmlFor="repayment-pool-select">Repayment pool</label>
            <select
              id="repayment-pool-select"
              value={selectedRepaymentPoolId}
              onChange={(event) =>
                setSelectedRepaymentPoolId(event.target.value)
              }
            >
              {contractInteractionPools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>

            <label htmlFor="repayment-amount-input">Repayment amount</label>
            <input
              id="repayment-amount-input"
              inputMode="decimal"
              value={repaymentAmount}
              onChange={(event) => setRepaymentAmount(event.target.value)}
            />

            <button
              type="button"
              onClick={() => void run(submitContractRepayment, setStatus)}
            >
              Submit Contract Repayment
            </button>
            <div className="result-box">{repaymentResult}</div>
          </div>
        ) : null}

        {activeTab === "borrow" ? (
          <div className="tab-panel">
            <h3>Borrow</h3>

            <label htmlFor="borrow-pool-select">Borrow pool</label>
            <select
              id="borrow-pool-select"
              value={selectedBorrowPoolId}
              onChange={(event) => setSelectedBorrowPoolId(event.target.value)}
            >
              {borrowPools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>

            <label htmlFor="borrow-amount-input">Borrow amount</label>
            <input
              id="borrow-amount-input"
              inputMode="decimal"
              value={borrowAmount}
              onChange={(event) => setBorrowAmount(event.target.value)}
            />

            <label htmlFor="borrow-destination-input">
              Borrow destination address
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
          </div>
        ) : null}
      </section>

      <section>
        <h2>Status</h2>
        <pre>{status}</pre>
      </section>
    </main>
  );
}

function ActivityTrackerPage() {
  const [profileId, setProfileId] = useState(
    new URLSearchParams(window.location.search).get("profileId") ?? ""
  );
  const [activityId, setActivityId] = useState(
    new URLSearchParams(window.location.search).get("activityId") ?? ""
  );
  const [activityFilter, setActivityFilter] =
    useState<ActivityFilter>("active");
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
    setActivitiesOutput(activities.map(formatActivity).join("\n\n"));
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
          Supply / repay / borrow
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
        Track contract-interaction supply, repayment, and borrow activity by
        profile id or tx/activity id.
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
          <option value="active">Active</option>
          <option value="all">All</option>
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
          placeholder="Activity id or txid"
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

function getContractInteractionPools(pools: Pool[]): Pool[] {
  return pools.filter(
    (pool) =>
      pool.chain === Chain.ETH &&
      CONTRACT_INTERACTION_ASSETS.has(pool.asset) &&
      !pool.frozen
  );
}

function getBorrowPools(pools: Pool[]): Pool[] {
  return pools.filter((pool) => !pool.frozen);
}

function getSelectedPool(pools: Pool[], poolId: string): Pool {
  const pool = pools.find((candidatePool) => candidatePool.id === poolId);

  if (!pool) {
    throw new Error("Select an available pool first.");
  }

  return pool;
}

function getTabButtonClassName(isActive: boolean): string {
  return isActive ? "action-tab action-tab-active" : "action-tab";
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
