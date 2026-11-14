# Dependency overrides

- `@typescript-eslint/typescript-estree` uses `minimatch` 11.0.1 to fix
  [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
  Parser tests cover project-service allowlist matching and rejection.
- `postcss-selector-parser` versions below 6.1.5 use the patched 6.x release to fix
  [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
  This keeps Tailwind 3 and its typography plugin on their existing parser API.

Remove each override when its parent dependencies require a patched version.
