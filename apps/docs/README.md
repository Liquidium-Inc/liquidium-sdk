# Liquidium SDK documentation app

This app uses Docusaurus to render the SDK documentation from `docs/`.

From the SDK root, start the development server:

```bash
pnpm --filter docs dev
```

From the SDK root, build the documentation site:

```bash
pnpm --filter docs build
```

The `docs/` directory contains the source, so code, the generated API reference, and documentation can change in the same pull request.
