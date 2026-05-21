import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const DEFAULT_DYNAMIC_ENVIRONMENT_ID = "9fd02365-83bf-414c-b824-4fce21da896d";
const dynamicEnvironmentId =
  import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID ?? DEFAULT_DYNAMIC_ENVIRONMENT_ID;
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find root element.");
}

const root = ReactDOM.createRoot(rootElement);

void import("./bootstrap")
  .then(({ mountApp }) => {
    mountApp({ root, dynamicEnvironmentId });
  })
  .catch((error: unknown) => {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown startup error while loading the app.";

    root.render(
      <React.StrictMode>
        <StartupErrorScreen message={message} />
      </React.StrictMode>
    );
  });

function StartupErrorScreen({ message }: { message: string }) {
  return (
    <main>
      <section>
        <h1>App failed to load</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
