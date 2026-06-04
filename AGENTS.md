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
