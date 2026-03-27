import { isBitcoinWallet } from "@dynamic-labs/bitcoin";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import {
  DynamicWidget,
  useDynamicContext,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { useState } from "react";
import {
  bigintJsonReplacer,
  createOrResolveProfileId,
  DEFAULT_SUPPLY_ACTION,
  findBtcPool,
  formatLiquidiumError,
  isNativeAddressSupplyInstruction,
  loadPoolsAndDefaultSelection,
  type Pool,
  prepareBtcSupplyInstruction,
  type SupplyAction,
  type SupplyInstruction,
} from "./liquidium-client-sdk";
import RawRequestsPage from "./RawRequestsPage";

type DynamicPrimaryWallet = NonNullable<
  ReturnType<typeof useDynamicContext>["primaryWallet"]
>;

export default function App() {
  const isLoggedIn = useIsLoggedIn();
  const { handleLogOut, primaryWallet, setShowAuthFlow } = useDynamicContext();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [supplyAction, setSupplyAction] = useState<SupplyAction>(
    DEFAULT_SUPPLY_ACTION
  );
  const [supplyInstruction, setSupplyInstruction] =
    useState<SupplyInstruction | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Connect a wallet to start."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePage, setActivePage] = useState<"guided" | "raw-requests">(
    "guided"
  );

  const connectedWalletAddress = primaryWallet?.address ?? "";
  const liquidiumAccountAddress =
    getLiquidiumAccountAddress(primaryWallet) ?? "";
  const walletChain = getWalletChainLabel(primaryWallet);
  const btcPool = findBtcPool(pools);

  async function handleCreateOrResolveAccount() {
    console.log("[dynamic-example] create/resolve clicked", {
      hasPrimaryWallet: Boolean(primaryWallet),
      connectedWalletAddress,
      liquidiumAccountAddress,
    });

    if (!primaryWallet || !liquidiumAccountAddress) {
      setErrorMessage("Connect an Ethereum or Bitcoin wallet first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const signatureChain = getWalletSignatureChain(primaryWallet);
      console.log("[dynamic-example] using signature chain", {
        signatureChain,
        liquidiumAccountAddress,
      });

      const profileResult = await createOrResolveProfileId({
        walletAddress: liquidiumAccountAddress,
        chain: signatureChain,
        signMessage: (message) =>
          signWalletMessage(primaryWallet, message, liquidiumAccountAddress),
        onStep: (nextStatusMessage) => {
          setStatusMessage(nextStatusMessage);
        },
      });

      setProfileId(profileResult.profileId);
      setStatusMessage(
        profileResult.wasCreated
          ? `Created Liquidium profile ${profileResult.profileId}.`
          : `Wallet already has Liquidium profile ${profileResult.profileId}.`
      );

      console.log("[dynamic-example] create/resolve completed", profileResult);
    } catch (error) {
      console.error("[dynamic-example] create/resolve failed", error);
      setErrorMessage(formatLiquidiumError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLoadPools() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { pools: nextPools, selectedPoolId: nextSelectedPoolId } =
        await loadPoolsAndDefaultSelection();

      setPools(nextPools);
      setSelectedPoolId(nextSelectedPoolId);
      setStatusMessage(`Loaded ${nextPools.length} pools.`);
    } catch (error) {
      setErrorMessage(formatLiquidiumError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePrepareBtcSupply() {
    if (!profileId) {
      setErrorMessage("Create or resolve a Liquidium profile first.");
      return;
    }

    if (!selectedPoolId) {
      setErrorMessage("Load pools and choose a pool first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nextSupplyInstruction = await prepareBtcSupplyInstruction({
        profileId,
        poolId: selectedPoolId,
        action: supplyAction,
      });

      setSupplyInstruction(nextSupplyInstruction);
      setStatusMessage(
        `Prepared BTC ${supplyAction} target for ${selectedPoolId}.`
      );
    } catch (error) {
      setErrorMessage(formatLiquidiumError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopyAddress() {
    if (!isNativeAddressSupplyInstruction(supplyInstruction)) {
      return;
    }

    await navigator.clipboard.writeText(supplyInstruction.target.address);
    setStatusMessage("Copied the BTC deposit address.");
  }

  function handleTryBitcoinUri() {
    if (!isNativeAddressSupplyInstruction(supplyInstruction)) {
      return;
    }

    window.open(
      `bitcoin:${supplyInstruction.target.address}`,
      "_blank",
      "noopener,noreferrer"
    );
    setStatusMessage("Opened a bitcoin URI with the returned address.");
  }

  return (
    <main className="example-page">
      <header className="example-header">
        <p className="eyebrow">Liquidium SDK basic example</p>
        <h1>Vite + Dynamic + @liquidium/client</h1>
        <p className="subtitle">
          This page keeps Dynamic limited to wallet connection and signing. The
          main goal is to show the SDK flow clearly.
        </p>
        <div className="button-row">
          <button
            className={activePage === "guided" ? "active-page-button" : ""}
            onClick={() => setActivePage("guided")}
            type="button"
          >
            Guided flow page
          </button>
          <button
            className={
              activePage === "raw-requests" ? "active-page-button" : ""
            }
            onClick={() => setActivePage("raw-requests")}
            type="button"
          >
            Raw SDK requests page
          </button>
        </div>
      </header>

      {activePage === "guided" ? (
        <>
          <section className="example-card">
            <h2>1. Connect a wallet</h2>
            <p>
              Use Dynamic to connect an Ethereum or Bitcoin wallet. The SDK
              examples below will use the connected wallet address and message
              signature.
            </p>
            <div className="button-row">
              {isLoggedIn ? (
                <button onClick={() => void handleLogOut()} type="button">
                  Log out
                </button>
              ) : (
                <button onClick={() => setShowAuthFlow(true)} type="button">
                  Connect wallet
                </button>
              )}
              <DynamicWidget variant="modal" />
            </div>
            <dl className="details-list">
              <div>
                <dt>Connected chain</dt>
                <dd>{walletChain ?? "None"}</dd>
              </div>
              <div>
                <dt>Wallet address</dt>
                <dd>{connectedWalletAddress || "Not connected"}</dd>
              </div>
              <div>
                <dt>SDK account address</dt>
                <dd>{liquidiumAccountAddress || "Not connected"}</dd>
              </div>
            </dl>
          </section>

          <section className="example-card">
            <h2>2. Create or resolve a Liquidium account</h2>
            <p>
              This uses `client.accounts.create(...)`. If the wallet already has
              a profile, the example resolves the existing profile instead.
            </p>
            <button
              disabled={isLoading || !primaryWallet || !liquidiumAccountAddress}
              onClick={() => void handleCreateOrResolveAccount()}
              type="button"
            >
              Create or resolve profile
            </button>
            <dl className="details-list">
              <div>
                <dt>Profile ID</dt>
                <dd>{profileId ?? "Not created yet"}</dd>
              </div>
            </dl>
          </section>

          <section className="example-card">
            <h2>3. Query pools and pick the BTC pool</h2>
            <p>
              This uses `client.market.getPools()` and stores the BTC pool if it
              is available.
            </p>
            <div className="button-row">
              <button
                disabled={isLoading}
                onClick={() => void handleLoadPools()}
                type="button"
              >
                Load pools
              </button>
              <select
                disabled={pools.length === 0}
                value={selectedPoolId}
                onChange={(event) => setSelectedPoolId(event.target.value)}
              >
                <option value="">Choose a pool</option>
                {pools.map((pool) => (
                  <option key={pool.id} value={pool.id}>
                    {pool.asset} on {pool.chain}
                  </option>
                ))}
              </select>
            </div>
            <p className="inline-note">
              BTC pool:{" "}
              {btcPool ? btcPool.id : "Load pools to see if BTC is available."}
            </p>
          </section>

          <section className="example-card">
            <h2>4. Get the BTC deposit address</h2>
            <p>
              This uses `client.lending.supply(...)` with the selected pool as
              the source of truth and asks for a native BTC address target.
            </p>
            <div className="button-row">
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
                disabled={isLoading || !profileId || !selectedPoolId}
                onClick={() => void handlePrepareBtcSupply()}
                type="button"
              >
                Prepare BTC supply
              </button>
            </div>
            <pre className="code-block">
              {supplyInstruction
                ? JSON.stringify(supplyInstruction, bigintJsonReplacer, 2)
                : "No supply instruction yet."}
            </pre>
            <div className="button-row">
              <button
                disabled={!isNativeAddressSupplyInstruction(supplyInstruction)}
                onClick={() => void handleCopyAddress()}
                type="button"
              >
                Copy BTC address
              </button>
              <button
                disabled={!isNativeAddressSupplyInstruction(supplyInstruction)}
                onClick={handleTryBitcoinUri}
                type="button"
              >
                Try send via bitcoin URI
              </button>
            </div>
          </section>

          <section className="example-card">
            <h2>Status</h2>
            <p>{statusMessage}</p>
            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          </section>
        </>
      ) : (
        <RawRequestsPage
          defaultAccountAddress={liquidiumAccountAddress}
          defaultWalletAddress={connectedWalletAddress}
        />
      )}
    </main>
  );
}

export function MissingEnvironmentScreen() {
  return (
    <main className="example-page">
      <section className="example-card">
        <h1>Set up Dynamic first</h1>
        <p>
          Copy `.env.example` to `.env` and set `VITE_DYNAMIC_ENVIRONMENT_ID`.
        </p>
      </section>
    </main>
  );
}

async function signWalletMessage(
  primaryWallet: DynamicPrimaryWallet,
  message: string,
  liquidiumAccountAddress: string
): Promise<string> {
  console.log("[dynamic-example] requesting wallet signature", {
    messageLength: message.length,
  });

  if (isEthereumWallet(primaryWallet)) {
    console.log("[dynamic-example] signing message with ethereum wallet");
    const rawSignature = await primaryWallet.signMessage(message);

    if (!rawSignature) {
      throw new Error("Ethereum wallet did not return a signature.");
    }

    const normalizedSignature = normalizeEthereumSignature(rawSignature);

    console.log("[dynamic-example] ethereum signature received", {
      rawSignatureLength: rawSignature.length,
      normalizedSignatureLength: normalizedSignature.length,
      wasNormalized: normalizedSignature !== rawSignature,
    });

    return normalizedSignature;
  }

  if (isBitcoinWallet(primaryWallet)) {
    const paymentAddress = getBitcoinPaymentAddress(primaryWallet);
    const isUsingPaymentAddress =
      Boolean(paymentAddress) && paymentAddress === liquidiumAccountAddress;

    console.log("[dynamic-example] signing message with bitcoin wallet");

    const rawSignature = await primaryWallet.signMessage(message, {
      addressType: isUsingPaymentAddress ? "payment" : "ordinals",
      protocol: "ecdsa",
    });

    if (!rawSignature) {
      throw new Error("Bitcoin wallet did not return a signature.");
    }

    const normalizedSignature = normalizeBitcoinSignature(rawSignature);

    console.log("[dynamic-example] bitcoin signature received", {
      rawSignatureLength: rawSignature.length,
      normalizedSignatureLength: normalizedSignature.length,
      wasNormalized: normalizedSignature !== rawSignature,
      usedAddressType: isUsingPaymentAddress ? "payment" : "ordinals",
      protocol: "ecdsa",
    });

    return normalizedSignature;
  }

  throw new Error("Connected wallet is not supported by this example.");
}

function getWalletSignatureChain(
  primaryWallet: DynamicPrimaryWallet
): "ETH" | "BTC" {
  if (isEthereumWallet(primaryWallet)) {
    return "ETH";
  }

  if (isBitcoinWallet(primaryWallet)) {
    return "BTC";
  }

  throw new Error("Connected wallet is not supported by this example.");
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

function getBitcoinPaymentAddress(
  primaryWallet: DynamicPrimaryWallet
): string | null {
  const paymentAddress = primaryWallet.additionalAddresses?.find(
    (additionalAddress) => additionalAddress.type === "payment"
  )?.address;

  return paymentAddress ?? null;
}

function normalizeBitcoinSignature(signature: string): string {
  if (isHexSignature(signature)) {
    return strip0xPrefix(signature);
  }

  try {
    const binary = atob(signature);
    let hexSignature = "";

    for (let index = 0; index < binary.length; index += 1) {
      const byteAsHex = binary.charCodeAt(index).toString(16).padStart(2, "0");
      hexSignature += byteAsHex;
    }

    return hexSignature;
  } catch {
    return strip0xPrefix(signature);
  }
}

function normalizeEthereumSignature(signature: string): string {
  return strip0xPrefix(signature);
}

function strip0xPrefix(signature: string): string {
  return signature.startsWith("0x") ? signature.slice(2) : signature;
}

function isHexSignature(signature: string): boolean {
  const normalizedSignature = signature.startsWith("0x")
    ? signature.slice(2)
    : signature;

  return /^[0-9a-fA-F]+$/.test(normalizedSignature);
}
