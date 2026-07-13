import type {
  AssetPrices,
  InstantLoan,
  InstantLoanInitialDepositTargetQuote,
  InstantLoanRepaymentTargetQuote,
  Pool,
} from "@liquidium/client";
import { Chain, isAssetIdentifier } from "@liquidium/client";
import { useEffect, useState } from "react";
import { formatConfig } from "./client";
import {
  formatAmount,
  formatError,
  formatInstantLoan,
  formatPercentFromBps,
  formatPool,
  formatSupplyTarget,
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
const DEFAULT_TRANSFER_CHAIN: Chain = Chain.ETH;
const CK_TARGET_ASSETS = new Set(["BTC", "USDC", "USDT"]);

type LoanTargetOptions = {
  initialDeposit: LoanTargetOption[];
  repayment: LoanTargetOption[];
};

type LoanTargetOption = {
  label: string;
  loan: InstantLoan;
  initialDeposit?: InstantLoanInitialDepositTargetQuote;
  repayment?: InstantLoanRepaymentTargetQuote;
};

export function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [assetPrices, setAssetPrices] = useState<AssetPrices>({});
  const [selectedCollateralPoolId, setSelectedCollateralPoolId] = useState("");
  const [selectedBorrowPoolId, setSelectedBorrowPoolId] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("0.0002");
  const [borrowAmount, setBorrowAmount] = useState("9");
  const [collateralDepositChain, setCollateralDepositChain] = useState<Chain>(
    DEFAULT_TRANSFER_CHAIN
  );
  const [borrowChain, setBorrowChain] = useState<Chain>(DEFAULT_TRANSFER_CHAIN);
  const [refundChain, setRefundChain] = useState<Chain>(DEFAULT_TRANSFER_CHAIN);
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
      resetDestinationControls({
        collateralPool: defaultCollateralPool,
        borrowPool: defaultBorrowPool,
        setCollateralDepositChain,
        setBorrowChain,
        setRefundChain,
      });

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
    resetDestinationControls({
      collateralPool: defaultCollateralPool,
      borrowPool: defaultBorrowPool,
      setCollateralDepositChain,
      setBorrowChain,
      setRefundChain,
    });

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

    const borrowIdentifier = {
      asset: borrowPool.asset,
      chain: borrowChain,
    };

    if (!isAssetIdentifier(borrowIdentifier)) {
      throw new Error(
        `${borrowChain}/${borrowPool.asset} is not a supported borrow route.`
      );
    }

    setStatus("Creating instant loan...");
    setLoanResult("Creating loan...");

    const loan = await createInstantLoan({
      collateral: {
        poolId: collateralPool.id,
        asset: collateralPool.asset,
        amount: parsedCollateralAmount,
      },
      borrow: {
        ...borrowIdentifier,
        poolId: borrowPool.id,
        amount: parsedBorrowAmount,
        destination: trimmedBorrowDestination,
      },
      refund: {
        chain: refundChain,
        destination: trimmedRefundDestination,
      },
      ltvMaxBps,
      depositWindowSeconds: parsedDepositWindowSeconds,
    });
    const loanTargetOptions = getLoanTargetOptions(loan);
    const selectedInitialDepositTarget =
      loan.initialDeposit.targets[collateralDepositChain];

    if (!selectedInitialDepositTarget) {
      throw new Error(
        `Missing ${collateralDepositChain} initial-deposit target.`
      );
    }

    saveRecentLoanRef(loan.ref);
    setRecentLoanRefs(getRecentLoanRefs());
    setLoanResult(
      [
        "Loan created. Save the reference and send the initial deposit amount to the deposit target.",
        "",
        `Amount to send: ${formatAmount(
          selectedInitialDepositTarget.amount,
          loan.initialDeposit.decimals
        )} ${formatTransferAssetLabel(collateralPool, collateralDepositChain)}`,
        `Credited collateral: ${formatAmount(
          loan.initialDeposit.collateralAmount,
          loan.initialDeposit.decimals
        )} ${collateralPool.asset}`,
        `Estimated inflow fee: ${formatAmount(
          selectedInitialDepositTarget.inflowFeeAmount,
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
        "Initial deposit targets:",
        loanTargetOptions.initialDeposit
          .map((targetOption) =>
            formatInitialDepositTargetOption(targetOption, collateralPool)
          )
          .join("\n\n"),
        "",
        "Repayment targets:",
        loanTargetOptions.repayment
          .map((targetOption) =>
            formatRepaymentTargetOption(targetOption, borrowPool)
          )
          .join("\n\n"),
        "",
        formatInstantLoan(loan, { pools, includeTargets: false }),
      ].join("\n")
    );
    setStatus(`Created instant loan ${loan.ref}.`);
  }

  function handleCollateralPoolChange(poolId: string): void {
    setSelectedCollateralPoolId(poolId);
    const pool = pools.find((candidatePool) => candidatePool.id === poolId);

    setCollateralDepositChain(getDefaultChain(pool));

    setSelectedDestinationChain({
      pool,
      transferChain: DEFAULT_TRANSFER_CHAIN,
      setChain: setRefundChain,
      setDestination: setRefundDestination,
    });

    if (pool) {
      setMaxLtv(formatBpsInput(pool.maxLtv));
    }
  }

  function handleBorrowPoolChange(poolId: string): void {
    setSelectedBorrowPoolId(poolId);
    const pool = pools.find((candidatePool) => candidatePool.id === poolId);

    setSelectedDestinationChain({
      pool,
      transferChain: DEFAULT_TRANSFER_CHAIN,
      setChain: setBorrowChain,
      setDestination: setBorrowDestination,
    });
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
              Asset: {pool.asset} | Pool chain: {pool.chain}
            </option>
          ))}
        </select>

        <label htmlFor="collateral-deposit-chain-select">
          Collateral deposit asset / chain
        </label>
        <select
          id="collateral-deposit-chain-select"
          value={collateralDepositChain}
          onChange={(event) =>
            setCollateralDepositChain(event.target.value as Chain)
          }
        >
          {getChainOptions(
            pools.find((pool) => pool.id === selectedCollateralPoolId)
          ).map((transferChain) => (
            <option key={transferChain} value={transferChain}>
              {formatTransferAssetLabel(
                pools.find((pool) => pool.id === selectedCollateralPoolId),
                transferChain
              )}
            </option>
          ))}
        </select>
        <p>
          Choose the native asset or its ck representation for the collateral
          deposit.
        </p>

        <label htmlFor="borrow-pool-select">Borrow pool</label>
        <select
          id="borrow-pool-select"
          value={selectedBorrowPoolId}
          onChange={(event) => handleBorrowPoolChange(event.target.value)}
        >
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              Asset: {pool.asset} | Pool chain: {pool.chain}
            </option>
          ))}
        </select>

        <label htmlFor="borrow-chain-select">Borrow asset / chain</label>
        <select
          id="borrow-chain-select"
          value={borrowChain}
          onChange={(event) =>
            setSelectedDestinationChain({
              pool: pools.find((pool) => pool.id === selectedBorrowPoolId),
              transferChain: event.target.value as Chain,
              setChain: setBorrowChain,
              setDestination: setBorrowDestination,
            })
          }
        >
          {getChainOptions(
            pools.find((pool) => pool.id === selectedBorrowPoolId)
          ).map((transferChain) => (
            <option key={transferChain} value={transferChain}>
              {formatTransferAssetLabel(
                pools.find((pool) => pool.id === selectedBorrowPoolId),
                transferChain
              )}
            </option>
          ))}
        </select>
        <p>
          Select the asset representation and chain where borrowed funds should
          be sent.
        </p>

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
          {formatDestinationInputLabel(
            "Borrow destination",
            pools.find((pool) => pool.id === selectedBorrowPoolId),
            borrowChain
          )}
        </label>
        <input
          id="borrow-destination-input"
          value={borrowDestination}
          onChange={(event) => setBorrowDestination(event.target.value)}
        />

        <label htmlFor="refund-chain-select">
          Refund/withdrawal asset / chain
        </label>
        <select
          id="refund-chain-select"
          value={refundChain}
          onChange={(event) =>
            setSelectedDestinationChain({
              pool: pools.find((pool) => pool.id === selectedCollateralPoolId),
              transferChain: event.target.value as Chain,
              setChain: setRefundChain,
              setDestination: setRefundDestination,
            })
          }
        >
          {getChainOptions(
            pools.find((pool) => pool.id === selectedCollateralPoolId)
          ).map((transferChain) => (
            <option key={transferChain} value={transferChain}>
              {formatTransferAssetLabel(
                pools.find((pool) => pool.id === selectedCollateralPoolId),
                transferChain
              )}
            </option>
          ))}
        </select>
        <p>
          Refunds and full collateral withdrawals use the selected chain. The
          SDK uses the right destination format for that chain.
        </p>
        <label htmlFor="refund-destination-input">
          {formatDestinationInputLabel(
            "Refund/withdrawal destination",
            pools.find((pool) => pool.id === selectedCollateralPoolId),
            refundChain
          )}
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

function resetDestinationControls(params: {
  collateralPool: Pool | undefined;
  borrowPool: Pool | undefined;
  setCollateralDepositChain(transferChain: Chain): void;
  setBorrowChain(transferChain: Chain): void;
  setRefundChain(transferChain: Chain): void;
}): void {
  const collateralChain = getDefaultChain(params.collateralPool);
  const borrowChain = getDefaultChain(params.borrowPool);

  params.setCollateralDepositChain(collateralChain);
  params.setBorrowChain(borrowChain);
  params.setRefundChain(collateralChain);
}

function setSelectedDestinationChain(params: {
  pool: Pool | undefined;
  transferChain: Chain;
  setChain(transferChain: Chain): void;
  setDestination(destination: string): void;
}): void {
  const transferChain = getSupportedChain(params.pool, params.transferChain);

  params.setChain(transferChain);
  params.setDestination("");
}

function getDefaultChain(pool: Pool | undefined): Chain {
  return (pool?.chain as Chain | undefined) ?? DEFAULT_TRANSFER_CHAIN;
}

function getSupportedChain(
  pool: Pool | undefined,
  transferChain: Chain
): Chain {
  return getChainOptions(pool).includes(transferChain)
    ? transferChain
    : getDefaultChain(pool);
}

function getChainOptions(pool: Pool | undefined): Chain[] {
  if (pool?.chain === "ICP" || !CK_TARGET_ASSETS.has(pool?.asset ?? "")) {
    return [getDefaultChain(pool)];
  }

  return [getDefaultChain(pool), Chain.ICP];
}

function formatTransferAssetLabel(
  pool: Pool | undefined,
  transferChain: Chain
): string {
  if (!pool) {
    return transferChain;
  }

  if (transferChain === Chain.ICP && pool.chain !== Chain.ICP) {
    return `ck${pool.asset} on ${transferChain}`;
  }

  const nativeSuffix = getChainOptions(pool).length > 1 ? " (native)" : "";

  return `${pool.asset} on ${transferChain}${nativeSuffix}`;
}

function getLoanTargetOptions(loan: InstantLoan): LoanTargetOptions {
  const initialDeposit = getInitialDepositTargetOptions(loan);
  const repayment = getRepaymentTargetOptions(loan);

  return { initialDeposit, repayment };
}

function getInitialDepositTargetOptions(loan: InstantLoan): LoanTargetOption[] {
  const targetOptions: LoanTargetOption[] = [];

  for (const quote of Object.values(loan.initialDeposit.targets)) {
    if (quote) {
      targetOptions.push({
        label: quote.target.chain,
        loan,
        initialDeposit: quote,
      });
    }
  }

  return targetOptions;
}

function getRepaymentTargetOptions(loan: InstantLoan): LoanTargetOption[] {
  const targetOptions: LoanTargetOption[] = [];

  for (const quote of Object.values(loan.repayment.targets)) {
    if (quote) {
      targetOptions.push({
        label: quote.target.chain,
        loan,
        repayment: quote,
      });
    }
  }

  return targetOptions;
}

function formatInitialDepositTargetOption(
  targetOption: LoanTargetOption,
  collateralPool: Pool
): string {
  if (!targetOption.initialDeposit) {
    throw new Error("Missing initial deposit target option.");
  }

  const initialDeposit = targetOption.initialDeposit;
  const collateralAmount =
    initialDeposit.amount - initialDeposit.inflowFeeAmount;

  return [
    targetOption.label,
    `Amount to send: ${formatAmount(
      initialDeposit.amount,
      collateralPool.decimals
    )} ${collateralPool.asset}`,
    `Credited collateral: ${formatAmount(
      collateralAmount,
      collateralPool.decimals
    )} ${collateralPool.asset}`,
    `Estimated inflow fee: ${formatAmount(
      initialDeposit.inflowFeeAmount,
      collateralPool.decimals
    )} ${collateralPool.asset}`,
    formatSupplyTarget(initialDeposit.target),
  ].join("\n");
}

function formatRepaymentTargetOption(
  targetOption: LoanTargetOption,
  borrowPool: Pool
): string {
  if (!targetOption.repayment) {
    throw new Error("Missing repayment target option.");
  }

  const repayment = targetOption.repayment;
  const repaymentSummary = targetOption.loan.repayment;

  return [
    targetOption.label,
    `Amount to repay: ${formatAmount(repayment.amount, borrowPool.decimals)} ${repaymentSummary.asset}`,
    `Current debt: ${formatAmount(repaymentSummary.debtAmount, borrowPool.decimals)} ${repaymentSummary.asset}`,
    `Interest buffer: ${formatAmount(
      repaymentSummary.interestBufferAmount,
      borrowPool.decimals
    )} ${repaymentSummary.asset}`,
    `Estimated inflow fee: ${formatAmount(
      repayment.inflowFeeAmount,
      borrowPool.decimals
    )} ${repaymentSummary.asset}${repayment.inflowFeeEstimateAvailable ? "" : " (estimate unavailable)"}`,
    formatSupplyTarget(repayment.target),
  ].join("\n");
}

function formatDestinationInputLabel(
  prefix: string,
  pool: Pool | undefined,
  transferChain: Chain
): string {
  if (pool?.chain === "ICP") {
    return `${prefix} ICRC account`;
  }

  return transferChain === Chain.ICP
    ? `${prefix} IC principal`
    : `${prefix} address`;
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
