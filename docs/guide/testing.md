# Testing and contributing

## Local setup

```sh
npm ci
npm run test:run
npm run coverage
npm run test:e2e
npm run docs:check
```

## Check scope

| Command | Checks |
| --- | --- |
| `npm run test:run` | Unit and compatibility regression tests |
| `npm run coverage` | Entry and all core source files, with 100% per-file thresholds for all four metrics |
| `npm run test:e2e` | Build, pack, temporary installation, ESM/CJS consumers, NodeNext/Bundler declarations and UMD in an isolated JS context |
| `npm run check` | Coverage and package E2E |
| `npm run docs:check` | Build the library, check bilingual page parity and TypeScript examples, then build docs |
| `npm run docs:build` | Bilingual static build and dead-link checking |

Coverage does not prove every possible input combination. Package tests install the generated tarball offline using `--legacy-peer-deps`; they verify the artifact, not automatic peer dependency installation.

## Real browser regression

Run these commands, then open `http://localhost:1980/test/e2e/browser.html`:

```sh
npm run build
npm run dev
```

The page runs the same scenarios for ESM and UMD: onion order, Map/Set isolation, active stack snapshots, subsequent use() and duplicate next(). Both results should show PASS and the root element’s `data-status` should be `passed`. This browser check runs separately from the Node package test.

## Documentation development and deployment

```sh
npm run docs:dev
npm run docs:build
npm run docs:preview
```

Build output is in `docs/.vitepress/dist`. Set the base through an environment variable when deploying under a subpath, and preview using the same base:

```sh
DOCS_BASE=/vmo-onion/ npm run docs:build
DOCS_BASE=/vmo-onion/ npm run docs:preview
```

Keep English and Chinese page structures aligned. Update both languages for new features, behavior changes and examples. Run tests and the documentation build before submitting changes, and preserve public API compatibility. `prepack` builds the core library before packaging; documentation is not included in the npm package.

See the [official VitePress internationalization guide](https://vuejs.github.io/vitepress/v1/guide/i18n) for configuration details.

The documentation browser scenario is in `test/e2e/docs-browser.js` and can be loaded by the connected Playwright tool. It checks all 16 pages, language switching, bilingual search, mobile overflow and browser errors. It runs separately from `docs:check`.
