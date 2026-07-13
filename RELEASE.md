# Release Flow

Use this flow for `@liquidium/client` releases. npm publishing is manual.

## Prepare

1. Add changesets in PRs that change public SDK behavior:

```sh
pnpm changeset
```

2. For missed changesets, add one catch-up changeset for changes since the last release tag.
3. Create the release version, package changelog, and docs changelog. This creates a Changesets commit with the default `RELEASING: Releasing 1 package(s)` title before `docs/changelog.mdx` is regenerated:

```sh
pnpm release:version
```

4. Reword the Changesets commit to the release-prep title. If `docs/changelog.mdx` is dirty, fold it into the same amend. Replace `<version>` with the version from `packages/client/package.json`:

```sh
git status --short
git add docs/changelog.mdx
git commit --amend -m "chore(client): prepare <version> release"
```

5. Use one release-prep commit in the release PR, with a title like `chore(client): prepare <version> release`.
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
git push origin @liquidium/client@<version>
```

Pushing the tag creates the GitHub Release from `packages/client/CHANGELOG.md`.

## Release Candidates

Use Changesets prerelease mode to publish a release candidate without changing
the npm `latest` dist-tag. Users must explicitly install the candidate with
`@liquidium/client@rc` or its exact prerelease version.

### First Candidate

1. Add or confirm the changesets for the release as described in [Prepare](#prepare).
2. Enter prerelease mode:

```sh
pnpm changeset pre enter rc
```

3. Create the prerelease version and changelogs:

```sh
pnpm release:version
```

4. Format the generated prerelease state and fold it and the docs changelog into
   the Changesets commit. Replace `<version>` with the generated version from
   `packages/client/package.json`:

```sh
pnpm exec biome format --write .changeset/pre.json
git add .changeset/pre.json docs/changelog.mdx
git commit --amend -m "chore(client): prepare <version> release"
```

5. Review and merge the release PR, then follow [Publish](#publish). Use
   `pnpm changeset publish`; do not use `npm publish` directly. Changesets uses
   the `rc` dist-tag recorded in `.changeset/pre.json`.
6. Confirm that the RC was published without changing `latest`:

```sh
npm view @liquidium/client dist-tags
```

The result should show the previous stable version under `latest` and the new
candidate under `rc`.

### Additional Candidates

Remain in prerelease mode and add changesets for fixes normally. Then run the
same version, amend, review, merge, and publish flow. Changesets increments the
prerelease number for each candidate.

### Promote To Stable

1. Exit prerelease mode and create the stable version:

```sh
pnpm changeset pre exit
pnpm release:version
```

2. Fold the generated docs changelog into the Changesets commit and reword it
   using the stable version:

```sh
git add docs/changelog.mdx
git commit --amend -m "chore(client): prepare <version> release"
```

3. Review and merge the release PR, then follow [Publish](#publish). The stable
   publish updates the npm `latest` dist-tag.
