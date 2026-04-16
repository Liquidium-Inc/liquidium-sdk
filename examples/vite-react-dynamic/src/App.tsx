import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import type {
  ApySample,
  AssetPrices,
  OutflowDetails,
  Pool,
  QuoteResult,
  UserHistoryEntry,
  UserStats,
} from "@liquidium/client";
import { useEffect, useMemo, useState } from "react";
import { ExampleWalletSection } from "./ExampleWalletSection";
import {
  getLiquidiumAccountAddress,
  getWalletChainLabel,
} from "./example-wallet";
import { getAssetDecimals } from "./lib/assets";
import { getBorrowCapacityValidationError } from "./lib/borrow-capacity";
import { createLiquidiumClient } from "./lib/client";
import {
  bigintJsonReplacer,
  formatBorrowAmountDisplay,
  formatBpsAsPercent,
  formatInternalUsd,
  formatLiquidiumError,
  formatPoolAmount,
  parseDecimalToBaseUnits,
} from "./lib/format";
import {
  findBtcPool,
  formatHistoryAmount,
  resolveDefaultBorrowPoolId,
  resolveDefaultCollateralPoolId,
} from "./lib/pools";
import { createOrResolveProfile } from "./lib/profile";
import { getWalletSignatureChain, signWalletMessage } from "./wallet-signing";

