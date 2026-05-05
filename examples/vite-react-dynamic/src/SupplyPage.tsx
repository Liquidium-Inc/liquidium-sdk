import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import type {
  Pool,
  SupplyAction,
  SupplyFlow,
  SupplyInstruction,
  SupplyPlanType,
  WalletAdapter,
} from "@liquidium/client";
import { useEffect, useMemo, useState } from "react";
import { ExampleWalletSection } from "./ExampleWalletSection";
import type { SharedExampleState } from "./example-state";
import {
  getLiquidiumAccountAddress,
  getWalletChainLabel,
} from "./example-wallet";
import { getAssetDecimals, isStablecoinAsset } from "./lib/assets";
import { createLiquidiumClient } from "./lib/client";
import {
  bigintJsonReplacer,
  formatLiquidiumError,
  parseDecimalToBaseUnits,
} from "./lib/format";
import {
  isBtcPool,
  isEthStablecoinPool,
  isSupportedSupplyPool,
} from "./lib/pools";
import { createOrResolveProfile } from "./lib/profile";
import {
  getWalletSignatureChain,
  sendBitcoinTransaction,
  sendEthereumTransaction,
  signWalletMessage,
} from "./wallet-signing";

const DEFAULT_SUPPLY_ACTION: SupplyAction = "deposit";
const DEFAULT_SUPPLY_AMOUNT = "10";
const DEFAULT_SUPPLY_MECHANISM: SupplyPlanType = "transfer";

