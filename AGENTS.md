# Liquidium SDK Agent Instructions

## Documentation

When changing public SDK behavior, exported types, method names, request fields, response fields, errors, examples, or runtime configuration:

- Update the relevant files in `docs/` in the same change.
- Update examples in `examples/` when the documented flow depends on runnable code.
- Keep docs direct and specific. Avoid filler, vague claims, and marketing copy.
- Put user-facing tutorials in `docs/getting-started/`.
- Put task steps in `docs/guides/`.
- Put protocol and SDK explanations in `docs/concepts/`.
- Put lookup material in `docs/api-reference/`.
- Put runnable-app notes in `docs/examples/`.

If exported APIs changed, run `pnpm docs:api` to regenerate `docs/api-reference/generated/`.

## TypeScript API Shape

- Prefer named `interface` or `type` declarations over inline object types for public SDK request/response shapes, exported unions, and reusable helper parameter objects.
- Name internal parameter objects when they clarify behavior or appear in method signatures; avoid anonymous `{ ... }` signatures once the shape has multiple fields or could surface in generated docs.
- Keep inline object types only for small, strictly local shapes where naming would add noise.

## Releases

When preparing an `@liquidium/client` release, follow `RELEASE.md`. Keep npm publishing manual unless the user explicitly requests automation.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- Keep the committed knowledge graph in `graphify-out/` in sync when project structure, source relationships, or docs change materially.
- Always run Graphify from the repo root with a relative path: `graphify update . --force`.
- Never run Graphify with an absolute repo path, because that can write local `/Users/...` paths into generated metadata.
- Use `.graphifyignore` for Graphify-only exclusions; it takes priority over `.gitignore` for graph extraction.
- After regenerating, check for local paths before committing: e.g. `rg '/Users/|Development/liquidium-sdk'`.
- Useful query command: `graphify query "what connects auth to the database?"`.
- For docs, papers, or image changes, use `/graphify --update` in the AI assistant if semantic extraction is needed.
- Commit only the allowlisted shared artifacts from `graphify-out/`; keep cache and local runtime files ignored.
