import type { AssetPrices, InstantLoan, Pool } from "@liquidium/client";
import { Chain } from "@liquidium/client";
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
  getInstantLoan,
  type InstantLoanDestinationType,
  loadMarketData,
} from "./sdk-example";

const PRICE_DISPLAY_DECIMALS = 8;
const DEFAULT_COLLATERAL_ASSET = "BTC";
const DEFAULT_BORROW_ASSET = "USDC";
const DEFAULT_TRANSFER_CHAIN: Chain = Chain.ETH;
const DEFAULT_DESTINATION_TYPE: InstantLoanDestinationType = "ChainAddress";
const CK_TARGET_ASSETS = new Set(["BTC", "USDC", "USDT"]);
const CHAIN_ADDRESS_DESTINATION_TYPES: InstantLoanDestinationType[] = [
  "ChainAddress",
];
const CK_DESTINATION_TYPES: InstantLoanDestinationType[] = ["IcPrincipal"];
const ICP_DESTINATION_TYPES: InstantLoanDestinationType[] = [
  "IcrcAccount",
  "IcpAccountIdentifier",
  "IcPrincipal",
];

type LoanTargetOptions = {
  initialDeposit: LoanTargetOption[];
  repayment: LoanTargetOption[];
};

type LoanTargetOption = {
  label: string;
  loan: InstantLoan;
};

