import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const REPOSITORY_URL = "https://github.com/Liquidium-Inc/liquidium-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(__dirname, "..");

const clientChangelogPath = "packages/client/CHANGELOG.md";
const docsChangelogPath = "docs/changelog.mdx";

const clientChangelog = readFileSync(
  join(repositoryRoot, clientChangelogPath),
  "utf8"
);

const clientReleaseNotes = demoteHeadings(removeFirstHeading(clientChangelog));

const docsChangelog = `---
title: Changelog
slug: changelog
description: Track released SDK package changes.
order: 500
---

# Changelog

Released changes for \`@liquidium/client\`. This page is generated from [\`${clientChangelogPath}\`](${REPOSITORY_URL}/blob/main/${clientChangelogPath}).

## @liquidium/client

${clientReleaseNotes}

## Package Changelogs

| Package | Changelog |
| --- | --- |
| \`@liquidium/client\` | [\`${clientChangelogPath}\`](${REPOSITORY_URL}/blob/main/${clientChangelogPath}) |

When a public SDK change affects usage, update the relevant guide or API reference in the same pull request.
`;

writeFileSync(join(repositoryRoot, docsChangelogPath), docsChangelog);

function removeFirstHeading(markdown) {
  return markdown.replace(/^# .+\n+/, "").trim();
}

function demoteHeadings(markdown) {
  return markdown.replace(/^(#{1,5}) /gm, "#$1 ");
}
