# @liquidium/client

## 0.1.2

### Patch Changes

- Add SDK documentation links and publish the expanded API export surface.

## 0.1.1

### Patch Changes

- b99b996: Fix browser runtime compatibility for canister calls by migrating the SDK actor stack from deprecated `@dfinity/*` packages to `@icp-sdk/core` submodules, removing the need for browser consumers to provide a Node-style `global` polyfill.