export function SupplyPage({
  profileId,
  setProfileId,
  pools,
  setPools,
  setPrices,
}: SharedExampleState) {
  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut, primaryWallet, setShowAuthFlow } = useDynamicContext();

  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Connect a wallet to start."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSupplyPoolId, setSelectedSupplyPoolId] = useState("");
  const [supplyAction, setSupplyAction] = useState<SupplyAction>(
    DEFAULT_SUPPLY_ACTION
  );
  const [supplyMechanism, setSupplyMechanism] = useState<SupplyPlanType>(
    DEFAULT_SUPPLY_MECHANISM
  );
  const [supplyAmountInput, setSupplyAmountInput] = useState(
    DEFAULT_SUPPLY_AMOUNT
  );
  const [supplyFlow, setSupplyFlow] = useState<SupplyFlow | null>(null);

  const walletAddress = primaryWallet?.address ?? "";
  const liquidiumAccountAddress =
    getLiquidiumAccountAddress(primaryWallet) ?? "";
  const walletChain = getWalletChainLabel(primaryWallet);
  const supportedSupplyPools = useMemo(
    () => pools.filter(isSupportedSupplyPool),
    [pools]
  );
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
  const canChooseSupplyMechanism = selectedSupplyPool
    ? isEthStablecoinPool(selectedSupplyPool)
    : false;
  const selectedSupplyMechanism = canChooseSupplyMechanism
    ? supplyMechanism
    : DEFAULT_SUPPLY_MECHANISM;
  const resolvedMechanismLabel = selectedSupplyPool
    ? formatSupplyMechanismLabel(selectedSupplyPool, selectedSupplyMechanism)
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

  useEffect(() => {
    if (selectedSupplyPool && !isEthStablecoinPool(selectedSupplyPool)) {
      setSupplyMechanism(DEFAULT_SUPPLY_MECHANISM);
    }
  }, [selectedSupplyPool]);

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

  async function handleDisconnect() {
    setProfileId(null);
    await handleLogOut();
  }

  async function handleLoadMarkets() {
    await runAction(async () => {
      setStatusMessage("Loading pools and prices...");

      const client = createLiquidiumClient();
      const [nextPools, nextPrices] = await Promise.all([
        client.market.listPools(),
        client.market.getAssetPrices(),
      ]);

      setPools(nextPools);
      setPrices(nextPrices);
      setStatusMessage(`Loaded ${nextPools.length} pools and live prices.`);
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
        selectedSupplyMechanism === "contractInteraction" &&
        selectedSupplyPool.chain === "ETH" &&
        (!primaryWallet || !isEthereumWallet(primaryWallet))
      ) {
        throw new Error(
          "Connect an Ethereum wallet to run the contract-interaction supply flow."
        );
      }

      if (
        selectedSupplyMechanism === "contractInteraction" &&
        !liquidiumAccountAddress
      ) {
        throw new Error(
          "Resolve an Ethereum account before running contract interaction."
        );
      }

      const walletAdapter = buildSupplyWalletAdapter({
        primaryWallet,
        selectedSupplyPool,
      });

      setStatusMessage(
        `Starting ${selectedSupplyPool.asset} ${supplyAction} flow...`
      );

      const client = createLiquidiumClient();
      const nextSupplyFlow =
        selectedSupplyMechanism === "contractInteraction"
          ? await client.lending.supply({
              profileId,
              poolId: selectedSupplyPool.id,
              action: supplyAction,
              amount: supplyAmount,
              account: liquidiumAccountAddress,
              walletAdapter: expectEthSupplyWalletAdapter(walletAdapter),
              mechanism: "contractInteraction",
            })
          : await client.lending.supply({
              profileId,
              poolId: selectedSupplyPool.id,
              action: supplyAction,
              amount: supplyAmount,
              account: liquidiumAccountAddress || undefined,
              walletAdapter,
              mechanism: "transfer",
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
        Unified supply example that lets the SDK auto-resolve the deposit
        address transfer target from the selected pool.
      </p>

      <ExampleWalletSection
        isLoggedIn={isLoggedIn}
        isBusy={isBusy}
        canCreateProfile={Boolean(primaryWallet && liquidiumAccountAddress)}
        onConnect={() => setShowAuthFlow(true)}
        onDisconnect={() => void handleDisconnect()}
        onLoadMarkets={() => void handleLoadMarkets()}
        onCreateProfile={() => void handleCreateProfile()}
        details={[
          { label: "Workflow stage", value: workflowStageLabel },
          { label: "Connected chain", value: walletChain ?? "Not connected" },
          { label: "Wallet address", value: walletAddress || "Not connected" },
          {
            label: "SDK account address",
            value: liquidiumAccountAddress || "Not connected",
          },
          { label: "Profile ID", value: profileId ?? "Not created yet" },
          { label: "Pools loaded", value: pools.length },
          {
            label: "Supported supply pools",
            value: supportedSupplyPools.length,
          },
          { label: "Resolved mechanism", value: resolvedMechanismLabel },
        ]}
      />

      <section className="section">
        <h2>Supply</h2>
        <p>
          Pick a supported pool and call the same{" "}
          <code>client.lending.supply()</code> flow for BTC and ETH stablecoin
          supply targets.
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
            Supply method
            <select
              disabled={!canChooseSupplyMechanism}
              value={selectedSupplyMechanism}
              onChange={(event) =>
                setSupplyMechanism(event.target.value as SupplyPlanType)
              }
            >
              <option value="transfer">Deposit address transfer</option>
              <option value="contractInteraction">Contract interaction</option>
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

type BuildSupplyWalletAdapterParams = {
  primaryWallet: ReturnType<typeof useDynamicContext>["primaryWallet"];
  selectedSupplyPool: Pool;
};

/**
 * Builds the smallest possible WalletAdapter for the selected supply pool.
 * Only wires `sendBtcTransaction` for BTC pools and `sendEthTransaction` for
 * ETH pools so the SDK auto-broadcast path uses the correct signer.
 */
function buildSupplyWalletAdapter(
  params: BuildSupplyWalletAdapterParams
): WalletAdapter | undefined {
  const { primaryWallet, selectedSupplyPool } = params;

  if (!primaryWallet) {
    return undefined;
  }

  if (isBitcoinWallet(primaryWallet) && isBtcPool(selectedSupplyPool)) {
    const bitcoinWallet = primaryWallet;
    return {
      sendBtcTransaction: async ({ toAddress, amountSats }) =>
        await sendBitcoinTransaction(bitcoinWallet, {
          toAddress,
          amountSats: amountSats ?? 0n,
        }),
    };
  }

  if (
    isEthereumWallet(primaryWallet) &&
    isEthStablecoinPool(selectedSupplyPool)
  ) {
    const ethereumWallet = primaryWallet;
    return {
      sendEthTransaction: async ({ transaction }) =>
        await sendEthereumTransaction(ethereumWallet, transaction),
    };
  }

  return undefined;
}

function expectEthSupplyWalletAdapter(
  walletAdapter: WalletAdapter | undefined
): Pick<WalletAdapter, "sendEthTransaction"> {
  if (!walletAdapter?.sendEthTransaction) {
    throw new Error("Connect an Ethereum wallet to run contract interaction.");
  }

  return walletAdapter;
}

function isNativeAddressSupplyInstruction(
  supplyInstruction: SupplyInstruction | null
): supplyInstruction is SupplyInstruction & {
  target: { type: "nativeAddress"; address: string };
} {
  if (!supplyInstruction) {
    return false;
  }

  return supplyInstruction.target.type === "nativeAddress";
}

function formatSupplyMechanismLabel(
  pool: Pool,
  supplyMechanism: SupplyPlanType
): string {
  if (isBtcPool(pool)) {
    return "Transfer";
  }

  if (pool.chain === "ETH" && isStablecoinAsset(pool.asset)) {
    return supplyMechanism === "contractInteraction"
      ? "Contract interaction"
      : "Deposit address transfer";
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
