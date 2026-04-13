import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import type { AssetPrices, QuoteResult } from "@liquidium/client";
import { useEffect, useMemo, useState } from "react";
import {
  type ApySample,
  bigintJsonReplacer,
  createBorrowOutflow,
  createOrResolveProfileIdSimple,
  findBtcPool,
  formatLiquidiumError,
  getLoanQuote,
  isNativeAddressSupplyInstruction,
  loadBorrowApyHistory,
  loadLiquidationActivities,
  loadQuoteContext,
  loadUserPositionSummary,
  loadUserTransactionHistory,
  type OutflowDetails,
  type Pool,
  prepareBtcSupplyFlow,
  type SupplyAction,
  type SupplyFlow,
  type UserHistoryEntry,
  type UserStats,
} from "./liquidium-client-sdk";
import {
  getBitcoinPaymentAddress,
  getWalletSignatureChain,
  sendBitcoinTransaction,
  signWalletMessage,
} from "./wallet-signing";

type DynamicPrimaryWallet = NonNullable<
  ReturnType<typeof useDynamicContext>["primaryWallet"]
>;

const ASSET_DECIMALS: Record<string, number> = {
  BTC: 8,
  USDC: 6,
  USDT: 6,
};
const DEFAULT_BORROW_AMOUNT = "2000";
const DEFAULT_TARGET_LTV_BPS = 3200;
const DEFAULT_SUPPLY_ACTION: SupplyAction = "deposit";
const DEFAULT_SUPPLY_AMOUNT_BTC = "0.0001";
const INTERNAL_USD_DECIMALS = 8;
const PROFILE_STATS_USD_DECIMALS = 27;
const MIN_LTV_BPS = 1000;
const MAX_DECIMAL_PLACES = 8;
const DEFAULT_HISTORY_LIMIT = 20;
const USD_DECIMAL_SCALE_FACTOR =
  10n ** BigInt(PROFILE_STATS_USD_DECIMALS - INTERNAL_USD_DECIMALS);

