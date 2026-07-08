# Liquidium SDK Agent Instructions

## Documentation

When changing public SDK behavior, exported types, method names, request fields, response fields, errors, examples, or runtime configuration:

- Update examples in `examples/` when the documented flow depends on runnable code.
- Keep docs direct and specific. Avoid filler, vague claims, and marketing copy.
- Put user-facing tutorials in `docs/getting-started/`.
- Put task steps in `docs/guides/`.
- Put protocol and SDK explanations in `docs/concepts/`.
- Put lookup material in `docs/api-reference/`.
- Put runnable-app notes in `docs/examples/`.

Do not update `docs/`, generated API reference files, or run `pnpm docs:api` unless the user explicitly asks for docs in the current task. When public API changes need documentation follow-up, mention that in the final response so docs can be handled in a separate PR.

## TypeScript API Shape

- Prefer named `interface` or `type` declarations over inline object types for public SDK request/response shapes, exported unions, and reusable helper parameter objects.
- Name internal parameter objects when they clarify behavior or appear in method signatures; avoid anonymous `{ ... }` signatures once the shape has multiple fields or could surface in generated docs.
- Keep inline object types only for small, strictly local shapes where naming would add noise.
- Avoid string-literal property probes like `"field" in value` for SDK request branching when the type model can express the branch. Prefer explicit discriminants, `never` fields for rejected properties, typed guards, or normalized internal request shapes so TypeScript narrows from the declared types.
- In SDK API mappers, prefer explicit return objects or direct property assignment over shared base objects with conditional spreads. Avoid patterns like `...(condition ? { field } : {})` for public response shapes; they hide fields, leak wire properties easily, and read like generated code.
- When removing a wire field from a public type, construct the public object explicitly instead of spreading the wire object minus exclusions.

## Releases

When preparing an `@liquidium/client` release, follow `RELEASE.md`. Keep npm publishing manual unless the user explicitly requests automation.
