import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import type {
  ActivityFilter,
  OutflowAccountType,
  Pool,
  TransferMode,
} from "@liquidium/client";
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
  createCkTransferTarget,
  getActivityStatus,
  getOrCreateWalletProfile,
  listMarketPools,
  listProfileActivities,
  submitContractInteractionRepayment,
  submitContractInteractionSupply,
  withdrawWithWallet,
} from "./sdk-example";

const CONTRACT_INTERACTION_ASSETS = new Set(["USDC", "USDT"]);
const DEFAULT_CONTRACT_INTERACTION_ASSET = "USDC";
const DEFAULT_BORROW_ASSET = "USDC";

type ContractInteractionTab = "supply" | "repay" | "borrow" | "withdraw";
type StablecoinInflowMode = "contractInteraction" | "ck";

const DEFAULT_STABLECOIN_INFLOW_MODE: StablecoinInflowMode =
  "contractInteraction";
const DEFAULT_OUTFLOW_TRANSFER_MODE: TransferMode = "nativeAsset";
const DEFAULT_OUTFLOW_ACCOUNT_TYPE: OutflowAccountType = "ChainAddress";
const EXTERNAL_CHAIN_OUTFLOW_ACCOUNT_TYPES: OutflowAccountType[] = [
  "ChainAddress",
];
const CK_OUTFLOW_ACCOUNT_TYPES: OutflowAccountType[] = ["IcPrincipal"];
const ICP_OUTFLOW_ACCOUNT_TYPES: OutflowAccountType[] = [
  "IcrcAccount",
  "IcpAccountIdentifier",
  "IcPrincipal",
];

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
  const [selectedWithdrawPoolId, setSelectedWithdrawPoolId] = useState("");
  const [supplyInflowMode, setSupplyInflowMode] =
    useState<StablecoinInflowMode>(DEFAULT_STABLECOIN_INFLOW_MODE);
  const [repaymentInflowMode, setRepaymentInflowMode] =
    useState<StablecoinInflowMode>(DEFAULT_STABLECOIN_INFLOW_MODE);
  const [supplyAmount, setSupplyAmount] = useState("10");
  const [supplyResult, setSupplyResult] = useState(
    "No contract interaction submitted yet."
  );
  const [repaymentAmount, setRepaymentAmount] = useState("10");
  const [repaymentResult, setRepaymentResult] = useState(
    "No contract interaction repayment submitted yet."
  );
  const [borrowAmount, setBorrowAmount] = useState("9");
  const [borrowTransferMode, setBorrowTransferMode] = useState<TransferMode>(
    DEFAULT_OUTFLOW_TRANSFER_MODE
  );
  const [borrowDestination, setBorrowDestination] = useState("");
  const [borrowDestinationType, setBorrowDestinationType] =
    useState<OutflowAccountType>(DEFAULT_OUTFLOW_ACCOUNT_TYPE);
  const [borrowResult, setBorrowResult] = useState(
    "Connect a wallet, then submit a borrow."
  );
  const [withdrawAmount, setWithdrawAmount] = useState("1");
  const [withdrawTransferMode, setWithdrawTransferMode] =
    useState<TransferMode>(DEFAULT_OUTFLOW_TRANSFER_MODE);
  const [withdrawDestination, setWithdrawDestination] = useState("");
  const [withdrawDestinationType, setWithdrawDestinationType] =
    useState<OutflowAccountType>(DEFAULT_OUTFLOW_ACCOUNT_TYPE);
  const [withdrawResult, setWithdrawResult] = useState(
    "Connect a wallet, then submit a withdraw."
  );
  const [status, setStatus] = useState("Ready.");
  const walletAddress = primaryWallet?.address ?? "";
  const contractInteractionPools = getContractInteractionPools(pools);
  const borrowPools = getBorrowPools(pools);
  const withdrawPools = getBorrowPools(pools);

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
      setSelectedWithdrawPoolId(defaultBorrowPool?.id ?? "");
      setBorrowTransferMode(DEFAULT_OUTFLOW_TRANSFER_MODE);
      setWithdrawTransferMode(DEFAULT_OUTFLOW_TRANSFER_MODE);
      setBorrowDestinationType(
        getDefaultOutflowAccountType(
          defaultBorrowPool,
          DEFAULT_OUTFLOW_TRANSFER_MODE
        )
      );
      setWithdrawDestinationType(
        getDefaultOutflowAccountType(
          defaultBorrowPool,
          DEFAULT_OUTFLOW_TRANSFER_MODE
        )
      );
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

    if (
      !selectedBorrowPool ||
      selectedBorrowPool.chain !== Chain.ETH ||
      borrowDestinationType !== "ChainAddress"
    ) {
      return;
    }

    setBorrowDestination(walletAddress);
  }, [walletAddress, selectedBorrowPoolId, borrowDestinationType, pools]);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    const selectedWithdrawPool = pools.find(
      (pool) => pool.id === selectedWithdrawPoolId
    );

    if (
      !selectedWithdrawPool ||
      selectedWithdrawPool.chain !== Chain.ETH ||
      withdrawDestinationType !== "ChainAddress"
    ) {
      return;
    }

    setWithdrawDestination(walletAddress);
  }, [walletAddress, selectedWithdrawPoolId, withdrawDestinationType, pools]);

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
    setSelectedWithdrawPoolId(defaultBorrowPool?.id ?? "");
    setBorrowTransferMode(DEFAULT_OUTFLOW_TRANSFER_MODE);
    setWithdrawTransferMode(DEFAULT_OUTFLOW_TRANSFER_MODE);
    setBorrowDestinationType(
      getDefaultOutflowAccountType(
        defaultBorrowPool,
        DEFAULT_OUTFLOW_TRANSFER_MODE
      )
    );
    setWithdrawDestinationType(
      getDefaultOutflowAccountType(
        defaultBorrowPool,
        DEFAULT_OUTFLOW_TRANSFER_MODE
      )
    );
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
    const selectedPool = getSelectedPool(
      contractInteractionPools,
      selectedSupplyPoolId
    );
    const amount = parseAmountToBaseUnits(supplyAmount, selectedPool.decimals);
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    const isCkInflowMode = supplyInflowMode === "ck";
    setStatus(
      isCkInflowMode
        ? "Generating direct ck supply target..."
        : "Submitting contract interaction supply..."
    );
    setSupplyResult(
      isCkInflowMode
        ? "Generating direct ck supply target..."
        : "Submitting contract interaction supply..."
    );

    const supplyFlow = isCkInflowMode
      ? await createCkTransferTarget({
          profileId: trimmedProfileId,
          poolId: selectedPool.id,
          action: "deposit",
        })
      : await submitContractInteractionSupply({
          profileId: trimmedProfileId,
          poolId: selectedPool.id,
          account: getConnectedWalletAddress(primaryWallet),
          amount,
          walletAdapter: createDynamicWalletAdapter(primaryWallet),
        });

    if (supplyFlow.txid) {
      saveRecentActivityId(supplyFlow.txid);
    }

    setSupplyResult(
      [
        `Supplied amount: ${formatAmount(amount, selectedPool.decimals)} ${selectedPool.asset}`,
        `Inflow mode: ${formatStablecoinInflowMode(supplyInflowMode)}`,
        "",
        formatSupplyFlow(supplyFlow),
        "",
        supplyFlow.txid
          ? "Use the txid on the Activity tracker page to follow status."
          : "Send ck tokens manually to the ICRC account above.",
      ].join("\n")
    );
    setStatus(
      supplyFlow.txid
        ? `Submitted contract supply ${supplyFlow.txid}.`
        : "Generated direct ck supply target."
    );
  }

  async function submitContractRepayment(): Promise<void> {
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

    const isCkInflowMode = repaymentInflowMode === "ck";
    setStatus(
      isCkInflowMode
        ? "Generating direct ck repayment target..."
        : "Submitting contract interaction repayment..."
    );
    setRepaymentResult(
      isCkInflowMode
        ? "Generating direct ck repayment target..."
        : "Submitting contract interaction repayment..."
    );

    const repaymentFlow = isCkInflowMode
      ? await createCkTransferTarget({
          profileId: trimmedProfileId,
          poolId: selectedPool.id,
          action: "repayment",
        })
      : await submitContractInteractionRepayment({
          profileId: trimmedProfileId,
          poolId: selectedPool.id,
          account: getConnectedWalletAddress(primaryWallet),
          amount,
          walletAdapter: createDynamicWalletAdapter(primaryWallet),
        });

    if (repaymentFlow.txid) {
      saveRecentActivityId(repaymentFlow.txid);
    }

    setRepaymentResult(
      [
        `Repaid amount: ${formatAmount(amount, selectedPool.decimals)} ${selectedPool.asset}`,
        `Inflow mode: ${formatStablecoinInflowMode(repaymentInflowMode)}`,
        "",
        formatSupplyFlow(repaymentFlow),
        "",
        repaymentFlow.txid
          ? "Use the txid on the Activity tracker page to follow status."
          : "Send ck tokens manually to the ICRC account above.",
      ].join("\n")
    );
    setStatus(
      repaymentFlow.txid
        ? `Submitted contract repayment ${repaymentFlow.txid}.`
        : "Generated direct ck repayment target."
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
    const destinationAddress = borrowDestination.trim();
    const signerWalletAddress = getConnectedWalletAddress(primaryWallet);
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    if (!destinationAddress) {
      throw new Error("Enter a borrow destination address.");
    }

    setStatus("Submitting borrow...");
    setBorrowResult("Submitting borrow...");

    const outflow = await borrowWithWallet({
      profileId: trimmedProfileId,
      poolId: selectedBorrowPool.id,
      amount,
      receiver: { address: destinationAddress, type: borrowDestinationType },
      signerWalletAddress,
      signerWalletAdapter: createDynamicWalletAdapter(primaryWallet),
    });

    saveRecentActivityId(outflow.id);
    setBorrowResult(
      [
        `Transfer mode: ${formatOutflowTransferMode(selectedBorrowPool, borrowTransferMode)}`,
        "",
        formatOutflowDetails(outflow),
      ].join("\n")
    );
    setStatus(`Submitted borrow ${outflow.id}.`);
  }

  async function withdraw(): Promise<void> {
    const selectedWithdrawPool = getSelectedPool(
      withdrawPools,
      selectedWithdrawPoolId
    );
    const amount = parseAmountToBaseUnits(
      withdrawAmount,
      selectedWithdrawPool.decimals
    );
    const destinationAddress = withdrawDestination.trim();
    const signerWalletAddress = getConnectedWalletAddress(primaryWallet);
    const trimmedProfileId = profileId.trim();

    if (!trimmedProfileId) {
      throw new Error("Enter a profile id.");
    }

    if (!destinationAddress) {
      throw new Error("Enter a withdraw destination address.");
    }

    setStatus("Submitting withdraw...");
    setWithdrawResult("Submitting withdraw...");

    const outflow = await withdrawWithWallet({
      profileId: trimmedProfileId,
      poolId: selectedWithdrawPool.id,
      amount,
      receiver: { address: destinationAddress, type: withdrawDestinationType },
      signerWalletAddress,
      signerWalletAdapter: createDynamicWalletAdapter(primaryWallet),
    });

    saveRecentActivityId(outflow.id);
    setWithdrawResult(
      [
        `Transfer mode: ${formatOutflowTransferMode(selectedWithdrawPool, withdrawTransferMode)}`,
        "",
        formatOutflowDetails(outflow),
      ].join("\n")
    );
    setStatus(`Submitted withdraw ${outflow.id}.`);
  }

  return (
    <main>
      <nav className="page-switcher" aria-label="Example pages">
        <a className="page-switcher-link page-switcher-link-active" href="/">
          Supply / repay / borrow / withdraw
        </a>
        <a className="page-switcher-link" href="/status.html">
          Activity tracker
        </a>
      </nav>

      <h1>Liquidium Contract Interaction Flow</h1>
      <p>
        Supply and repay USDC or USDT through the ETH contract interaction path,
        then borrow or withdraw from a Liquidium profile.
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
          <button
            type="button"
            role="tab"
            className={getTabButtonClassName(activeTab === "withdraw")}
            aria-selected={activeTab === "withdraw"}
            onClick={() => setActiveTab("withdraw")}
          >
            Withdraw
          </button>
        </div>

        {activeTab === "supply" ? (
          <div className="tab-panel">
            <h3>Supply Stablecoin</h3>

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

            <label htmlFor="supply-inflow-mode-select">Inflow mode</label>
            <select
              id="supply-inflow-mode-select"
              value={supplyInflowMode}
              onChange={(event) =>
                setSupplyInflowMode(event.target.value as StablecoinInflowMode)
              }
            >
              <option value="contractInteraction">
                ETH contract interaction
              </option>
              <option value="ck">Direct ck / ICRC ledger account</option>
            </select>
            <p>
              Contract mode sends ERC-20 tokens through Ethereum. ck mode
              returns the pool-owned ICRC account for a manual ckUSDC or ckUSDT
              transfer.
            </p>

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
              {supplyInflowMode === "ck"
                ? "Get ck Supply Target"
                : "Submit Contract Supply"}
            </button>
            <div className="result-box">{supplyResult}</div>
          </div>
        ) : null}

        {activeTab === "repay" ? (
          <div className="tab-panel">
            <h3>Repay Stablecoin</h3>

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

            <label htmlFor="repayment-inflow-mode-select">Inflow mode</label>
            <select
              id="repayment-inflow-mode-select"
              value={repaymentInflowMode}
              onChange={(event) =>
                setRepaymentInflowMode(
                  event.target.value as StablecoinInflowMode
                )
              }
            >
              <option value="contractInteraction">
                ETH contract interaction
              </option>
              <option value="ck">Direct ck / ICRC ledger account</option>
            </select>
            <p>
              Contract mode sends ERC-20 tokens through Ethereum. ck mode
              returns the pool-owned ICRC account for a manual ckUSDC or ckUSDT
              transfer.
            </p>

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
              {repaymentInflowMode === "ck"
                ? "Get ck Repayment Target"
                : "Submit Contract Repayment"}
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
              onChange={(event) =>
                setSelectedOutflowPool({
                  poolId: event.target.value,
                  pools,
                  transferMode: DEFAULT_OUTFLOW_TRANSFER_MODE,
                  setSelectedPoolId: setSelectedBorrowPoolId,
                  setTransferMode: setBorrowTransferMode,
                  setDestinationType: setBorrowDestinationType,
                  setDestination: setBorrowDestination,
                })
              }
            >
              {borrowPools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>

            <label htmlFor="borrow-transfer-mode-select">Transfer mode</label>
            <select
              id="borrow-transfer-mode-select"
              value={borrowTransferMode}
              onChange={(event) =>
                setSelectedOutflowTransferMode({
                  transferMode: event.target.value as TransferMode,
                  pool: pools.find((pool) => pool.id === selectedBorrowPoolId),
                  setTransferMode: setBorrowTransferMode,
                  setDestinationType: setBorrowDestinationType,
                  setDestination: setBorrowDestination,
                })
              }
            >
              {getOutflowTransferModeOptions(
                pools.find((pool) => pool.id === selectedBorrowPoolId)
              ).map((transferMode) => (
                <option key={transferMode} value={transferMode}>
                  {formatOutflowTransferMode(
                    pools.find((pool) => pool.id === selectedBorrowPoolId),
                    transferMode
                  )}
                </option>
              ))}
            </select>
            <p>
              Native mode sends borrowed assets to the chain address or ICP
              ledger account. ck mode sends ck assets to an IC principal.
            </p>

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
            <select
              id="borrow-destination-type-select"
              value={borrowDestinationType}
              onChange={(event) =>
                setBorrowDestinationType(
                  event.target.value as OutflowAccountType
                )
              }
            >
              {getOutflowAccountTypeOptions(
                pools.find((pool) => pool.id === selectedBorrowPoolId),
                borrowTransferMode
              ).map((accountType) => (
                <option key={accountType} value={accountType}>
                  {formatOutflowAccountType(accountType)}
                </option>
              ))}
            </select>
            <p>
              For ICP pools, choose ICRC account, ICP account identifier, or IC
              principal. External addresses are for BTC and EVM-chain outflows.
            </p>
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

        {activeTab === "withdraw" ? (
          <div className="tab-panel">
            <h3>Withdraw</h3>

            <label htmlFor="withdraw-pool-select">Withdraw pool</label>
            <select
              id="withdraw-pool-select"
              value={selectedWithdrawPoolId}
              onChange={(event) =>
                setSelectedOutflowPool({
                  poolId: event.target.value,
                  pools,
                  transferMode: DEFAULT_OUTFLOW_TRANSFER_MODE,
                  setSelectedPoolId: setSelectedWithdrawPoolId,
                  setTransferMode: setWithdrawTransferMode,
                  setDestinationType: setWithdrawDestinationType,
                  setDestination: setWithdrawDestination,
                })
              }
            >
              {withdrawPools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>

            <label htmlFor="withdraw-transfer-mode-select">Transfer mode</label>
            <select
              id="withdraw-transfer-mode-select"
              value={withdrawTransferMode}
              onChange={(event) =>
                setSelectedOutflowTransferMode({
                  transferMode: event.target.value as TransferMode,
                  pool: pools.find(
                    (pool) => pool.id === selectedWithdrawPoolId
                  ),
                  setTransferMode: setWithdrawTransferMode,
                  setDestinationType: setWithdrawDestinationType,
                  setDestination: setWithdrawDestination,
                })
              }
            >
              {getOutflowTransferModeOptions(
                pools.find((pool) => pool.id === selectedWithdrawPoolId)
              ).map((transferMode) => (
                <option key={transferMode} value={transferMode}>
                  {formatOutflowTransferMode(
                    pools.find((pool) => pool.id === selectedWithdrawPoolId),
                    transferMode
                  )}
                </option>
              ))}
            </select>
            <p>
              Native mode sends withdrawn assets to the chain address or ICP
              ledger account. ck mode sends ck assets to an IC principal.
            </p>

            <label htmlFor="withdraw-amount-input">Withdraw amount</label>
            <input
              id="withdraw-amount-input"
              inputMode="decimal"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
            />

            <label htmlFor="withdraw-destination-input">
              Withdraw destination address
            </label>
            <select
              id="withdraw-destination-type-select"
              value={withdrawDestinationType}
              onChange={(event) =>
                setWithdrawDestinationType(
                  event.target.value as OutflowAccountType
                )
              }
            >
              {getOutflowAccountTypeOptions(
                pools.find((pool) => pool.id === selectedWithdrawPoolId),
                withdrawTransferMode
              ).map((accountType) => (
                <option key={accountType} value={accountType}>
                  {formatOutflowAccountType(accountType)}
                </option>
              ))}
            </select>
            <p>
              For ICP pools, choose ICRC account, ICP account identifier, or IC
              principal. External addresses are for BTC and EVM-chain outflows.
            </p>
            <input
              id="withdraw-destination-input"
              value={withdrawDestination}
              onChange={(event) => setWithdrawDestination(event.target.value)}
            />

            <button type="button" onClick={() => void run(withdraw, setStatus)}>
              Withdraw With Dynamic Wallet
            </button>
            <div className="result-box">{withdrawResult}</div>
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

function formatStablecoinInflowMode(mode: StablecoinInflowMode): string {
  return mode === "ck"
    ? "Direct ck / ICRC ledger account"
    : "ETH contract interaction";
}

function getDefaultOutflowAccountType(
  pool: Pool | undefined,
  transferMode: TransferMode
): OutflowAccountType {
  if (transferMode === "ckLedger" && pool?.chain !== Chain.ICP) {
    return "IcPrincipal";
  }

  return pool?.chain === Chain.ICP ? "IcrcAccount" : "ChainAddress";
}

function getOutflowAccountTypeOptions(
  pool: Pool | undefined,
  transferMode: TransferMode
): OutflowAccountType[] {
  if (pool?.chain === Chain.ICP) {
    return ICP_OUTFLOW_ACCOUNT_TYPES;
  }

  return transferMode === "ckLedger"
    ? CK_OUTFLOW_ACCOUNT_TYPES
    : EXTERNAL_CHAIN_OUTFLOW_ACCOUNT_TYPES;
}

function formatOutflowAccountType(accountType: OutflowAccountType): string {
  switch (accountType) {
    case "ChainAddress":
      return "Chain-native address";
    case "IcPrincipal":
      return "IC principal";
    case "IcrcAccount":
      return "ICRC account";
    case "IcpAccountIdentifier":
      return "ICP account identifier";
  }
}

function setSelectedOutflowPool(params: {
  poolId: string;
  pools: Pool[];
  transferMode: TransferMode;
  setSelectedPoolId(poolId: string): void;
  setTransferMode(transferMode: TransferMode): void;
  setDestinationType(accountType: OutflowAccountType): void;
  setDestination(destination: string): void;
}): void {
  const selectedPool = params.pools.find((pool) => pool.id === params.poolId);

  params.setSelectedPoolId(params.poolId);
  params.setTransferMode(params.transferMode);
  params.setDestinationType(
    getDefaultOutflowAccountType(selectedPool, params.transferMode)
  );
  params.setDestination("");
}

function setSelectedOutflowTransferMode(params: {
  transferMode: TransferMode;
  pool: Pool | undefined;
  setTransferMode(transferMode: TransferMode): void;
  setDestinationType(accountType: OutflowAccountType): void;
  setDestination(destination: string): void;
}): void {
  params.setTransferMode(params.transferMode);
  params.setDestinationType(
    getDefaultOutflowAccountType(params.pool, params.transferMode)
  );
  params.setDestination("");
}

function getOutflowTransferModeOptions(pool: Pool | undefined): TransferMode[] {
  return pool?.chain === Chain.ICP
    ? ["nativeAsset"]
    : ["nativeAsset", "ckLedger"];
}

function formatOutflowTransferMode(
  pool: Pool | undefined,
  transferMode: TransferMode
): string {
  if (transferMode === "ckLedger" && pool?.chain !== Chain.ICP) {
    return `ck${pool?.asset ?? "asset"} to IC principal`;
  }

  return pool?.chain === Chain.ICP
    ? "Native ICP ledger account"
    : "Native chain address";
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
          Supply / repay / borrow / withdraw
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
        Track contract-interaction supply, repayment, borrow, and withdraw
        activity by profile id or tx/activity id.
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
