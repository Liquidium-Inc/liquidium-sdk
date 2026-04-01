import { LiquidiumClient } from "@liquidium/client";
import { useMemo, useState } from "react";
import { bigintJsonReplacer } from "./liquidium-client-sdk";
import { resolveLiquidiumClientConfig } from "./liquidium-runtime-config";

type RawRequestsPageProps = {
  defaultWalletAddress: string;
  defaultAccountAddress: string;
};

type RequestStatus = {
  methodName: string;
  message: string;
  isError: boolean;
};

const DEFAULT_CHAIN = "BTC" as const;
const DEFAULT_SUPPLY_ACTION = "deposit" as const;
const DEFAULT_SUPPLY_DESTINATION = "nativeAddress" as const;
const DEFAULT_AMOUNT_UNITS = "1000";

export default function RawRequestsPage({
  defaultWalletAddress,
  defaultAccountAddress,
}: RawRequestsPageProps) {
  const client = useMemo(() => {
    return LiquidiumClient.create(resolveLiquidiumClientConfig());
  }, []);

  const [profileId, setProfileId] = useState("");
  const [poolId, setPoolId] = useState("");
  const [walletAddress, setWalletAddress] = useState(defaultWalletAddress);
  const [accountAddress, setAccountAddress] = useState(defaultAccountAddress);
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [cursor, setCursor] = useState("");
  const [chain, setChain] = useState<"BTC" | "ETH">(DEFAULT_CHAIN);
  const [supplyAction, setSupplyAction] = useState<"deposit" | "repayment">(
    DEFAULT_SUPPLY_ACTION
  );
  const [supplyDestination, setSupplyDestination] = useState<
    "nativeAddress" | "icrcAccount"
  >(DEFAULT_SUPPLY_DESTINATION);
  const [amountInput, setAmountInput] = useState(DEFAULT_AMOUNT_UNITS);
  const [bitcoinTxid, setBitcoinTxid] = useState("");
  const [isRequestInFlight, setIsRequestInFlight] = useState(false);
  const [requestStatus, setRequestStatus] = useState<RequestStatus | null>(
    null
  );

  async function runRawRequest<T>(
    methodName: string,
    request: () => Promise<T>
  ) {
    setIsRequestInFlight(true);
    setRequestStatus({
      methodName,
      message: "Running request...",
      isError: false,
    });

    console.log(`[raw-sdk] ${methodName} request started`);

    try {
      const response = await request();

      console.log(`[raw-sdk] ${methodName} raw response`, response);

      setRequestStatus({
        methodName,
        message: formatRawResponse(response),
        isError: false,
      });
    } catch (error) {
      console.error(`[raw-sdk] ${methodName} raw error`, error);

      setRequestStatus({
        methodName,
        message: formatRawError(error),
        isError: true,
      });
    } finally {
      setIsRequestInFlight(false);
    }
  }

  function parseAmountToBigInt(): bigint {
    if (!/^\d+$/.test(amountInput)) {
      throw new Error("Amount must be a non-negative integer string.");
    }

    return BigInt(amountInput);
  }

  return (
    <>
      <section className="example-card">
        <h2>Raw request inputs</h2>
        <p>
          Every button below calls one SDK method directly and logs the raw
          response to the browser console.
        </p>

        <div className="raw-input-grid">
          <label>
            Wallet address
            <input
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value.trim())}
            />
          </label>

          <label>
            Account address
            <input
              value={accountAddress}
              onChange={(event) => setAccountAddress(event.target.value.trim())}
            />
          </label>

          <label>
            Profile ID
            <input
              value={profileId}
              onChange={(event) => setProfileId(event.target.value.trim())}
            />
          </label>

          <label>
            Pool ID
            <input
              value={poolId}
              onChange={(event) => setPoolId(event.target.value.trim())}
            />
          </label>

          <label>
            New wallet address
            <input
              value={newWalletAddress}
              onChange={(event) =>
                setNewWalletAddress(event.target.value.trim())
              }
            />
          </label>

          <label>
            Amount (integer)
            <input
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value.trim())}
            />
          </label>

          <label>
            Bitcoin txid
            <input
              value={bitcoinTxid}
              onChange={(event) => setBitcoinTxid(event.target.value.trim())}
            />
          </label>

          <label>
            Cursor
            <input
              value={cursor}
              onChange={(event) => setCursor(event.target.value.trim())}
            />
          </label>

          <label>
            Chain
            <select
              value={chain}
              onChange={(event) =>
                setChain(event.target.value as "BTC" | "ETH")
              }
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </select>
          </label>

          <label>
            Supply action
            <select
              value={supplyAction}
              onChange={(event) =>
                setSupplyAction(event.target.value as "deposit" | "repayment")
              }
            >
              <option value="deposit">deposit</option>
              <option value="repayment">repayment</option>
            </select>
          </label>

          <label>
            Supply destination
            <select
              value={supplyDestination}
              onChange={(event) =>
                setSupplyDestination(
                  event.target.value as "nativeAddress" | "icrcAccount"
                )
              }
            >
              <option value="nativeAddress">nativeAddress</option>
              <option value="icrcAccount">icrcAccount</option>
            </select>
          </label>
        </div>
      </section>

      <section className="example-card">
        <h2>accounts</h2>
        <div className="raw-request-grid">
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.accounts.create", () =>
                client.accounts.create({ account: accountAddress })
              )
            }
            type="button"
          >
            accounts.create
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.accounts.getProfile", () =>
                client.accounts.getProfile(profileId)
              )
            }
            type="button"
          >
            accounts.getProfile
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.accounts.resolveProfile", () =>
                client.accounts.resolveProfile(walletAddress)
              )
            }
            type="button"
          >
            accounts.resolveProfile
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.accounts.linkWallet", () =>
                client.accounts.linkWallet(profileId, newWalletAddress, chain)
              )
            }
            type="button"
          >
            accounts.linkWallet
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.accounts.unlinkWallet", () =>
                client.accounts.unlinkWallet(profileId, walletAddress)
              )
            }
            type="button"
          >
            accounts.unlinkWallet
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.accounts.getNonce", () =>
                client.accounts.getNonce(walletAddress)
              )
            }
            type="button"
          >
            accounts.getNonce
          </button>
        </div>
      </section>

      <section className="example-card">
        <h2>market</h2>
        <div className="raw-request-grid">
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.market.getPools", () =>
                client.market.getPools()
              )
            }
            type="button"
          >
            market.getPools
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.market.getAssetPrices", () =>
                client.market.getAssetPrices()
              )
            }
            type="button"
          >
            market.getAssetPrices
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.market.getPoolRate", () =>
                client.market.getPoolRate(poolId)
              )
            }
            type="button"
          >
            market.getPoolRate
          </button>
        </div>
      </section>

      <section className="example-card">
        <h2>lending</h2>
        <div className="raw-request-grid">
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.lending.withdraw", () =>
                client.lending.withdraw({
                  profileId,
                  poolId,
                  amount: parseAmountToBigInt(),
                  account: accountAddress,
                })
              )
            }
            type="button"
          >
            lending.withdraw
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.lending.createBorrow", () =>
                client.lending
                  .createBorrow({
                    profileId,
                    poolId,
                    amount: parseAmountToBigInt(),
                    account: accountAddress,
                    signerAccount: walletAddress,
                  })
                  .then((borrowAction) =>
                    borrowAction.submit({
                      signature: "raw-request-example-signature",
                      chain,
                    })
                  )
              )
            }
            type="button"
          >
            lending.createBorrow
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.lending.supply", () =>
                client.lending.supply({
                  profileId,
                  poolId,
                  action: supplyAction,
                  destination: supplyDestination,
                })
              )
            }
            type="button"
          >
            lending.supply
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.lending.getDepositFee", () =>
                client.lending.getDepositFee()
              )
            }
            type="button"
          >
            lending.getDepositFee
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.lending.isBorrowingDisabled", () =>
                client.lending.isBorrowingDisabled()
              )
            }
            type="button"
          >
            lending.isBorrowingDisabled
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.lending.submitInflow", () =>
                client.lending.submitInflow({ txid: bitcoinTxid })
              )
            }
            type="button"
          >
            lending.submitInflow
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.lending.getInflowStatus", () =>
                client.lending.getInflowStatus({
                  profileId,
                  txid: bitcoinTxid || undefined,
                })
              )
            }
            type="button"
          >
            lending.getInflowStatus
          </button>
        </div>
      </section>

      <section className="example-card">
        <h2>positions</h2>
        <div className="raw-request-grid">
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.positions.get", () =>
                client.positions.get(profileId, poolId)
              )
            }
            type="button"
          >
            positions.get
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.positions.list", () =>
                client.positions.list(profileId)
              )
            }
            type="button"
          >
            positions.list
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.positions.getHealthFactor", () =>
                client.positions.getHealthFactor(profileId)
              )
            }
            type="button"
          >
            positions.getHealthFactor
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.positions.getUserStats", () =>
                client.positions.getUserStats(profileId)
              )
            }
            type="button"
          >
            positions.getUserStats
          </button>
        </div>
      </section>

      <section className="example-card">
        <h2>pending</h2>
        <div className="raw-request-grid">
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.pending.getMovements", () =>
                client.pending.getMovements(profileId)
              )
            }
            type="button"
          >
            pending.getMovements
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.pending.getInflows", () =>
                client.pending.getInflows(profileId)
              )
            }
            type="button"
          >
            pending.getInflows
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.pending.getOutflows", () =>
                client.pending.getOutflows(profileId)
              )
            }
            type="button"
          >
            pending.getOutflows
          </button>
        </div>
      </section>

      <section className="example-card">
        <h2>history</h2>
        <div className="raw-request-grid">
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.history.getUser", () =>
                client.history.getUser(profileId, cursor || undefined)
              )
            }
            type="button"
          >
            history.getUser
          </button>
          <button
            disabled={isRequestInFlight}
            onClick={() =>
              void runRawRequest("client.history.getPool", () =>
                client.history.getPool(poolId, cursor || undefined)
              )
            }
            type="button"
          >
            history.getPool
          </button>
        </div>
      </section>

      <section className="example-card">
        <h2>Last request status</h2>
        {requestStatus ? (
          <>
            <p>
              <strong>{requestStatus.methodName}</strong>
            </p>
            <pre
              className={
                requestStatus.isError ? "code-block error-block" : "code-block"
              }
            >
              {requestStatus.message}
            </pre>
          </>
        ) : (
          <p>No request run yet.</p>
        )}
      </section>
    </>
  );
}

function formatRawResponse(response: unknown): string {
  if (response === undefined) {
    return "undefined";
  }

  if (typeof response === "string") {
    return response;
  }

  if (typeof response === "number" || typeof response === "boolean") {
    return String(response);
  }

  try {
    return JSON.stringify(response, bigintJsonReplacer, 2);
  } catch {
    return String(response);
  }
}

function formatRawError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return String(error);
}
