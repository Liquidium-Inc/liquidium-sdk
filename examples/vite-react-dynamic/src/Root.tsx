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

      {activePageId === "borrow" ? <App /> : null}
      {activePageId === "supply" ? <SupplyPage /> : null}
      {activePageId === "sdk-methods" ? <SdkMethodQueryPage /> : null}
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
