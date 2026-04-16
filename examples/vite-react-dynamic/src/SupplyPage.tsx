import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useEffect, useMemo, useState } from "react";
import { ExampleWalletSection } from "./ExampleWalletSection";
import {
  getLiquidiumAccountAddress,
  getWalletChainLabel,
} from "./example-wallet";
import {
  bigintJsonReplacer,
  createOrResolveProfileIdSimple,
  formatLiquidiumError,
  isNativeAddressSupplyInstruction,
  isStablecoinAsset,
  loadQuoteContext,
  type Pool,
  prepareSupplyFlow,
  type SupplyAction,
  type SupplyFlow,
} from "./liquidium-client-sdk";
import {
  getWalletSignatureChain,
  sendBitcoinTransaction,
  sendEthereumTransaction,
  signWalletMessage,
} from "./wallet-signing";

const DEFAULT_SUPPLY_ACTION: SupplyAction = "deposit";
const DEFAULT_SUPPLY_AMOUNT = "10";
const ASSET_DECIMALS: Record<string, number> = {
  BTC: 8,
  USDC: 6,
  USDT: 6,
};

export function SupplyPage() {
  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut, primaryWallet, setShowAuthFlow } = useDynamicContext();

  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Connect a wallet to start."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedSupplyPoolId, setSelectedSupplyPoolId] = useState("");
  const [supplyAction, setSupplyAction] = useState<SupplyAction>(
    DEFAULT_SUPPLY_ACTION
  );
  const [supplyAmountInput, setSupplyAmountInput] = useState(
    DEFAULT_SUPPLY_AMOUNT
  );
  const [supplyFlow, setSupplyFlow] = useState<SupplyFlow | null>(null);

  const walletAddress = primaryWallet?.address ?? "";
  const liquidiumAccountAddress =
    getLiquidiumAccountAddress(primaryWallet) ?? "";
  const walletChain = getWalletChainLabel(primaryWallet);
  const supportedSupplyPools = useMemo(() => {
    return pools.filter(isSupportedSupplyPool);
  }, [pools]);
  const selectedSupplyPool = useMemo(() => {
    return (
      supportedSupplyPools.find((pool) => pool.id === selectedSupplyPoolId) ??
      supportedSupplyPools[0] ??
      null
    );
  }, [selectedSupplyPoolId, supportedSupplyPools]);
  const supplyAmount = parseDecimalToBaseUnits(
    supplyAmountInput,
    getAssetDecimals(selectedSupplyPool?.asset ?? "BTC")
  );
  const resolvedMechanismLabel = selectedSupplyPool
    ? formatSupplyMechanismLabel(selectedSupplyPool)
    : "Load markets to resolve a supported pool.";
  const workflowStageLabel = profileId
    ? selectedSupplyPool
      ? "Execution ready"
      : "Load market data"
    : "Set up account";

  useEffect(() => {
    if (supportedSupplyPools.length === 0) {
      setSelectedSupplyPoolId("");
      return;
    }

    setSelectedSupplyPoolId((currentSelectedSupplyPoolId) => {
      if (
        currentSelectedSupplyPoolId &&
        supportedSupplyPools.some(
          (pool) => pool.id === currentSelectedSupplyPoolId
        )
      ) {
        return currentSelectedSupplyPoolId;
      }

      return supportedSupplyPools[0]?.id ?? "";
    });
  }, [supportedSupplyPools]);

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
      setStatusMessage("Loading pools...");

      const nextQuoteContext = await loadQuoteContext();

      setPools(nextQuoteContext.pools);
      setStatusMessage(
        `Loaded ${nextQuoteContext.pools.length} pools for the supply page.`
      );
    });
  }

  async function handleStartSupplyFlow() {
    await runAction(async () => {
      if (!profileId) {
        throw new Error("Create or resolve a Liquidium profile first.");
      }

      if (!selectedSupplyPool) {
        throw new Error(
          "Load markets and choose a supported supply pool first."
        );
      }

      if (!supplyAmount || supplyAmount <= 0n) {
        throw new Error(
          `Enter a valid ${selectedSupplyPool.asset} amount to ${supplyAction}.`
        );
      }

      if (
        selectedSupplyPool.chain === "ETH" &&
        (!primaryWallet || !isEthereumWallet(primaryWallet))
      ) {
        throw new Error(
          "Connect an Ethereum wallet to run the contract-interaction supply flow."
        );
      }

      let sendBtcTransactionCallback:
        | ((params: {
            toAddress: string;
            amountSats: bigint;
          }) => Promise<string>)
        | undefined;
      let sendEthTransactionCallback:
        | ((params: {
            to: string;
            data?: string;
            value?: string;
          }) => Promise<string>)
        | undefined;

      if (
        primaryWallet &&
        isBitcoinWallet(primaryWallet) &&
        selectedSupplyPool.asset === "BTC" &&
        selectedSupplyPool.chain === "BTC"
      ) {
        const bitcoinWallet = primaryWallet;
        sendBtcTransactionCallback = async ({ toAddress, amountSats }) =>
          await sendBitcoinTransaction(bitcoinWallet, {
            toAddress,
            amountSats,
          });
      }

      if (
        primaryWallet &&
        isEthereumWallet(primaryWallet) &&
        selectedSupplyPool.chain === "ETH"
      ) {
        const ethereumWallet = primaryWallet;
        sendEthTransactionCallback = async (transaction) =>
          await sendEthereumTransaction(ethereumWallet, transaction);
      }

      setStatusMessage(
        `Starting ${selectedSupplyPool.asset} ${supplyAction} flow...`
      );

      const nextSupplyFlow = await prepareSupplyFlow({
        profileId,
        pool: selectedSupplyPool,
        action: supplyAction,
        amount: supplyAmount,
        account: liquidiumAccountAddress || undefined,
        sendBtcTransaction: sendBtcTransactionCallback,
        sendEthTransaction: sendEthTransactionCallback,
      });

      setSupplyFlow(nextSupplyFlow);
      setStatusMessage(createSupplyFlowStatusMessage(nextSupplyFlow));
    });
  }

  async function handleCopyTargetAddress() {
    const supplyInstruction = supplyFlow?.instruction ?? null;

    if (!isNativeAddressSupplyInstruction(supplyInstruction)) {
      return;
    }

    await navigator.clipboard.writeText(supplyInstruction.target.address);
    setStatusMessage("Copied the supply target address.");
  }

  function handleOpenBitcoinUri() {
    const supplyInstruction = supplyFlow?.instruction ?? null;

    if (
      !isNativeAddressSupplyInstruction(supplyInstruction) ||
      supplyInstruction.chain !== "BTC"
    ) {
      return;
    }

    window.open(
      `bitcoin:${supplyInstruction.target.address}`,
      "_blank",
      "noopener,noreferrer"
    );
    setStatusMessage("Opened a bitcoin URI.");
  }

  return (
    <main className="app">
      <h1>Liquidium SDK supply example</h1>
      <p>
        Unified supply example that lets the SDK auto-resolve the transfer or
        contract-interaction path from the selected pool.
      </p>

      <ExampleWalletSection
        isLoggedIn={isLoggedIn}
        isBusy={isBusy}
        canCreateProfile={Boolean(primaryWallet && liquidiumAccountAddress)}
        onConnect={() => setShowAuthFlow(true)}
        onDisconnect={() => void handleLogOut()}
        onLoadMarkets={() => void handleLoadQuoteContext()}
        onCreateProfile={() => void handleCreateProfile()}
        details={[
          {
            label: "Workflow stage",
            value: workflowStageLabel,
          },
          {
            label: "Connected chain",
            value: walletChain ?? "Not connected",
          },
          {
            label: "Wallet address",
            value: walletAddress || "Not connected",
          },
          {
            label: "SDK account address",
            value: liquidiumAccountAddress || "Not connected",
          },
          {
            label: "Profile ID",
            value: profileId ?? "Not created yet",
          },
          {
            label: "Pools loaded",
            value: pools.length,
          },
          {
            label: "Supported supply pools",
            value: supportedSupplyPools.length,
          },
          {
            label: "Resolved mechanism",
            value: resolvedMechanismLabel,
          },
        ]}
      />

      <section className="section">
        <h2>Supply</h2>
        <p>
          Pick a supported pool and call the same{" "}
          <code>client.lending.supply()</code> flow regardless of the underlying
          mechanism.
        </p>
        <div className="field-grid">
          <label>
            Pool
            <select
              disabled={supportedSupplyPools.length === 0}
              value={selectedSupplyPoolId}
              onChange={(event) => setSelectedSupplyPoolId(event.target.value)}
            >
              <option value="">Choose a supported supply pool</option>
              {supportedSupplyPools.map((pool) => (
                <option key={pool.id} value={pool.id}>
                  {pool.asset} on {pool.chain}
                </option>
              ))}
            </select>
          </label>

          <label>
            Inflow action
            <select
              value={supplyAction}
              onChange={(event) =>
                setSupplyAction(event.target.value as SupplyAction)
              }
            >
              <option value="deposit">Deposit</option>
              <option value="repayment">Repayment</option>
            </select>
          </label>

          <label>
            Amount
            <input
              inputMode="decimal"
              value={supplyAmountInput}
              onChange={(event) => setSupplyAmountInput(event.target.value)}
              placeholder="10"
            />
          </label>
        </div>

        <div className="actions">
          <button
            disabled={
              isBusy ||
              !profileId ||
              !selectedSupplyPool ||
              !supplyAmount ||
              supplyAmount <= 0n
            }
            onClick={() => void handleStartSupplyFlow()}
            type="button"
          >
            start supply flow
          </button>
          <button
            disabled={
              !isNativeAddressSupplyInstruction(supplyFlow?.instruction ?? null)
            }
            onClick={() => void handleCopyTargetAddress()}
            type="button"
          >
            copy target address
          </button>
          <button
            disabled={
              !isNativeAddressSupplyInstruction(
                supplyFlow?.instruction ?? null
              ) || supplyFlow?.instruction.chain !== "BTC"
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
            : "No supply flow yet."}
        </pre>
      </section>

      <section className="section">
        <h2>Status</h2>
        <p>{statusMessage}</p>
        {errorMessage ? <p className="error">{errorMessage}</p> : null}
      </section>
    </main>
  );
}

function getAssetDecimals(asset: string): number {
  return ASSET_DECIMALS[asset] ?? 8;
}

function isSupportedSupplyPool(pool: Pool): boolean {
  return (
    (pool.asset === "BTC" && pool.chain === "BTC") ||
    (pool.chain === "ETH" && isStablecoinAsset(pool.asset))
  );
}

function formatSupplyMechanismLabel(pool: Pool): string {
  if (pool.asset === "BTC" && pool.chain === "BTC") {
    return "Transfer";
  }

  if (pool.chain === "ETH" && isStablecoinAsset(pool.asset)) {
    return "Contract interaction";
  }

  return "Unsupported";
}

function createSupplyFlowStatusMessage(supplyFlow: SupplyFlow): string {
  if (
    supplyFlow.type === "transfer" &&
    supplyFlow.target.type === "nativeAddress"
  ) {
    return `Resolved transfer target ${supplyFlow.target.address}.`;
  }

  return `Started ${supplyFlow.type} supply flow.`;
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
