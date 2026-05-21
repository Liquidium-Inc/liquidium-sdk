import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type {
  ActivityFilter,
  AssetPrices,
  Pool,
  SupplyFlow,
  WalletAdapter,
} from "@liquidium/client";
import { Chain, SupplyAction } from "@liquidium/client";
import { useEffect, useState } from "react";
import { client, formatConfig } from "./client";
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

const DEFAULT_SUPPLY_ASSET = "USDC";
const DEFAULT_BORROW_ASSET = "USDC";

type DynamicWalletClient = {
  signMessage(request: {
    account: `0x${string}`;
    message: string;
  }): Promise<string>;
};

type DynamicEvmConnector = {
  getWalletClient?(
    chainId?: string
  ): DynamicWalletClient | Promise<DynamicWalletClient | undefined> | undefined;
  signMessage?(messageToSign: string): Promise<string | undefined>;
};

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
  const [selectedBorrowPoolId, setSelectedBorrowPoolId] = useState("");
  const [supplyAmount, setSupplyAmount] = useState("10");
  const [supplyTxid, setSupplyTxid] = useState("");
  const [currentSupplyFlow, setCurrentSupplyFlow] = useState<SupplyFlow | null>(
    null
  );
  const [supplyResult, setSupplyResult] = useState(
    "No deposit address loaded yet."
  );
  const [submitSupplyResult, setSubmitSupplyResult] = useState(
    "Generate a deposit address first, then track the txid."
  );
  const [borrowAmount, setBorrowAmount] = useState("9");
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
      const [loadedPools, loadedAssetPrices] = await Promise.all([
        client.market.listPools(),
        client.market.getAssetPrices(),
      ]);
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

    if (!selectedBorrowPool || selectedBorrowPool.chain !== Chain.ETH) {
      return;
    }

    setBorrowDestination(walletAddress);
  }, [walletAddress, selectedBorrowPoolId, pools]);

  async function loadPools(): Promise<void> {
    setStatus("Loading pools...");
    const [loadedPools, loadedAssetPrices] = await Promise.all([
      client.market.listPools(),
      client.market.getAssetPrices(),
    ]);
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
    setStatus(`Loaded ${loadedPools.length} pools.`);
  }

  async function createSupplyTarget(): Promise<void> {
    const selectedSupplyPool = getSelectedPool(pools, selectedSupplyPoolId);
    const parsedSupplyAmount = parseAmountToBaseUnits(
      supplyAmount,
      selectedSupplyPool.decimals
    );
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    setStatus("Generating deposit address...");
    setSupplyResult("Generating deposit address...");

    const supplyFlow = await client.lending.supply({
      profileId: trimmedProfileId,
      poolId: selectedSupplyPool.id,
      action: SupplyAction.deposit,
    });

    setCurrentSupplyFlow(supplyFlow);
    setSupplyResult(
      [
        `Send amount: ${formatAmount(parsedSupplyAmount, selectedSupplyPool.decimals)} ${selectedSupplyPool.asset}`,
        "",
        formatSupplyTarget(supplyFlow.target),
        "",
        "After broadcasting the transfer, paste the txid below to track it.",
      ].join("\n")
    );
    setStatus("Deposit address generated.");
  }

  async function submitSupplyTxid(): Promise<void> {
    const txid = supplyTxid.trim();

    if (!currentSupplyFlow) {
      throw new Error("Generate a deposit address first.");
    }

    if (!txid) {
      throw new Error("Enter a txid.");
    }

    if (currentSupplyFlow.target.chain === Chain.ETH) {
      await trackEthSupplyTxid(txid);
      return;
    }

    setStatus("Registering supply txid...");
    setSubmitSupplyResult("Registering txid...");
    const response = await currentSupplyFlow.submit({ txid });
    saveRecentActivityId(response.txid);
    setSubmitSupplyResult(
      ["Supply txid registered.", `Txid: ${response.txid}`].join("\n")
    );
    setStatus(`Registered supply txid ${response.txid}.`);
  }

  async function trackEthSupplyTxid(txid: string): Promise<void> {
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    setStatus("Loading supply txid activity...");
    setSubmitSupplyResult("Loading activity status...");

    const response = await client.activities.getStatus({
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
    const receiverAddress = borrowDestination.trim();
    const signerWalletAddress = getConnectedWalletAddress(primaryWallet);

    if (!receiverAddress) {
      throw new Error("Enter a borrow destination address.");
    }

    setStatus("Loading wallet profile...");
    const result = await getOrCreateConnectedWalletProfile(primaryWallet);
    setProfileId(result.profileId);

    setStatus("Submitting borrow...");
    setBorrowResult("Submitting borrow...");

    const outflow = await client.lending.borrow({
      profileId: result.profileId,
      poolId: selectedBorrowPool.id,
      amount: parsedBorrowAmount,
      receiverAddress,
      signerWalletAddress,
      signerChain: Chain.ETH,
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
          Supply / borrow
        </a>
        <a className="page-switcher-link" href="/status.html">
          Activity tracker
        </a>
      </nav>

      <h1>Liquidium Deposit Address Flow</h1>
      <p>
        Create or load a profile, generate a deposit address for supply, then
        borrow with a Dynamic-connected wallet.
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
        <h2>Supply By Deposit Address</h2>
        <label htmlFor="supply-pool-select">Supply pool</label>
        <select
          id="supply-pool-select"
          value={selectedSupplyPoolId}
          onChange={(event) => setSelectedSupplyPoolId(event.target.value)}
        >
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.asset} on {pool.chain}
            </option>
          ))}
        </select>

        <label htmlFor="supply-amount-input">
          Supply amount to send manually
        </label>
        <input
          id="supply-amount-input"
          inputMode="decimal"
          value={supplyAmount}
          onChange={(event) => setSupplyAmount(event.target.value)}
        />

        <button
          type="button"
          onClick={() => void run(createSupplyTarget, setStatus)}
        >
          Get Deposit Address
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
          Track Supply Txid
        </button>
        <div className="result-box">{submitSupplyResult}</div>
      </section>

      <section>
        <h2>Borrow</h2>
        <label htmlFor="borrow-pool-select">Borrow pool</label>
        <select
          id="borrow-pool-select"
          value={selectedBorrowPoolId}
          onChange={(event) => setSelectedBorrowPoolId(event.target.value)}
        >
          {pools.map((pool) => (
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
  const [activityFilter, setActivityFilter] =
    useState<ActivityFilter>("all");
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

    const activities = await client.activities.list({
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

    const response = await client.activities.getStatus({
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

async function getOrCreateConnectedWalletProfile(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): Promise<{ profileId: string; wasCreated: boolean }> {
  const account = getConnectedWalletAddress(primaryWallet);
  const existingProfileId = await client.accounts.getProfileId(account);

  if (existingProfileId) {
    return { profileId: existingProfileId, wasCreated: false };
  }

  const profileId = await client.accounts.createProfile({
    account,
    chain: Chain.ETH,
    walletAdapter: createDynamicWalletAdapter(primaryWallet),
  });

  return { profileId, wasCreated: true };
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

function getConnectedWalletAddress(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): string {
  if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
    throw new Error("Connect an Ethereum wallet first.");
  }

  if (!primaryWallet.address) {
    throw new Error("Connected wallet has no address.");
  }

  return primaryWallet.address;
}

function createDynamicWalletAdapter(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): WalletAdapter {
  const account = getConnectedWalletAddress(primaryWallet);
  const connector = primaryWallet?.connector as DynamicEvmConnector | undefined;

  return {
    signMessage: async (request) => {
      if (connector?.signMessage) {
        const signature = await connector.signMessage(request.message);

        if (!signature) {
          throw new Error("Wallet did not return a signature.");
        }

        return signature;
      }

      const walletClient = await connector?.getWalletClient?.("1");

      if (walletClient?.signMessage) {
        return await walletClient.signMessage({
          account: account as `0x${string}`,
          message: request.message,
        });
      }

      throw new Error("Connected wallet does not support message signing.");
    },
  };
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
