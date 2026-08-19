# Documentation maintenance

These docs use a Diataxis-inspired structure:

| Directory | Purpose |
| --- | --- |
| `getting-started/` | Tutorials for first-time integration |
| `guides/` | Task-oriented integration steps |
| `concepts/` | Explanations of SDK and protocol behavior |
| `examples/` | Pages that point readers to runnable example apps |
| `api-reference/` | Manual and generated API reference |

When you change public SDK behavior, exported types, method names, request fields, response fields, errors, examples, or runtime configuration, update the relevant hand-written documentation in this directory.

Do not run TypeDoc through `pnpm docs:api` or modify `api-reference/generated/` in a feature or fix pull request. Regenerate and commit TypeDoc output in a separate documentation pull request unless the implementation pull request explicitly requires it.

## Writing checklist

Before you submit documentation changes, check the following items:

- Identify the reader and the task or question that the page answers.
- Put prerequisites and warnings before the action that they control.
- Use numbered steps for procedures and bullets for unordered information.
- Introduce each code block, list, and table with a complete sentence.
- Use descriptive uppercase placeholders and explain each placeholder.
- State when an example uses mainnet or can transfer real assets.
- Document public parameters, return values, and thrown errors in source comments.
- Use sentence case for headings and descriptive text for links.

## Documentation references

Use the following references for documentation structure and style:

| Reference | Use |
| --- | --- |
| [Diátaxis documentation framework](https://diataxis.fr/) | Separates tutorials, how-to guides, reference, and explanation |
| [Google developer documentation style guide](https://developers.google.com/style) | Provides guidance for clear and consistent technical writing |
| [Docusaurus documentation introduction](https://docusaurus.io/docs/docs-introduction) | Models documentation as pages, sidebars, versions, and plugin instances |
| [Mintlify navigation documentation](https://mintlify.com/docs/navigation) | Shows explicit MDX navigation groups for developer documentation |
| [Nextra documentation theme](https://nextra.site/docs/docs-theme/start) | Shows how to render MDX documentation in a Next.js app |
| [TypeDoc output options](https://typedoc.org/documents/Options.Output.html) | Documents TypeDoc output options |
| [`typedoc-plugin-markdown` package](https://www.npmjs.com/package/typedoc-plugin-markdown) | Generates Markdown API reference from TypeScript exports |
