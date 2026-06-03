# Release Flow

Use this flow for `@liquidium/client` releases. npm publishing is manual.

## Prepare

1. Add changesets in PRs that change public SDK behavior:

```sh
pnpm changeset
```

2. For missed changesets, add one catch-up changeset for changes since the last release tag.
3. Create the release version and changelog:

```sh
pnpm changeset version
```

4. Review and merge the release PR.

## Publish

1. Pull the merged release commit on `main`.
2. Run checks:

```sh
pnpm lint
pnpm build
pnpm typecheck
pnpm test
```

3. Publish manually:

```sh
pnpm changeset publish
```

4. Push the package tag created by Changesets:

```sh
git push origin @liquidium/client@0.2.0
```

Pushing the tag creates the GitHub Release from `packages/client/CHANGELOG.md`.
