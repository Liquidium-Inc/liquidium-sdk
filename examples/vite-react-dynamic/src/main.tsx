import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

const dynamicEnvironmentId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Could not find root element.");
}

const root = ReactDOM.createRoot(rootElement);

if (!dynamicEnvironmentId) {
  root.render(
    <React.StrictMode>
      <MissingEnvironmentScreen />
    </React.StrictMode>
  );
} else {
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
}

function MissingEnvironmentScreen() {
  return (
    <main className="example-page">
      <section className="example-card">
        <h1>Set up Dynamic first</h1>
        <p>
          Copy <code>.env.example</code> to <code>.env</code> and set
          <code> VITE_DYNAMIC_ENVIRONMENT_ID</code>.
        </p>
      </section>
    </main>
  );
}

function StartupErrorScreen({ message }: { message: string }) {
  return (
    <main className="example-page">
      <section className="example-card">
        <h1>App failed to load</h1>
        <p className="error-text">{message}</p>
      </section>
    </main>
  );
}