export function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [assetPrices, setAssetPrices] = useState<AssetPrices>({});
  const [selectedCollateralPoolId, setSelectedCollateralPoolId] = useState("");
  const [selectedBorrowPoolId, setSelectedBorrowPoolId] = useState("");
  const [collateralAmount, setCollateralAmount] = useState("0.0002");
  const [borrowAmount, setBorrowAmount] = useState("9");
  const [borrowChain, setBorrowChain] = useState<Chain>(DEFAULT_TRANSFER_CHAIN);
  const [refundChain, setRefundChain] = useState<Chain>(DEFAULT_TRANSFER_CHAIN);
  const [borrowDestinationType, setBorrowDestinationType] =
    useState<InstantLoanDestinationType>(DEFAULT_DESTINATION_TYPE);
  const [maxLtv, setMaxLtv] = useState("30");
  const [depositWindowSeconds, setDepositWindowSeconds] = useState("3600");
  const [borrowDestination, setBorrowDestination] = useState("");
  const [refundDestinationType, setRefundDestinationType] =
    useState<InstantLoanDestinationType>(DEFAULT_DESTINATION_TYPE);
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
        setBorrowChain,
        setRefundChain,
        setBorrowDestinationType,
        setRefundDestinationType,
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
      setBorrowChain,
      setRefundChain,
      setBorrowDestinationType,
      setRefundDestinationType,
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
      borrowChain,
      borrowDestinationAddress: trimmedBorrowDestination,
      borrowDestinationType,
      refundChain,
      refundDestinationAddress: trimmedRefundDestination,
      refundDestinationType,
    });
    const loanTargetOptions = await getLoanTargetOptions({
      loan,
      collateralPool,
      borrowPool,
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

    setSelectedDestinationChain({
      pool,
      transferChain: DEFAULT_TRANSFER_CHAIN,
      setChain: setRefundChain,
      setDestinationType: setRefundDestinationType,
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
      setDestinationType: setBorrowDestinationType,
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
              {pool.asset} on {pool.chain}
            </option>
          ))}
        </select>

        <label htmlFor="borrow-pool-select">Borrow pool</label>
        <select
          id="borrow-pool-select"
          value={selectedBorrowPoolId}
          onChange={(event) => handleBorrowPoolChange(event.target.value)}
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

        <label htmlFor="borrow-transfer-mode-select">
          Borrow delivery mode
        </label>
        <select
          id="borrow-transfer-mode-select"
          value={borrowChain}
          onChange={(event) =>
            setSelectedDestinationChain({
              pool: pools.find((pool) => pool.id === selectedBorrowPoolId),
              transferChain: event.target.value as Chain,
              setChain: setBorrowChain,
              setDestinationType: setBorrowDestinationType,
              setDestination: setBorrowDestination,
            })
          }
        >
          {getChainOptions(
            pools.find((pool) => pool.id === selectedBorrowPoolId)
          ).map((transferChain) => (
            <option key={transferChain} value={transferChain}>
              {formatOutflowChain(
                pools.find((pool) => pool.id === selectedBorrowPoolId),
                transferChain
              )}
            </option>
          ))}
        </select>
        {shouldShowDestinationTypeSelect(
          pools.find((pool) => pool.id === selectedBorrowPoolId),
          borrowChain
        ) ? (
          <>
            <label htmlFor="borrow-destination-type-select">
              Borrow destination type
            </label>
            <select
              id="borrow-destination-type-select"
              value={borrowDestinationType}
              onChange={(event) =>
                setBorrowDestinationType(
                  event.target.value as InstantLoanDestinationType
                )
              }
            >
              {getDestinationTypeOptions(
                pools.find((pool) => pool.id === selectedBorrowPoolId),
                borrowChain
              ).map((destinationType) => (
                <option key={destinationType} value={destinationType}>
                  {formatDestinationType(destinationType)}
                </option>
              ))}
            </select>
          </>
        ) : null}
        <p>
          Choose ck mode to send borrowed ck assets to an IC principal. Native
          mode uses the chain address, except ICP where you can choose the ICP
          destination format.
        </p>
        <label htmlFor="borrow-destination-input">
          Borrow destination address
        </label>
        <input
          id="borrow-destination-input"
          value={borrowDestination}
          onChange={(event) => setBorrowDestination(event.target.value)}
        />

        <label htmlFor="refund-transfer-mode-select">
          Refund/withdrawal delivery mode
        </label>
        <select
          id="refund-transfer-mode-select"
          value={refundChain}
          onChange={(event) =>
            setSelectedDestinationChain({
              pool: pools.find((pool) => pool.id === selectedCollateralPoolId),
              transferChain: event.target.value as Chain,
              setChain: setRefundChain,
              setDestinationType: setRefundDestinationType,
              setDestination: setRefundDestination,
            })
          }
        >
          {getChainOptions(
            pools.find((pool) => pool.id === selectedCollateralPoolId)
          ).map((transferChain) => (
            <option key={transferChain} value={transferChain}>
              {formatOutflowChain(
                pools.find((pool) => pool.id === selectedCollateralPoolId),
                transferChain
              )}
            </option>
          ))}
        </select>
        {shouldShowDestinationTypeSelect(
          pools.find((pool) => pool.id === selectedCollateralPoolId),
          refundChain
        ) ? (
          <>
            <label htmlFor="refund-destination-type-select">
              Refund/withdrawal destination type
            </label>
            <select
              id="refund-destination-type-select"
              value={refundDestinationType}
              onChange={(event) =>
                setRefundDestinationType(
                  event.target.value as InstantLoanDestinationType
                )
              }
            >
              {getDestinationTypeOptions(
                pools.find((pool) => pool.id === selectedCollateralPoolId),
                refundChain
              ).map((destinationType) => (
                <option key={destinationType} value={destinationType}>
                  {formatDestinationType(destinationType)}
                </option>
              ))}
            </select>
          </>
        ) : null}
        <p>
          Refunds and full collateral withdrawals use this delivery mode. ICP
          pools also let you choose the native destination format.
        </p>
        <label htmlFor="refund-destination-input">
          Refund/withdrawal destination address
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
  setBorrowChain(transferChain: Chain): void;
  setRefundChain(transferChain: Chain): void;
  setBorrowDestinationType(destinationType: InstantLoanDestinationType): void;
  setRefundDestinationType(destinationType: InstantLoanDestinationType): void;
}): void {
  const collateralChain = getDefaultChain(params.collateralPool);
  const borrowChain = getDefaultChain(params.borrowPool);

  params.setBorrowChain(borrowChain);
  params.setRefundChain(collateralChain);
  params.setBorrowDestinationType(
    getDefaultDestinationType(params.borrowPool, borrowChain)
  );
  params.setRefundDestinationType(
    getDefaultDestinationType(params.collateralPool, collateralChain)
  );
}

