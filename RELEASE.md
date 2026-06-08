# Release Flow

Use this flow for `@liquidium/client` releases. npm publishing is manual.

## Prepare

1. Add changesets in PRs that change public SDK behavior:

```sh
pnpm changeset
```

2. For missed changesets, add one catch-up changeset for changes since the last release tag.
3. Create the release version, package changelog, and docs changelog:

```sh
pnpm release:version
```

4. Check for a generated docs changelog change. The Changesets commit can happen before `docs/changelog.mdx` is regenerated, so fold that file into the same release-prep commit if it is dirty:

```sh
git status --short
git add docs/changelog.mdx
git commit --amend --no-edit
```

5. Use one release-prep commit in the release PR, with a title like `chore(client): prepare 0.2.1 release`.
6. Review and merge the release PR.

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
git push origin @liquidium/client@0.2.1
```

Pushing the tag creates the GitHub Release from `packages/client/CHANGELOG.md`.
