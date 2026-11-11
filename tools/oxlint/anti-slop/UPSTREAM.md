# Anti-slop source

- Source: https://github.com/dmmulroy/anti-slop
- Commit: `13909c9e07590f5a85d93c62712259fe14a883f7`
- Source path: `skills/install-anti-slop/assets/anti-slop/`
- Installed path: `tools/oxlint/anti-slop/`
- Local deviation: `rules/no-module-mocking.ts` also recognizes `vi` imports
  from `vite-plus/test`, including renamed imports. This provenance file was added.

All 38 copied files were checked against the Git blob hashes at the source
commit. This includes the nested ESLint Stylistic license and provenance.
The pristine snapshot is retained in SDK commit
`b206131f6b9509bbfa625cc64024bbcf715f0215` for future updates.

Oxlint and `@oxlint/plugins` are pinned to `1.91.0`, the version used by
Vite+ `1.5.0`. The root `vite.config.ts` enables every generic anti-slop rule
at error severity. The Effect plugin is not enabled because no workspace
declares Effect as a direct dependency.

The application lint and formatter exclude the copied plugin. The CLI tests
in `scripts/_internal/anti-slop.test.ts` check the installed entry point.
