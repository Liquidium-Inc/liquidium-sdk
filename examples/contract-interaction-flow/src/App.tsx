import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type { ActivityFilter, Pool, WalletAdapter } from "@liquidium/client";
import { Chain, SupplyAction, SupplyPlanType } from "@liquidium/client";
import { useEffect, useState } from "react";
import { createClient, formatConfig } from "./client";
import {
  formatActivity,
  formatActivityStatus,
  formatAmount,
  formatError,
  formatPool,
  formatSupplyFlow,
  getRecentActivityIds,
  parseAmountToBaseUnits,
  saveRecentActivityId,
} from "./format";

const CONTRACT_SUPPLY_ASSETS = new Set(["USDC", "USDT"]);
const DEFAULT_SUPPLY_ASSET = "USDC";
const ETH_MAINNET_CHAIN_ID = 1;
const ETH_MAINNET_CHAIN_ID_STRING = ETH_MAINNET_CHAIN_ID.toString();
const ETH_MAINNET_NETWORK_NAME = "Ethereum";

type DynamicWalletClient = {
  signMessage?(request: {
    account: `0x${string}`;
    message: string;
  }): Promise<`0x${string}`>;
  sendTransaction(request: {
    account: `0x${string}`;
    to: `0x${string}`;
    data?: `0x${string}`;
    value?: bigint;
  }): Promise<`0x${string}`>;
};

type DynamicEvmConnector = {
  getWalletClient?(
    chainId?: string
  ): DynamicWalletClient | Promise<DynamicWalletClient | undefined> | undefined;
  signMessage?(messageToSign: string): Promise<string | undefined>;
  getNetwork?(): Promise<number | undefined>;
  supportsNetworkSwitching?(): boolean;
  switchNetwork?(request: {
    networkChainId: number;
    networkName?: string;
  }): Promise<void>;
};

type DynamicEthereumWallet = {
  connector?: DynamicEvmConnector;
  getWalletClient?: DynamicEvmConnector["getWalletClient"];
};

export function App() {
  const isStatusPage = window.location.pathname.endsWith("/status.html");

  return isStatusPage ? <ActivityTrackerPage /> : <SupplyPage />;
}

