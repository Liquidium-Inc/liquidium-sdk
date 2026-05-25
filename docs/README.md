# Docs Maintenance

These docs use a Diataxis-inspired structure:

| Directory | Purpose |
| --- | --- |
| `getting-started/` | Tutorials for first-time integration |
| `guides/` | Task-oriented integration steps |
| `concepts/` | Explanations of SDK and protocol behavior |
| `examples/` | Pages that point readers to runnable example apps |
| `api-reference/` | Manual and generated API reference |

When changing public SDK behavior, exported types, method names, request fields, response fields, errors, or examples, update the relevant docs in this directory. If exported APIs changed, run `pnpm docs:api` to regenerate `api-reference/generated/`.

## Structure References

| Reference | Use |
| --- | --- |
| https://diataxis.fr/ | Separates tutorials, how-to guides, reference, and explanation |
| https://docusaurus.io/docs/docs-introduction | Models docs as pages, sidebars, versions, and plugin instances |
| https://mintlify.com/docs/navigation | Shows explicit MDX navigation groups for modern developer docs |
| https://nextra.site/docs/docs-theme/start | Shows how to render MDX docs inside a Next.js app |
| https://typedoc.org/documents/Options.Output.html | Documents TypeDoc output options |
| https://www.npmjs.com/package/typedoc-plugin-markdown | Generates Markdown API reference from TypeScript exports |
