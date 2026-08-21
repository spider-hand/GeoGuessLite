# client

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

Install workspace dependencies from the repository root:

```sh
pnpm install
```

Run the remaining commands from `client/`.

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Browser Tests with [Vitest](https://vitest.dev/)

```sh
# Install Chromium for the first run
pnpm exec playwright install chromium

# Run browser tests
pnpm test:browser -- --run

# Run browser tests with coverage
pnpm test:browser:coverage
```

### Run [Storybook](https://storybook.js.org/)

```sh
# Start the component explorer
pnpm storybook

# Build the static Storybook site
pnpm build-storybook
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint

pnpm format:check
```

## Generate API client with [OpenAPI generator](https://openapi-generator.tech)

Run

```sh
pnpm generate:api
```
