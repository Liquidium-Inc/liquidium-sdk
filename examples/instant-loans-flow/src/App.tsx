import type { AssetPrices, Pool } from "@liquidium/client";
import { useEffect, useState } from "react";
import { formatConfig } from "./client";
import {
  formatAmount,
  formatError,
  formatInstantLoan,
  formatPercentFromBps,
  formatPool,
  formatUnixTimestampSeconds,
  getRecentLoanRefs,
  parseAmountToBaseUnits,
  parsePercentToBps,
  parsePositiveBigInt,
  saveRecentLoanRef,
} from "./format";
import {
  calculateLoanLtv,
  createInstantLoan,
  loadMarketData,
} from "./sdk-example";

const PRICE_DISPLAY_DECIMALS = 8;
const DEFAULT_COLLATERAL_ASSET = "BTC";
const DEFAULT_BORROW_ASSET = "USDC";

export function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [assetPrices, setAssetPrices] = useState<AssetPrices>({});
  const [selectedCollateralPoolId, setSelectedCollateralPoolId] = useState("");
  const [selectedBorrowPoolId, setSelectedBorrowPoolId] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("0.0002");
  const [borrowAmount, setBorrowAmount] = useState("9");
  const [maxLtv, setMaxLtv] = useState("30");
  const [depositWindowSeconds, setDepositWindowSeconds] = useState("3600");
  const [borrowDestination, setBorrowDestination] = useState("");
  const [refundDestination, setRefundDestination] = useState("");
  const [loanResult, setLoanResult] = useState("No loan created yet.");
  const [recentLoanRefs, setRecentLoanRefs] = useState<string[]>(() =>
    getRecentLoanRefs()
  );
  const [status, setStatus] = useState("Ready.");

  useEffect(() => {
    void run(async () => {
      setStatus("Loading pools...");
      const { pools: loadedPools, assetPrices: loadedAssetPrices } =
        await loadMarketData();
      const defaultCollateralPool = findPoolByAsset(
        loadedPools,
        DEFAULT_COLLATERAL_ASSET
      );
      const defaultBorrowPool = findPoolByAsset(
        loadedPools,
        DEFAULT_BORROW_ASSET
      );

      setPools(loadedPools);
      setAssetPrices(loadedAssetPrices);
      setSelectedCollateralPoolId(
        defaultCollateralPool?.id ?? loadedPools[0]?.id ?? ""
      );
      setSelectedBorrowPoolId(
        defaultBorrowPool?.id ?? loadedPools[0]?.id ?? ""
      );

      if (defaultCollateralPool) {
        setMaxLtv(formatBpsInput(defaultCollateralPool.maxLtv));
      }

      setStatus(`Loaded ${loadedPools.length} pools.`);
    }, setStatus);
  }, []);

  async function loadPools(): Promise<void> {
    setStatus("Loading pools...");
    const { pools: loadedPools, assetPrices: loadedAssetPrices } =
      await loadMarketData();
    const defaultCollateralPool = findPoolByAsset(
      loadedPools,
      DEFAULT_COLLATERAL_ASSET
    );
    const defaultBorrowPool = findPoolByAsset(
      loadedPools,
      DEFAULT_BORROW_ASSET
    );

    setPools(loadedPools);
    setAssetPrices(loadedAssetPrices);
    setSelectedCollateralPoolId(
      defaultCollateralPool?.id ?? loadedPools[0]?.id ?? ""
    );
    setSelectedBorrowPoolId(defaultBorrowPool?.id ?? loadedPools[0]?.id ?? "");

    if (defaultCollateralPool) {
      setMaxLtv(formatBpsInput(defaultCollateralPool.maxLtv));
    }

    setStatus(`Loaded ${loadedPools.length} pools.`);
  }

  async function createInstantLoanFromForm(): Promise<void> {
    const collateralPool = getSelectedPool(pools, selectedCollateralPoolId);
    const borrowPool = getSelectedPool(pools, selectedBorrowPoolId);
    const parsedCollateralAmount = parseAmountToBaseUnits(
      collateralAmount,
      collateralPool.decimals
    );
    const parsedBorrowAmount = parseAmountToBaseUnits(
      borrowAmount,
      borrowPool.decimals
    );
    const ltvMaxBps = parsePercentToBps(maxLtv);
    const parsedDepositWindowSeconds = parsePositiveBigInt(
      depositWindowSeconds,
      "Deposit window seconds"
    );
    const trimmedBorrowDestination = borrowDestination.trim();
    const trimmedRefundDestination = refundDestination.trim();

    if (!trimmedBorrowDestination) {
      throw new Error("Enter a borrow destination address.");
    }

    if (!trimmedRefundDestination) {
      throw new Error("Enter a refund destination address.");
    }

    setStatus("Creating instant loan...");
    setLoanResult("Creating loan...");

    const loan = await createInstantLoan({
      collateralPoolId: collateralPool.id,
      borrowPoolId: borrowPool.id,
      collateralAsset: collateralPool.asset,
      borrowAsset: borrowPool.asset,
      collateralAmount: parsedCollateralAmount,
      borrowAmount: parsedBorrowAmount,
      ltvMaxBps,
      depositWindowSeconds: parsedDepositWindowSeconds,
      borrowDestinationAddress: trimmedBorrowDestination,
      refundDestinationAddress: trimmedRefundDestination,
    });

    saveRecentLoanRef(loan.ref);
    setRecentLoanRefs(getRecentLoanRefs());
    setLoanResult(
      [
        "Loan created. Save the reference and send the initial deposit amount to the deposit target.",
        "",
        `Amount to send: ${formatAmount(
          loan.initialDeposit.amount,
          loan.initialDeposit.decimals
        )} ${collateralPool.asset}`,
        `Credited collateral: ${formatAmount(
          loan.initialDeposit.collateralAmount,
          loan.initialDeposit.decimals
        )} ${collateralPool.asset}`,
        `Estimated inflow fee: ${formatAmount(
          loan.initialDeposit.inflowFeeAmount,
          loan.initialDeposit.decimals
        )} ${collateralPool.asset}`,
        `Deposit detected: ${formatUnixTimestampSeconds(
          loan.initialDeposit.detectedTimestamp
        )}`,
        `Deposit expires: ${formatUnixTimestampSeconds(
          loan.initialDeposit.expiryTimestamp
        )}`,
        `Borrow amount: ${formatAmount(
          parsedBorrowAmount,
          borrowPool.decimals
        )} ${borrowPool.asset}`,
        `Max LTV: ${formatPercentFromBps(ltvMaxBps)}`,
        "",
        formatInstantLoan(loan, { pools }),
      ].join("\n")
    );
    setStatus(`Created instant loan ${loan.ref}.`);
  }

  function handleCollateralPoolChange(poolId: string): void {
    setSelectedCollateralPoolId(poolId);
    const pool = pools.find((candidatePool) => candidatePool.id === poolId);

    if (pool) {
      setMaxLtv(formatBpsInput(pool.maxLtv));
    }
  }

  return (
    <main>
      <nav className="page-switcher" aria-label="Example pages">
        <a className="page-switcher-link page-switcher-link-active" href="/">
          Create loan
        </a>
        <a className="page-switcher-link" href="/status.html">
          Loan status
        </a>
      </nav>

      <h1>Liquidium Instant Loan Flow</h1>
      <p>
        Create an accountless loan, then send collateral to the generated
        deposit target. Enter the borrow destination and refund address
        manually.
      </p>

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
        <h2>Create Instant Loan</h2>
        <label htmlFor="collateral-pool-select">Collateral pool</label>
        <select
          id="collateral-pool-select"
          value={selectedCollateralPoolId}
          onChange={(event) => handleCollateralPoolChange(event.target.value)}
        >
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.asset} on {pool.chain}
            </option>
          ))}
        </select>

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

        <div className="list-box">{getPricePreview()}</div>

        <label htmlFor="collateral-amount-input">Collateral amount</label>
        <input
          id="collateral-amount-input"
          inputMode="decimal"
          value={collateralAmount}
          onChange={(event) => setCollateralAmount(event.target.value)}
        />

        <label htmlFor="borrow-amount-input">Borrow amount</label>
        <input
          id="borrow-amount-input"
          inputMode="decimal"
          value={borrowAmount}
          onChange={(event) => setBorrowAmount(event.target.value)}
        />

        <label htmlFor="max-ltv-input">Max LTV %</label>
        <input
          id="max-ltv-input"
          inputMode="decimal"
          value={maxLtv}
          onChange={(event) => setMaxLtv(event.target.value)}
        />

        <div className="list-box">{getLtvPreview()}</div>

        <label htmlFor="deposit-window-input">Deposit window seconds</label>
        <input
          id="deposit-window-input"
          inputMode="numeric"
          value={depositWindowSeconds}
          onChange={(event) => setDepositWindowSeconds(event.target.value)}
        />

        <label htmlFor="borrow-destination-input">
          Borrow destination address
        </label>
        <input
          id="borrow-destination-input"
          value={borrowDestination}
          onChange={(event) => setBorrowDestination(event.target.value)}
        />

        <label htmlFor="refund-destination-input">
          Refund destination address
        </label>
        <input
          id="refund-destination-input"
          value={refundDestination}
          onChange={(event) => setRefundDestination(event.target.value)}
        />

        <button
          id="create-loan-button"
          type="button"
          onClick={() => void run(createInstantLoanFromForm, setStatus)}
        >
          Create Instant Loan
        </button>
        <div className="result-box">{loanResult}</div>
      </section>

      <section>
        <h2>Recent Loan Refs</h2>
        <div className="list-box">
          {recentLoanRefs.length === 0
            ? "No recent loans stored in this browser."
            : recentLoanRefs.join("\n")}
        </div>
      </section>

      <section>
        <h2>Status</h2>
        <pre>{status}</pre>
      </section>
    </main>
  );

  function getPricePreview(): string {
    try {
      const collateralPool = getSelectedPool(pools, selectedCollateralPoolId);
      const borrowPool = getSelectedPool(pools, selectedBorrowPoolId);

      return [
        "Prices used for LTV:",
        `Collateral ${collateralPool.asset}: ${formatUsdPrice(
          assetPrices[collateralPool.asset]
        )}`,
        `Borrow ${borrowPool.asset}: ${formatUsdPrice(
          assetPrices[borrowPool.asset]
        )}`,
        "Source: Liquidium market data.",
      ].join("\n");
    } catch {
      return "Load pools to show the prices used for LTV.";
    }
  }

  function getLtvPreview(): string {
    try {
      const collateralPool = getSelectedPool(pools, selectedCollateralPoolId);
      const borrowPool = getSelectedPool(pools, selectedBorrowPoolId);
      const parsedCollateralAmount = parseAmountToBaseUnits(
        collateralAmount,
        collateralPool.decimals
      );
      const parsedBorrowAmount = parseAmountToBaseUnits(
        borrowAmount,
        borrowPool.decimals
      );
      const ltvMaxBps = parsePercentToBps(maxLtv);
      const ltvCalculation = calculateLoanLtv({
        borrowAmount: parsedBorrowAmount,
        borrowPoolId: borrowPool.id,
        collateralAmount: parsedCollateralAmount,
        collateralPoolId: collateralPool.id,
        pools,
        assetPrices,
      });

      if (ltvCalculation.validationErrors.length > 0) {
        throw new Error(
          ltvCalculation.validationErrors
            .map((validationError) => validationError.message)
            .join(" ")
        );
      }

      return [
        `Implied current LTV: ${formatPercentFromBps(ltvCalculation.ltvBps)}`,
        `User max LTV: ${formatPercentFromBps(ltvMaxBps)}`,
        `SDK max allowed LTV: ${formatPercentFromBps(
          ltvCalculation.maxAllowedLtvBps
        )}`,
        ltvMaxBps > ltvCalculation.maxAllowedLtvBps
          ? "Warning: user max LTV is above the SDK max allowed LTV."
          : "User max LTV is within the SDK max allowed LTV.",
      ].join("\n");
    } catch (error) {
      return error instanceof Error
        ? `LTV preview unavailable: ${error.message}`
        : "LTV preview unavailable.";
    }
  }
}

function findPoolByAsset(pools: Pool[], asset: string): Pool | undefined {
  return pools.find((pool) => pool.asset === asset);
}

function formatBpsInput(value: bigint): string {
  return (Number(value) / 100).toString();
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
    maximumFractionDigits: PRICE_DISPLAY_DECIMALS,
  })}`;
}

async function run(
  action: () => Promise<void>,
  setStatus: (message: string) => void
): Promise<void> {
  try {
    await action();
  } catch (error) {
    setStatus(`Error: ${formatError(error)}`);
  }
}