function SupplyPage() {
  const { primaryWallet } = useDynamicContext();
  const [pools, setPools] = useState<Pool[]>([]);
  const [profileId, setProfileId] = useState("");
  const [profileResult, setProfileResult] = useState(
    "Connect a wallet, then create or load a profile."
  );
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [supplyAmount, setSupplyAmount] = useState("10");
  const [supplyResult, setSupplyResult] = useState(
    "No contract interaction submitted yet."
  );
  const [status, setStatus] = useState("Ready.");
  const walletAddress = primaryWallet?.address ?? "";
  const supplyPools = getContractSupplyPools(pools);

  useEffect(() => {
    void run(async () => {
      setStatus("Loading pools...");
      const loadedPools = await createClient().market.listPools();
      const availableSupplyPools = getContractSupplyPools(loadedPools);
      const defaultPool =
        availableSupplyPools.find(
          (pool) => pool.asset === DEFAULT_SUPPLY_ASSET
        ) ?? availableSupplyPools[0];

      setPools(loadedPools);
      setSelectedPoolId(defaultPool?.id ?? "");
      setStatus(`Loaded ${availableSupplyPools.length} contract supply pools.`);
    }, setStatus);
  }, []);

  async function loadPools(): Promise<void> {
    setStatus("Loading pools...");
    const loadedPools = await createClient().market.listPools();
    const availableSupplyPools = getContractSupplyPools(loadedPools);
    const defaultPool =
      availableSupplyPools.find(
        (pool) => pool.asset === DEFAULT_SUPPLY_ASSET
      ) ?? availableSupplyPools[0];

    setPools(loadedPools);
    setSelectedPoolId(defaultPool?.id ?? "");
    setStatus(`Loaded ${availableSupplyPools.length} contract supply pools.`);
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
    const selectedPool = getSelectedPool(supplyPools, selectedPoolId);
    const amount = parseAmountToBaseUnits(supplyAmount, selectedPool.decimals);
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    setStatus("Submitting contract interaction supply...");
    setSupplyResult("Submitting contract interaction supply...");

    const supplyFlow = await createClient().lending.supply({
      profileId: trimmedProfileId,
      poolId: selectedPool.id,
      action: SupplyAction.deposit,
      mechanism: SupplyPlanType.contractInteraction,
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

  return (
    <main>
      <nav className="page-switcher" aria-label="Example pages">
        <a className="page-switcher-link page-switcher-link-active" href="/">
          Supply
        </a>
        <a className="page-switcher-link" href="/status.html">
          Activity tracker
        </a>
      </nav>

      <h1>Liquidium Contract Interaction Flow</h1>
      <p>Supply USDC or USDT through the ETH contract interaction path.</p>

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
          {supplyPools.length === 0
            ? "No USDC/USDT ETH pools loaded."
            : supplyPools.map(formatPool).join("\n\n")}
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
        <h2>Supply By Contract Interaction</h2>

        <label htmlFor="supply-pool-select">Supply pool</label>
        <select
          id="supply-pool-select"
          value={selectedPoolId}
          onChange={(event) => setSelectedPoolId(event.target.value)}
        >
          {supplyPools.map((pool) => (
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

    const activities = await createClient().activities.list({
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

    const response = await createClient().activities.getStatus({
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
          Supply
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
        Track contract-interaction supply activity by profile id or tx/activity
        id.
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

function getContractSupplyPools(pools: Pool[]): Pool[] {
  return pools.filter(
    (pool) =>
      pool.chain === "ETH" &&
      CONTRACT_SUPPLY_ASSETS.has(pool.asset) &&
      !pool.frozen
  );
}

function getSelectedPool(pools: Pool[], poolId: string): Pool {
  const pool = pools.find((candidatePool) => candidatePool.id === poolId);

  if (!pool) {
    throw new Error("Select an available USDC or USDT pool first.");
  }

  return pool;
}

async function getOrCreateConnectedWalletProfile(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): Promise<{ profileId: string; wasCreated: boolean }> {
  const account = getConnectedWalletAddress(primaryWallet);
  const client = createClient();
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

function getConnectedWalletAddress(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): string {
  if (!primaryWallet) {
    throw new Error("Connect an Ethereum wallet first.");
  }

  if (!isEthereumWallet(primaryWallet)) {
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
  const account = getConnectedWalletAddress(primaryWallet) as `0x${string}`;
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

      const walletClient = await connector?.getWalletClient?.(
        ETH_MAINNET_CHAIN_ID_STRING
      );

      if (walletClient?.signMessage) {
        return await walletClient.signMessage({
          account,
          message: request.message,
        });
      }

      throw new Error("Connected wallet does not support message signing.");
    },
    sendEthTransaction: async ({ transaction }) => {
      await ensureEthereumMainnet(primaryWallet);

      const walletClient = await getDynamicWalletClient(primaryWallet);

      return await walletClient.sendTransaction({
        account,
        to: transaction.to as `0x${string}`,
        ...(transaction.data
          ? { data: transaction.data as `0x${string}` }
          : {}),
        ...(transaction.value ? { value: BigInt(transaction.value) } : {}),
      });
    },
  };
}

async function ensureEthereumMainnet(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): Promise<void> {
  const connector = getDynamicEthereumWallet(primaryWallet).connector;

  if (!connector?.getNetwork) {
    return;
  }

  const currentChainId = await connector.getNetwork();

  if (!currentChainId || currentChainId === ETH_MAINNET_CHAIN_ID) {
    return;
  }

  if (
    connector.supportsNetworkSwitching?.() === false ||
    !connector.switchNetwork
  ) {
    throw new Error(
      "Switch connected wallet to Ethereum mainnet before submitting."
    );
  }

  await connector.switchNetwork({
    networkChainId: ETH_MAINNET_CHAIN_ID,
    networkName: ETH_MAINNET_NETWORK_NAME,
  });
}

async function getDynamicWalletClient(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): Promise<DynamicWalletClient> {
  const dynamicWallet = getDynamicEthereumWallet(primaryWallet);
  const walletClient = dynamicWallet.getWalletClient
    ? await dynamicWallet.getWalletClient(ETH_MAINNET_CHAIN_ID_STRING)
    : await dynamicWallet.connector?.getWalletClient?.(
        ETH_MAINNET_CHAIN_ID_STRING
      );

  if (!walletClient) {
    throw new Error(
      "Connected wallet does not expose an Ethereum wallet client."
    );
  }

  return walletClient;
}

function getDynamicEthereumWallet(
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"]
): DynamicEthereumWallet {
  return primaryWallet as DynamicEthereumWallet;
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
