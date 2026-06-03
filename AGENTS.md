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

## Releases

When preparing an `@liquidium/client` release, follow `RELEASE.md`. Keep npm publishing manual unless the user explicitly requests automation.
