# Liquidium SDK documentation app

This app uses Docusaurus to render the SDK documentation from `docs/`.

From the SDK root, start the development server:

```bash
bun run --filter docs dev
```

From the SDK root, build the documentation site:

```bash
bun run --filter docs build
```

The `docs/` directory contains the documentation source. Update hand-written
documentation with related code changes. Regenerate the TypeDoc API reference
in a documentation pull request unless an implementation pull request
explicitly includes it.
