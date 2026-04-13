import { useEffect, useState } from "react";
import App from "./App";
import { SdkMethodQueryPage } from "./SdkMethodQueryPage";

type ExamplePageId = "workflow" | "sdk-methods";

const DEFAULT_PAGE_ID: ExamplePageId = "workflow";
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
          href={`${HASH_PREFIX}workflow`}
          className={activePageId === "workflow" ? "is-active" : undefined}
        >
          Workflow Example
        </a>
        <a
          href={`${HASH_PREFIX}sdk-methods`}
          className={activePageId === "sdk-methods" ? "is-active" : undefined}
        >
          SDK Method Query
        </a>
      </header>

      {activePageId === "workflow" ? <App /> : <SdkMethodQueryPage />}
    </div>
  );
}

function getPageIdFromHash(hash: string): ExamplePageId {
  const normalizedHash = hash.trim().toLowerCase();

  if (normalizedHash === "#/sdk-methods") {
    return "sdk-methods";
  }

  return DEFAULT_PAGE_ID;
}
