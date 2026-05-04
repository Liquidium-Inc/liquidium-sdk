import type { AssetPrices, Pool } from "@liquidium/client";
import { useEffect, useState } from "react";
import App from "./App";
import { SdkMethodQueryPage } from "./SdkMethodQueryPage";
import { SupplyPage } from "./SupplyPage";

type ExamplePageId = "borrow" | "supply" | "sdk-methods";

const DEFAULT_PAGE_ID: ExamplePageId = "borrow";
const HASH_PREFIX = "#/";

export default function Root() {
  const [activePageId, setActivePageId] = useState<ExamplePageId>(() => {
    return getPageIdFromHash(window.location.hash);
  });
  const [profileId, setProfileId] = useState<string | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [prices, setPrices] = useState<AssetPrices>({});

  const sharedExampleState = {
    profileId,
    setProfileId,
    pools,
    setPools,
    prices,
    setPrices,
  };

  useEffect(() => {
    const onHashChange = () => {
      setActivePageId(getPageIdFromHash(window.location.hash));
    };

    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return (
    <div>
      <header className="example-nav">
        <a
          href={`${HASH_PREFIX}borrow`}
          className={activePageId === "borrow" ? "is-active" : undefined}
        >
          Borrow Example
        </a>
        <a
          href={`${HASH_PREFIX}supply`}
          className={activePageId === "supply" ? "is-active" : undefined}
        >
          Supply Example
        </a>
        <a
          href={`${HASH_PREFIX}sdk-methods`}
          className={activePageId === "sdk-methods" ? "is-active" : undefined}
        >
          SDK Method Query
        </a>
      </header>

      {activePageId === "borrow" ? <App {...sharedExampleState} /> : null}
      {activePageId === "supply" ? (
        <SupplyPage {...sharedExampleState} />
      ) : null}
      {activePageId === "sdk-methods" ? (
        <SdkMethodQueryPage {...sharedExampleState} />
      ) : null}
    </div>
  );
}

function getPageIdFromHash(hash: string): ExamplePageId {
  const normalizedHash = hash.trim().toLowerCase();

  if (normalizedHash === "#/sdk-methods") {
    return "sdk-methods";
  }

  if (normalizedHash === "#/workflow") {
    return "borrow";
  }

  if (normalizedHash === "#/evm-contract-supply") {
    return "supply";
  }

  if (normalizedHash === "#/supply") {
    return "supply";
  }

  return DEFAULT_PAGE_ID;
}