function setSelectedDestinationChain(params: {
  pool: Pool | undefined;
  transferChain: Chain;
  setChain(transferChain: Chain): void;
  setDestinationType(destinationType: InstantLoanDestinationType): void;
  setDestination(destination: string): void;
}): void {
  const transferChain = getSupportedChain(params.pool, params.transferChain);

  params.setChain(transferChain);
  params.setDestinationType(
    getDefaultDestinationType(params.pool, transferChain)
  );
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

async function getLoanTargetOptions(params: {
  loan: InstantLoan;
  collateralPool: Pool;
  borrowPool: Pool;
}): Promise<LoanTargetOptions> {
  const initialDeposit = await getInitialDepositTargetOptions(params);
  const repayment = await getRepaymentTargetOptions(params);

  return { initialDeposit, repayment };
}

async function getInitialDepositTargetOptions(params: {
  loan: InstantLoan;
  collateralPool: Pool;
}): Promise<LoanTargetOption[]> {
  const targetOptions = [
    {
      label: formatInflowChain(
        params.collateralPool,
        getDefaultChain(params.collateralPool)
      ),
      loan: params.loan,
    },
  ];

  if (!getChainOptions(params.collateralPool).includes(Chain.ICP)) {
    return targetOptions;
  }

  const ckTargetLoan = await getInstantLoan({
    loanId: params.loan.loanId,
    initialDepositChain: Chain.ICP,
  });

  return [
    ...targetOptions,
    {
      label: formatInflowChain(params.collateralPool, Chain.ICP),
      loan: ckTargetLoan,
    },
  ];
}

async function getRepaymentTargetOptions(params: {
  loan: InstantLoan;
  borrowPool: Pool;
}): Promise<LoanTargetOption[]> {
  const targetOptions = [
    {
      label: formatInflowChain(
        params.borrowPool,
        getDefaultChain(params.borrowPool)
      ),
      loan: params.loan,
    },
  ];

  if (!getChainOptions(params.borrowPool).includes(Chain.ICP)) {
    return targetOptions;
  }

  const ckTargetLoan = await getInstantLoan({
    loanId: params.loan.loanId,
    repaymentChain: Chain.ICP,
  });

  return [
    ...targetOptions,
    {
      label: formatInflowChain(params.borrowPool, Chain.ICP),
      loan: ckTargetLoan,
    },
  ];
}

function formatInitialDepositTargetOption(
  targetOption: LoanTargetOption,
  collateralPool: Pool
): string {
  const initialDeposit = targetOption.loan.initialDeposit;

  return [
    targetOption.label,
    `Amount to send: ${formatAmount(
      initialDeposit.amount,
      collateralPool.decimals
    )} ${initialDeposit.asset}`,
    `Credited collateral: ${formatAmount(
      initialDeposit.collateralAmount,
      collateralPool.decimals
    )} ${initialDeposit.asset}`,
    `Estimated inflow fee: ${formatAmount(
      initialDeposit.inflowFeeAmount,
      collateralPool.decimals
    )} ${initialDeposit.asset}`,
    formatSupplyTarget(initialDeposit.target),
  ].join("\n");
}

function formatRepaymentTargetOption(
  targetOption: LoanTargetOption,
  borrowPool: Pool
): string {
  const repayment = targetOption.loan.repayment;

  return [
    targetOption.label,
    `Amount to repay: ${formatAmount(repayment.amount, borrowPool.decimals)} ${repayment.asset}`,
    `Current debt: ${formatAmount(repayment.debtAmount, borrowPool.decimals)} ${repayment.asset}`,
    `Interest buffer: ${formatAmount(
      repayment.interestBufferAmount,
      borrowPool.decimals
    )} ${repayment.asset}`,
    `Estimated inflow fee: ${formatAmount(
      repayment.inflowFeeAmount,
      borrowPool.decimals
    )} ${repayment.asset}${repayment.inflowFeeEstimateAvailable ? "" : " (estimate unavailable)"}`,
    formatSupplyTarget(repayment.target),
  ].join("\n");
}

function getDefaultDestinationType(
  pool: Pool | undefined,
  transferChain: Chain
): InstantLoanDestinationType {
  if (pool?.chain === "ICP") {
    return "IcrcAccount";
  }

  return transferChain === Chain.ICP ? "IcPrincipal" : "ChainAddress";
}

function getDestinationTypeOptions(
  pool: Pool | undefined,
  transferChain: Chain
): InstantLoanDestinationType[] {
  if (pool?.chain === "ICP") {
    return ICP_DESTINATION_TYPES;
  }

  return transferChain === Chain.ICP
    ? CK_DESTINATION_TYPES
    : CHAIN_ADDRESS_DESTINATION_TYPES;
}

function shouldShowDestinationTypeSelect(
  pool: Pool | undefined,
  transferChain: Chain
): boolean {
  return getDestinationTypeOptions(pool, transferChain).length > 1;
}

function formatInflowChain(
  pool: Pool | undefined,
  transferChain: Chain
): string {
  if (pool?.chain === "ICP") {
    return "Native ICP ledger account";
  }

  return transferChain === Chain.ICP
    ? `Direct ck${pool?.asset ?? "asset"} / ICRC ledger account`
    : `Native ${pool?.chain ?? "chain"} ingress address`;
}

function formatOutflowChain(
  pool: Pool | undefined,
  transferChain: Chain
): string {
  if (pool?.chain === "ICP") {
    return "Native ICP ledger destination";
  }

  return transferChain === Chain.ICP
    ? `ck${pool?.asset ?? "asset"} to IC principal`
    : `Native ${pool?.chain ?? "chain"} address`;
}

function formatDestinationType(
  destinationType: InstantLoanDestinationType
): string {
  switch (destinationType) {
    case "ChainAddress":
      return "Chain-native address";
    case "IcPrincipal":
      return "IC principal";
    case "IcpAccountIdentifier":
      return "ICP account identifier";
    case "IcrcAccount":
      return "ICRC account";
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
