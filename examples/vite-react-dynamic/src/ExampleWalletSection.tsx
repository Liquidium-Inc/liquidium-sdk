type ExampleWalletSectionProps = {
  isLoggedIn: boolean;
  isBusy: boolean;
  canCreateProfile: boolean;
  onConnect(): void;
  onDisconnect(): void;
  onLoadMarkets(): void;
  onCreateProfile(): void;
  details: Array<{
    label: string;
    value: string | number;
  }>;
};

export function ExampleWalletSection(props: ExampleWalletSectionProps) {
  return (
    <section className="section">
      <h2>Wallet</h2>
      <div className="actions">
        {props.isLoggedIn ? (
          <button onClick={props.onDisconnect} type="button">
            disconnect wallet
          </button>
        ) : (
          <button onClick={props.onConnect} type="button">
            connect wallet
          </button>
        )}
        <button
          disabled={props.isBusy}
          onClick={props.onLoadMarkets}
          type="button"
        >
          load markets
        </button>
        <button
          disabled={props.isBusy || !props.canCreateProfile}
          onClick={props.onCreateProfile}
          type="button"
        >
          create profile
        </button>
      </div>
      <dl className="details">
        {props.details.map((detail) => (
          <div key={detail.label}>
            <dt>{detail.label}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