const DEFAULT_BORROW_AMOUNT = "2000";
const DEFAULT_TARGET_LTV_BPS = 3200;
const MIN_LTV_BPS = 1000;
const DEFAULT_HISTORY_LIMIT = 20;

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
  const [borrowResultStatus, setBorrowResultStatus] = useState<string | null>(
    null
  );
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

  const selectedBorrowPool = useMemo(
    () => pools.find((pool) => pool.id === borrowPoolId) ?? null,
    [borrowPoolId, pools]
  );
  const selectedCollateralPool = useMemo(
    () => pools.find((pool) => pool.id === collateralPoolId) ?? null,
    [collateralPoolId, pools]
  );
  const btcPool = useMemo(() => findBtcPool(pools) ?? null, [pools]);
  const maxAllowedLtvBps = Number(selectedCollateralPool?.maxLtv ?? 0n);
  const borrowAmountInBaseUnits = selectedBorrowPool
    ? parseDecimalToBaseUnits(
        borrowAmountInput,
        getAssetDecimals(selectedBorrowPool.asset)
      )
    : null;
  const borrowAmountDisplay = formatBorrowAmountDisplay(
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

  useEffect(() => {
    if (pools.length === 0 || !borrowPoolId) {
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
        const client = createLiquidiumClient();
        const nextQuoteResult = await client.quote.quote(
          {
            borrowAmount: borrowAmountInBaseUnits,
            borrowPoolId: selectedBorrowPool.id,
            collateralPoolId: selectedCollateralPool.id,
            targetLtvBps: BigInt(targetLtvBps),
          },
          pools,
          prices
        );

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
        const client = createLiquidiumClient();
        const nextUserPositionSummary =
          await client.positions.getUserStats(profileId);

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

      setStatusMessage("Creating Liquidium account...");

      const { profileId: nextProfileId, wasCreated } =
        await createOrResolveProfile({
          client: createLiquidiumClient(),
          walletAddress: liquidiumAccountAddress,
          chain: getWalletSignatureChain(primaryWallet),
          signMessage: (message) =>
            signWalletMessage(primaryWallet, message, liquidiumAccountAddress),
        });

      setProfileId(nextProfileId);
      setStatusMessage(
        wasCreated
          ? `Created Liquidium profile ${nextProfileId}.`
          : `Resolved Liquidium profile ${nextProfileId}.`
      );
    });
  }

  async function handleLoadMarkets() {
    await runAction(async () => {
      setStatusMessage("Loading pools and prices...");

      const client = createLiquidiumClient();
      const [nextPools, nextPrices] = await Promise.all([
        client.market.getPools(),
        client.market.getAssetPrices(),
      ]);
      const defaultPoolId = findBtcPool(nextPools)?.id ?? nextPools[0]?.id ?? "";
      const nextBorrowPoolId = resolveDefaultBorrowPoolId(
        nextPools,
        defaultPoolId
      );
      const nextCollateralPoolId = resolveDefaultCollateralPoolId(
        nextPools,
        nextBorrowPoolId
      );

      setPools(nextPools);
      setPrices(nextPrices);
      setBorrowPoolId(nextBorrowPoolId);
      setCollateralPoolId(nextCollateralPoolId);
      setStatusMessage(
        `Loaded ${nextPools.length} pools and live prices.`
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

      setBorrowResult(null);
      setBorrowResultStatus("Submitting borrow request...");
      setStatusMessage("Please sign the borrow message to continue...");

      try {
        const client = createLiquidiumClient();
        const nextBorrowResult = await client.lending.borrow({
          profileId,
          poolId: selectedBorrowPool.id,
          amount: borrowAmountInBaseUnits,
          receiverAddress: borrowAddress.trim(),
          signerWalletAddress: liquidiumAccountAddress,
          signerChain: getWalletSignatureChain(primaryWallet),
          signerWalletAdapter: {
            signMessage: async ({ message }) =>
              await signWalletMessage(
                primaryWallet,
                message,
                liquidiumAccountAddress
              ),
          },
        });

        setBorrowResult(nextBorrowResult);
        setBorrowResultStatus(null);
        setStatusMessage(
          nextBorrowResult.txid
            ? `Created borrow outflow ${nextBorrowResult.id} with transaction id ${nextBorrowResult.txid}.`
            : `Created borrow outflow ${nextBorrowResult.id}. Transaction id pending.`
        );
      } catch (error) {
        setBorrowResultStatus(null);
        throw error;
      }
    });
  }

  async function handleRefreshPositionSummary() {
    if (!profileId) {
      return;
    }

    setIsPositionSummaryLoading(true);

    try {
      const client = createLiquidiumClient();
      const nextUserPositionSummary =
        await client.positions.getUserStats(profileId);

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
      const client = createLiquidiumClient();
      const historyPage = await client.history.getUserTransactionHistory(
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
      const client = createLiquidiumClient();
      const liquidationPage = await client.history.getLiquidationHistory(
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
      const client = createLiquidiumClient();
      const ratesPage = await client.history.getBorrowRateHistory(
        borrowRatePoolIdFilter,
        { cursor, limit: DEFAULT_HISTORY_LIMIT }
      );

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
      <h1>Liquidium SDK borrow example</h1>
      <p>
        Focused example for quote-first borrow, position reads, and history.
      </p>

      <ExampleWalletSection
        isLoggedIn={isLoggedIn}
        isBusy={isBusy}
        canCreateProfile={Boolean(primaryWallet && liquidiumAccountAddress)}
        onConnect={() => setShowAuthFlow(true)}
        onDisconnect={() => void handleLogOut()}
        onLoadMarkets={() => void handleLoadMarkets()}
        onCreateProfile={() => void handleCreateProfile()}
        details={[
          { label: "Workflow stage", value: workflowStageLabel },
          { label: "Quote status", value: quoteHealthLabel },
          { label: "Connected chain", value: walletChain ?? "Not connected" },
          { label: "Wallet address", value: walletAddress || "Not connected" },
          {
            label: "SDK account address",
            value: liquidiumAccountAddress || "Not connected",
          },
          { label: "Profile ID", value: profileId ?? "Not created yet" },
          { label: "Pools loaded", value: pools.length },
          {
            label: "BTC pool ID",
            value: btcPool?.id ?? "Load pools to detect the BTC pool.",
          },
        ]}
      />

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
            : borrowResultStatus
              ? borrowResultStatus
              : "Borrow result will appear here after submission."}
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