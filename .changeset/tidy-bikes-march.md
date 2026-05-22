---
"@liquidium/client": patch
---

Fix browser runtime compatibility for canister calls by migrating the SDK actor stack from deprecated `@dfinity/*` packages to `@icp-sdk/core` submodules, removing the need for browser consumers to provide a Node-style `global` polyfill.
