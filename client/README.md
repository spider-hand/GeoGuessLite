# Client

## Setup

Install dependencies at the repository root:

```sh
pnpm install
```

Run the remaining commands from `client/`:

Start development server:

```sh
pnpm dev
```

Type-check and build the application:

```sh
pnpm build
```

Run unit tests with [Vitest](https://vitest.dev/guide/browser/):

```sh
# Install Chromium for the first run
pnpm exec playwright install chromium

# Run browser tests
pnpm test:browser -- --run

# Run browser tests with coverage
pnpm test:browser:coverage
```

Run [Storybook](https://storybook.js.org/docs):

```sh
# Start the component explorer
pnpm storybook

# Build the static Storybook site
pnpm build-storybook
```

Lint with [ESLint](https://eslint.org/docs/latest/use/getting-started):

```sh
pnpm lint

pnpm format:check
```

Generate API client with [OpenAPI generator](https://openapi-generator.tech):

```sh
pnpm generate:api
```