export default function App() {
  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut, primaryWallet, setShowAuthFlow } = useDynamicContext();

  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Connect a wallet to start."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [prices, setPrices] = useState<AssetPrices>({});
  const [borrowPoolId, setBorrowPoolId] = useState("");
  const [collateralPoolId, setCollateralPoolId] = useState("");
  const [borrowAmountInput, setBorrowAmountInput] = useState(
    DEFAULT_BORROW_AMOUNT
  );
  const [targetLtvBps, setTargetLtvBps] = useState(DEFAULT_TARGET_LTV_BPS);
  const [borrowAddress, setBorrowAddress] = useState("");
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [quoteErrorMessage, setQuoteErrorMessage] = useState<string | null>(
    null
  );
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [borrowResult, setBorrowResult] = useState<OutflowDetails | null>(null);
  const [supplyAction, setSupplyAction] = useState<SupplyAction>(
    DEFAULT_SUPPLY_ACTION
  );
  const [supplyAmountInput, setSupplyAmountInput] = useState(
    DEFAULT_SUPPLY_AMOUNT_BTC
  );
  const [supplyFlow, setSupplyFlow] = useState<SupplyFlow | null>(null);
  const [userPositionSummary, setUserPositionSummary] =
    useState<UserStats | null>(null);
  const [isPositionSummaryLoading, setIsPositionSummaryLoading] =
    useState(false);
  const [transactionHistory, setTransactionHistory] = useState<
    UserHistoryEntry[]
  >([]);
  const [historyNextCursor, setHistoryNextCursor] = useState<string | null>(
    null
  );
  const [isTransactionHistoryLoading, setIsTransactionHistoryLoading] =
    useState(false);
  const [historyPoolIdFilter, setHistoryPoolIdFilter] = useState("");
  const [liquidationHistory, setLiquidationHistory] = useState<
    UserHistoryEntry[]
  >([]);
  const [isLiquidationHistoryLoading, setIsLiquidationHistoryLoading] =
    useState(false);
  const [liquidationPoolIdFilter, setLiquidationPoolIdFilter] = useState("");
  const [borrowRateHistory, setBorrowRateHistory] = useState<ApySample[]>([]);
  const [borrowRateNextCursor, setBorrowRateNextCursor] = useState<
    string | null
  >(null);
  const [isBorrowRateHistoryLoading, setIsBorrowRateHistoryLoading] =
    useState(false);
  const [borrowRatePoolIdFilter, setBorrowRatePoolIdFilter] = useState("");

  const walletAddress = primaryWallet?.address ?? "";
  const liquidiumAccountAddress =
    getLiquidiumAccountAddress(primaryWallet) ?? "";
  const walletChain = getWalletChainLabel(primaryWallet);

  const selectedBorrowPool = useMemo(() => {
    return pools.find((pool) => pool.id === borrowPoolId) ?? null;
  }, [borrowPoolId, pools]);
  const selectedCollateralPool = useMemo(() => {
    return pools.find((pool) => pool.id === collateralPoolId) ?? null;
  }, [collateralPoolId, pools]);
  const btcPool = useMemo(() => {
    return findBtcPool(pools) ?? null;
  }, [pools]);
  const maxAllowedLtvBps = Number(selectedCollateralPool?.maxLtv ?? 0n);
  const borrowAmountInBaseUnits = selectedBorrowPool
    ? parseDecimalToBaseUnits(
        borrowAmountInput,
        getAssetDecimals(selectedBorrowPool.asset)
      )
    : null;
  const borrowAmountDisplay = getBorrowAmountDisplay(
    borrowAmountInput,
    selectedBorrowPool?.asset
  );
  const quoteWarnings = quoteResult?.warnings ?? [];
  const quoteValidationErrors = quoteResult?.validationErrors ?? [];
  const borrowCapacityValidationError = getBorrowCapacityValidationError({
    quoteResult,
    userPositionSummary,
  });
  const hasQuoteBlockingErrors =
    quoteValidationErrors.length > 0 ||
    quoteErrorMessage !== null ||
    borrowCapacityValidationError !== null;
  const quoteHealthLabel = hasQuoteBlockingErrors
    ? "Needs attention"
    : isQuoteLoading
      ? "Refreshing"
      : quoteResult
        ? "Ready"
        : "Waiting";
  const workflowStageLabel = profileId
    ? pools.length > 0
      ? "Execution ready"
      : "Load market data"
    : "Set up account";
  const canSubmitBorrow =
    !isBusy &&
    !isQuoteLoading &&
    !hasQuoteBlockingErrors &&
    primaryWallet !== null &&
    profileId !== null &&
    selectedBorrowPool !== null &&
    selectedCollateralPool !== null &&
    borrowAmountInBaseUnits !== null &&
    borrowAmountInBaseUnits > 0n &&
    borrowAddress.trim().length > 0;
  const supplyAmountSats = parseDecimalToBaseUnits(
    supplyAmountInput,
    getAssetDecimals("BTC")
  );

  useEffect(() => {
    if (pools.length === 0) {
      return;
    }

    if (!borrowPoolId) {
      return;
    }

    const nextCollateralPool =
      pools.find((pool) => pool.id !== borrowPoolId) ?? pools[0] ?? null;

    if (!nextCollateralPool) {
      return;
    }

    setCollateralPoolId((currentCollateralPoolId) => {
      if (
        currentCollateralPoolId !== borrowPoolId &&
        currentCollateralPoolId &&
        pools.some((pool) => pool.id === currentCollateralPoolId)
      ) {
        return currentCollateralPoolId;
      }

      return nextCollateralPool.id;
    });
  }, [borrowPoolId, pools]);

  useEffect(() => {
    if (maxAllowedLtvBps === 0) {
      return;
    }

    setTargetLtvBps((currentTargetLtvBps) => {
      if (currentTargetLtvBps > maxAllowedLtvBps) {
        return maxAllowedLtvBps;
      }

      if (currentTargetLtvBps < MIN_LTV_BPS) {
        return MIN_LTV_BPS;
      }

      return currentTargetLtvBps;
    });
  }, [maxAllowedLtvBps]);

  useEffect(() => {
    let isCancelled = false;

    async function loadQuote() {
      if (
        pools.length === 0 ||
        !selectedBorrowPool ||
        !selectedCollateralPool ||
        borrowAmountInBaseUnits === null
      ) {
        setQuoteResult(null);
        setQuoteErrorMessage(null);
        return;
      }

      setIsQuoteLoading(true);
      setQuoteErrorMessage(null);

      try {
        const nextQuoteResult = await getLoanQuote({
          request: {
            borrowAmount: borrowAmountInBaseUnits,
            borrowPoolId: selectedBorrowPool.id,
            collateralPoolId: selectedCollateralPool.id,
            targetLtvBps: BigInt(targetLtvBps),
          },
          pools,
          prices,
        });

        if (!isCancelled) {
          setQuoteResult(nextQuoteResult);
        }
      } catch (error) {
        if (!isCancelled) {
          setQuoteResult(null);
          setQuoteErrorMessage(formatLiquidiumError(error));
        }
      } finally {
        if (!isCancelled) {
          setIsQuoteLoading(false);
        }
      }
    }

    void loadQuote();

    return () => {
      isCancelled = true;
    };
  }, [
    borrowAmountInBaseUnits,
    pools,
    prices,
    selectedBorrowPool,
    selectedCollateralPool,
    targetLtvBps,
  ]);

  useEffect(() => {
    let isCancelled = false;

    async function loadPositionSummary() {
      if (!profileId) {
        setUserPositionSummary(null);
        return;
      }

      setIsPositionSummaryLoading(true);

      try {
        const nextUserPositionSummary =
          await loadUserPositionSummary(profileId);

        if (!isCancelled) {
          setUserPositionSummary(nextUserPositionSummary);
        }
      } catch {
        if (!isCancelled) {
          setUserPositionSummary(null);
        }
      } finally {
        if (!isCancelled) {
          setIsPositionSummaryLoading(false);
        }
      }
    }

    void loadPositionSummary();

    return () => {
      isCancelled = true;
    };
  }, [profileId]);

  useEffect(() => {
    if (!profileId) {
      setTransactionHistory([]);
      setHistoryNextCursor(null);
      setLiquidationHistory([]);
      return;
    }

    setTransactionHistory([]);
    setHistoryNextCursor(null);
    setLiquidationHistory([]);
  }, [profileId]);

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

  async function handleLoadQuoteContext() {
    await runAction(async () => {
      setStatusMessage("Loading pools and prices...");

      const nextQuoteContext = await loadQuoteContext();
      const nextBorrowPoolId = resolveDefaultBorrowPoolId(
        nextQuoteContext.pools,
        nextQuoteContext.selectedPoolId
      );
      const nextCollateralPoolId = resolveDefaultCollateralPoolId(
        nextQuoteContext.pools,
        nextBorrowPoolId
      );

      setPools(nextQuoteContext.pools);
      setPrices(nextQuoteContext.prices);
      setBorrowPoolId(nextBorrowPoolId);
      setCollateralPoolId(nextCollateralPoolId);
      setStatusMessage(
        `Loaded ${nextQuoteContext.pools.length} pools and live prices.`
      );
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

      if (!selectedBorrowPool) {
        throw new Error("Load pools and choose a borrow asset first.");
      }

      if (!borrowAddress.trim()) {
        throw new Error("Enter an outflow address first.");
      }

      if (!borrowAmountInBaseUnits || borrowAmountInBaseUnits <= 0n) {
        throw new Error("Enter a valid borrow amount first.");
      }

      if (quoteValidationErrors.length > 0) {
        throw new Error(
          quoteValidationErrors[0]?.message ?? "Quote is invalid."
        );
      }

      if (borrowCapacityValidationError) {
        throw new Error(borrowCapacityValidationError);
      }

      const nextBorrowResult = await createBorrowOutflow({
        profileId,
        poolId: selectedBorrowPool.id,
        amount: borrowAmountInBaseUnits,
        receiverAddress: borrowAddress.trim(),
        signerWalletAddress: liquidiumAccountAddress,
        signerChain: getWalletSignatureChain(primaryWallet),
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

      if (!btcPool) {
        throw new Error("Load pools first so the BTC pool can be resolved.");
      }

      if (!primaryWallet || !isBitcoinWallet(primaryWallet)) {
        throw new Error("Connect a Bitcoin wallet first.");
      }

      if (!liquidiumAccountAddress) {
        throw new Error("Missing BTC signer account address.");
      }

      if (!supplyAmountSats || supplyAmountSats <= 0n) {
        throw new Error("Enter a valid BTC amount to supply.");
      }

      setStatusMessage(`Starting BTC ${supplyAction} flow...`);

      const nextSupplyFlow = await prepareBtcSupplyFlow({
        profileId,
        poolId: btcPool.id,
        action: supplyAction,
        btcAmountSats: supplyAmountSats,
        btcAccount: liquidiumAccountAddress,
        sendBtcTransaction: async ({ toAddress, amountSats }) =>
          await sendBitcoinTransaction(primaryWallet, {
            toAddress,
            amountSats,
          }),
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

  async function handleRefreshPositionSummary() {
    if (!profileId) {
      return;
    }

    setIsPositionSummaryLoading(true);

    try {
      const nextUserPositionSummary = await loadUserPositionSummary(profileId);
      setUserPositionSummary(nextUserPositionSummary);
    } catch (error) {
      setErrorMessage(formatLiquidiumError(error));
    } finally {
      setIsPositionSummaryLoading(false);
    }
  }

  async function handleLoadTransactionHistory(cursor?: string) {
    if (!profileId) {
      return;
    }

    setIsTransactionHistoryLoading(true);

    try {
      const historyPage = await loadUserTransactionHistory(
        profileId,
        historyPoolIdFilter || undefined,
        {
          cursor,
          limit: DEFAULT_HISTORY_LIMIT,
        }
      );

      setTransactionHistory((currentItems) =>
        cursor ? [...currentItems, ...historyPage.items] : historyPage.items
      );
      setHistoryNextCursor(historyPage.nextCursor ?? null);
      setStatusMessage(`Loaded ${historyPage.items.length} history entries.`);
    } catch (error) {
      setErrorMessage(formatLiquidiumError(error));
    } finally {
      setIsTransactionHistoryLoading(false);
    }
  }

  async function handleLoadLiquidationHistory() {
    if (!profileId) {
      return;
    }

    setIsLiquidationHistoryLoading(true);

    try {
      const liquidationPage = await loadLiquidationActivities(
        profileId,
        liquidationPoolIdFilter || undefined
      );

      setLiquidationHistory(liquidationPage.items);
      setStatusMessage(
        `Loaded ${liquidationPage.items.length} liquidation entries.`
      );
    } catch (error) {
      setErrorMessage(formatLiquidiumError(error));
    } finally {
      setIsLiquidationHistoryLoading(false);
    }
  }

  async function handleLoadBorrowRateHistory(cursor?: string) {
    if (!borrowRatePoolIdFilter) {
      setErrorMessage("Select a pool to load borrow rate history.");
      return;
    }

    setIsBorrowRateHistoryLoading(true);

    try {
      const ratesPage = await loadBorrowApyHistory(borrowRatePoolIdFilter, {
        cursor,
        limit: DEFAULT_HISTORY_LIMIT,
      });

      setBorrowRateHistory((currentItems) =>
        cursor ? [...currentItems, ...ratesPage.items] : ratesPage.items
      );
      setBorrowRateNextCursor(ratesPage.nextCursor ?? null);
      setStatusMessage(`Loaded ${ratesPage.items.length} borrow rate entries.`);
    } catch (error) {
      setErrorMessage(formatLiquidiumError(error));
    } finally {
      setIsBorrowRateHistoryLoading(false);
    }
  }

  return (
    <main className="app">
      <h1>Liquidium SDK example</h1>
      <p>Simple example for connect, profile, quote, borrow, and BTC supply.</p>

      <section className="section">
        <h2>Wallet</h2>
        <div className="actions">
          {isLoggedIn ? (
            <button onClick={() => void handleLogOut()} type="button">
              disconnect wallet
            </button>
          ) : (
            <button onClick={() => setShowAuthFlow(true)} type="button">
              connect wallet
            </button>
          )}
          <button
            disabled={isBusy}
            onClick={() => void handleLoadQuoteContext()}
            type="button"
          >
            load markets
          </button>
          <button
            disabled={isBusy || !primaryWallet || !liquidiumAccountAddress}
            onClick={() => void handleCreateProfile()}
            type="button"
          >
            create profile
          </button>
        </div>
        <dl className="details">
          <div>
            <dt>Workflow stage</dt>
            <dd>{workflowStageLabel}</dd>
          </div>
          <div>
            <dt>Quote status</dt>
            <dd>{quoteHealthLabel}</dd>
          </div>
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
          <div>
            <dt>Profile ID</dt>
            <dd>{profileId ?? "Not created yet"}</dd>
          </div>
          <div>
            <dt>Pools loaded</dt>
            <dd>{pools.length}</dd>
          </div>
          <div>
            <dt>BTC pool ID</dt>
            <dd>{btcPool?.id ?? "Load pools to detect the BTC pool."}</dd>
          </div>
        </dl>
      </section>

      <section className="section">
        <h2>Borrow quote</h2>
        <div className="field-grid">
          <label>
            Borrow asset
            <select
              disabled={pools.length === 0}
              value={borrowPoolId}
              onChange={(event) => setBorrowPoolId(event.target.value)}
            >
              <option value="">Choose a pool</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>
          </label>

          <label>
            Collateral asset
            <select
              disabled={pools.length === 0}
              value={collateralPoolId}
              onChange={(event) => setCollateralPoolId(event.target.value)}
            >
              <option value="">Choose a pool</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>
          </label>

          <label>
            Borrow amount
            <input
              inputMode="decimal"
              value={borrowAmountInput}
              onChange={(event) => setBorrowAmountInput(event.target.value)}
              placeholder="2000"
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

          <label>
            Target LTV: {formatBpsAsPercent(targetLtvBps)}
            <input
              type="range"
              min={MIN_LTV_BPS}
              max={Math.max(MIN_LTV_BPS, maxAllowedLtvBps || MIN_LTV_BPS)}
              value={Math.min(
                targetLtvBps,
                Math.max(MIN_LTV_BPS, maxAllowedLtvBps || MIN_LTV_BPS)
              )}
              onChange={(event) => setTargetLtvBps(Number(event.target.value))}
              disabled={maxAllowedLtvBps === 0}
            />
          </label>
        </div>

        <dl className="details">
          <div>
            <dt>Borrow preview</dt>
            <dd>{borrowAmountDisplay}</dd>
          </div>
          <div>
            <dt>Max LTV</dt>
            <dd>{formatBpsAsPercent(maxAllowedLtvBps)}</dd>
          </div>
          <div>
            <dt>Required collateral</dt>
            <dd>
              {selectedCollateralPool
                ? formatPoolAmount(
                    quoteResult?.requiredCollateralAmount ?? 0n,
                    selectedCollateralPool.asset
                  )
                : "Select collateral"}
            </dd>
          </div>
          <div>
            <dt>Required collateral value</dt>
            <dd>
              {formatInternalUsd(quoteResult?.requiredCollateralUsd ?? 0n)}
            </dd>
          </div>
          <div>
            <dt>Estimated borrow value</dt>
            <dd>{formatInternalUsd(quoteResult?.borrowUsd ?? 0n)}</dd>
          </div>
        </dl>

        <div className="messages">
          {isQuoteLoading ? <p>Refreshing quote...</p> : null}
          {quoteErrorMessage ? (
            <p className="error">{quoteErrorMessage}</p>
          ) : null}
          {quoteValidationErrors.map((validationError) => (
            <p className="error" key={validationError.code}>
              {validationError.message}
            </p>
          ))}
          {borrowCapacityValidationError ? (
            <p className="error">{borrowCapacityValidationError}</p>
          ) : null}
          {quoteWarnings.map((warning) => (
            <p className="warning" key={warning.code}>
              {warning.message}
            </p>
          ))}
        </div>

        <div className="actions">
          <button
            disabled={!canSubmitBorrow}
            onClick={() => void handleBorrow()}
            type="button"
          >
            borrow
          </button>
        </div>

        <h3>Borrow result</h3>
        <pre className="output">
          {borrowResult
            ? JSON.stringify(borrowResult, bigintJsonReplacer, 2)
            : "Borrow result will appear here after submission."}
        </pre>
      </section>

      <section className="section">
        <h2>BTC supply flow</h2>
        <div className="field-grid">
          <label>
            BTC amount
            <input
              inputMode="decimal"
              value={supplyAmountInput}
              onChange={(event) => setSupplyAmountInput(event.target.value)}
              placeholder="0.0001"
            />
          </label>
        </div>
        <div className="actions">
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
            disabled={
              isBusy ||
              !profileId ||
              !btcPool ||
              !primaryWallet ||
              !isBitcoinWallet(primaryWallet) ||
              !supplyAmountSats ||
              supplyAmountSats <= 0n
            }
            onClick={() => void handleStartSupplyFlow()}
            type="button"
          >
            start btc flow
          </button>
          <button
            disabled={
              !isNativeAddressSupplyInstruction(supplyFlow?.instruction ?? null)
            }
            onClick={() => void handleCopyBtcAddress()}
            type="button"
          >
            copy btc address
          </button>
          <button
            disabled={
              !isNativeAddressSupplyInstruction(supplyFlow?.instruction ?? null)
            }
            onClick={handleOpenBitcoinUri}
            type="button"
          >
            open bitcoin uri
          </button>
        </div>

        <pre className="output">
          {supplyFlow
            ? JSON.stringify(supplyFlow, bigintJsonReplacer, 2)
            : "No BTC supply flow yet."}
        </pre>
      </section>

      <section className="section">
        <h2>Status</h2>
        <p>{statusMessage}</p>
        {errorMessage ? <p className="error">{errorMessage}</p> : null}
      </section>

      <section className="section">
        <h2>Current positions</h2>
        <div className="actions">
          <button
            disabled={!profileId || isPositionSummaryLoading}
            onClick={() => void handleRefreshPositionSummary()}
            type="button"
          >
            refresh positions
          </button>
        </div>
        {isPositionSummaryLoading ? <p>Loading positions...</p> : null}
        {!profileId ? (
          <p>Create or resolve a profile to view positions.</p>
        ) : null}
        {profileId && !isPositionSummaryLoading ? (
          <pre className="output">
            {userPositionSummary
              ? JSON.stringify(userPositionSummary, bigintJsonReplacer, 2)
              : "No position summary available yet."}
          </pre>
        ) : null}
      </section>

      <section className="section">
        <h2>User transaction history</h2>
        <div className="field-grid">
          <label>
            Pool filter
            <select
              value={historyPoolIdFilter}
              onChange={(event) => setHistoryPoolIdFilter(event.target.value)}
            >
              <option value="">All pools</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="actions">
          <button
            disabled={!profileId || isTransactionHistoryLoading}
            onClick={() => void handleLoadTransactionHistory()}
            type="button"
          >
            load history
          </button>
          <button
            disabled={
              !profileId || !historyNextCursor || isTransactionHistoryLoading
            }
            onClick={() =>
              void handleLoadTransactionHistory(historyNextCursor ?? undefined)
            }
            type="button"
          >
            load more
          </button>
        </div>

        {isTransactionHistoryLoading ? <p>Loading history...</p> : null}

        {!profileId ? (
          <p>Create or resolve a profile to load transaction history.</p>
        ) : null}

        {profileId ? (
          <>
            <p>
              Loaded entries: {transactionHistory.length}
              {historyNextCursor ? " (more available)" : ""}
            </p>
            <pre className="output">
              {transactionHistory.length > 0
                ? JSON.stringify(
                    transactionHistory.map((entry) => ({
                      ...entry,
                      amountDisplay: formatHistoryAmount(entry, pools),
                    })),
                    bigintJsonReplacer,
                    2
                  )
                : "No history loaded yet."}
            </pre>
          </>
        ) : null}
      </section>

      <section className="section">
        <h2>User liquidation history</h2>
        <div className="field-grid">
          <label>
            Pool filter
            <select
              value={liquidationPoolIdFilter}
              onChange={(event) =>
                setLiquidationPoolIdFilter(event.target.value)
              }
            >
              <option value="">All pools</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="actions">
          <button
            disabled={!profileId || isLiquidationHistoryLoading}
            onClick={() => void handleLoadLiquidationHistory()}
            type="button"
          >
            load liquidations
          </button>
        </div>

        {isLiquidationHistoryLoading ? <p>Loading liquidations...</p> : null}

        {!profileId ? (
          <p>Create or resolve a profile to load liquidation history.</p>
        ) : null}

        {profileId ? (
          <>
            <p>Loaded liquidations: {liquidationHistory.length}</p>
            <pre className="output">
              {liquidationHistory.length > 0
                ? JSON.stringify(
                    liquidationHistory.map((entry) => ({
                      ...entry,
                      amountDisplay: formatHistoryAmount(entry, pools),
                    })),
                    bigintJsonReplacer,
                    2
                  )
                : "No liquidation history loaded yet."}
            </pre>
          </>
        ) : null}
      </section>

      <section className="section">
        <h2>Borrow rate history</h2>
        <div className="field-grid">
          <label>
            Pool
            <select
              value={borrowRatePoolIdFilter}
              onChange={(event) =>
                setBorrowRatePoolIdFilter(event.target.value)
              }
            >
              <option value="">Choose a pool</option>
              {pools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="actions">
          <button
            disabled={!borrowRatePoolIdFilter || isBorrowRateHistoryLoading}
            onClick={() => void handleLoadBorrowRateHistory()}
            type="button"
          >
            load borrow rates
          </button>
          <button
            disabled={
              !borrowRatePoolIdFilter ||
              !borrowRateNextCursor ||
              isBorrowRateHistoryLoading
            }
            onClick={() =>
              void handleLoadBorrowRateHistory(
                borrowRateNextCursor ?? undefined
              )
            }
            type="button"
          >
            load more
          </button>
        </div>

        {isBorrowRateHistoryLoading ? <p>Loading borrow rates...</p> : null}

        <p>
          Loaded rate entries: {borrowRateHistory.length}
          {borrowRateNextCursor ? " (more available)" : ""}
        </p>
        <pre className="output">
          {borrowRateHistory.length > 0
            ? JSON.stringify(borrowRateHistory, bigintJsonReplacer, 2)
            : "No borrow rate history loaded yet."}
        </pre>
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

function resolveDefaultCollateralPoolId(
  pools: Pool[],
  borrowPoolId: string
): string {
  const btcPool = findBtcPool(pools);

  if (btcPool && btcPool.id !== borrowPoolId) {
    return btcPool.id;
  }

  return pools.find((pool) => pool.id !== borrowPoolId)?.id ?? borrowPoolId;
}

function resolveDefaultBorrowPoolId(
  pools: Pool[],
  fallbackPoolId: string
): string {
  const stablePool = pools.find((pool) => isStablecoinAsset(pool.asset));

  return stablePool?.id ?? fallbackPoolId;
}

function parseDecimalToBaseUnits(
  value: string,
  decimals: number
): bigint | null {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  if (!/^\d+(\.\d+)?$/.test(normalizedValue)) {
    return null;
  }

  const [wholePart, fractionalPart = ""] = normalizedValue.split(".");
  const paddedFractionalPart = fractionalPart
    .slice(0, decimals)
    .padEnd(decimals, "0");

  return BigInt(`${wholePart}${paddedFractionalPart}`);
}

function getAssetDecimals(asset: string): number {
  return ASSET_DECIMALS[asset] ?? MAX_DECIMAL_PLACES;
}

function isStablecoinAsset(asset: string): boolean {
  return asset === "USDC" || asset === "USDT";
}

function getBorrowAmountDisplay(
  value: string,
  asset: string | undefined
): string {
  if (!asset) {
    return "--";
  }

  const normalizedValue = value.trim();
  const isStableAsset = isStablecoinAsset(asset);

  if (!normalizedValue) {
    return isStableAsset ? "$0" : `0 ${asset}`;
  }

  if (isStableAsset) {
    return formatUsdFromDecimalString(normalizedValue);
  }

  return `${normalizedValue} ${asset}`;
}

function formatUsdFromDecimalString(value: string): string {
  const amount = Number(value || "0");

  if (Number.isNaN(amount)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatInternalUsd(value: bigint): string {
  return formatUsdFromDecimalString(
    formatBaseUnitsAsDecimal(value, INTERNAL_USD_DECIMALS, 2)
  );
}

function formatPoolAmount(value: bigint, asset: string): string {
  const decimals = getAssetDecimals(asset);
  const maxFractionDigits = asset === "BTC" ? 8 : 4;

  return `${formatBaseUnitsAsDecimal(value, decimals, maxFractionDigits)} ${asset}`;
}

function formatBaseUnitsAsDecimal(
  value: bigint,
  decimals: number,
  maxFractionDigits: number
): string {
  const isNegative = value < 0n;
  const normalizedValue = isNegative ? value * -1n : value;
  const stringValue = normalizedValue.toString().padStart(decimals + 1, "0");
  const wholePart = stringValue.slice(0, -decimals) || "0";
  const fractionalPart = stringValue.slice(-decimals);
  const trimmedFractionalPart = fractionalPart
    .slice(0, maxFractionDigits)
    .replace(/0+$/, "");
  const formattedWholePart = new Intl.NumberFormat("en-US").format(
    Number(wholePart)
  );
  const signPrefix = isNegative ? "-" : "";

  if (!trimmedFractionalPart) {
    return `${signPrefix}${formattedWholePart}`;
  }

  return `${signPrefix}${formattedWholePart}.${trimmedFractionalPart}`;
}

function formatHistoryAmount(entry: UserHistoryEntry, pools: Pool[]): string {
  const matchingPool = pools.find((pool) => pool.id === entry.poolId);
  if (!matchingPool) {
    return entry.amount.toString();
  }

  return formatPoolAmount(entry.amount, matchingPool.asset);
}

function getBorrowCapacityValidationError(params: {
  quoteResult: QuoteResult | null;
  userPositionSummary: UserStats | null;
}): string | null {
  const { quoteResult, userPositionSummary } = params;

  if (!quoteResult || !userPositionSummary) {
    return null;
  }

  const availableBorrowUsd =
    userPositionSummary.borrowingPower.maxBorrowableUsd;

  if (availableBorrowUsd <= 0n) {
    return "No collateral available yet. Deposit collateral and wait for confirmations before borrowing.";
  }

  if (quoteResult.borrowUsd <= 0n) {
    return null;
  }

  const requestedBorrowUsdAtProfileScale =
    quoteResult.borrowUsd * USD_DECIMAL_SCALE_FACTOR;

  if (requestedBorrowUsdAtProfileScale > availableBorrowUsd) {
    return "Insufficient collateral for this borrow amount. Deposit more collateral or lower the borrow amount/LTV.";
  }

  return null;
}

function formatBpsAsPercent(value: number): string {
  return `${(value / 100).toFixed(0)}%`;
}
