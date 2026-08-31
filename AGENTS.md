# GeoGuessLite

## Directory Structure

Key paths are below:

- `client/` - Vue application for web client
  - `src/components/` - Components; the directory are separated based on layouts and pages, except for `shared/` directory
    - `shared/` - Components used across pages and layouts
  - `src/composables/` - Shared reactive logic and server state management with TanStack Query
  - `src/locales` - Translations; the structure of the entries mirrors `client/src/` (e.g. `components/shared/LanguageSelector/`)
  - `src/pages/` - Page components
  - `src/services/` - Auto-generated API client from OpenAPI Generator
  - `src/stories/` - Stories for Storybook; the subdirectory structure mirrors `client/src/` (e.g. `stories/components/shared/`, `stories/pages/`)
  - `src/tests/` - Test setup and unit tests; unit-test subdirectories mirror `client/src/` (e.g. `unit/components/`, `unit/pages/`)
- `server/` - Backend (AWS Lambda + SST)
  - `db/` - Migration files
  - `openapi/` - OpenAPI spec
  - `src/` - Anything which should be included in the build artifact
    - `api/` - Handler; the subdirectory structure mirrors the endpoint structure (e.g. `api/v1/health/`)
    - `core/` - Shared infrastructure and cross-cutting concerns, such as logging, authentication, configuration and utilities
    - `data/` - Static application data bundled with Lambda
    - `features/` - Feature-oriented business modules, such as repositories, services, models and domain logic
    - `jobs/` - Scheduled functions

## Coding Guidelines

### Frontend

- Always create files for unit tests and stories when creating a new component
- Always write one story per meaningful branch
- Always use `it("should ...")` for test cases
- Always include one default-state test when it helps establish the baseline render; name it `should render the default state properly`
- Do not create test cases for behavior that is neither user-visible nor exposed as a public outcome such as an emitted event, navigation, or child props owned by the current unit
- Do not create test cases for something that doesn't have visible output, except for checking emitted events
- Always use `it.each(...)` for repeated scenarios of the same behavior across multiple meaningful inputs
- Do not assert child component internals from parent or page tests unless the parent is explicitly responsible for that output
- Do not manually modify files under `client/src/services/`
- Always use arrow functions unless there is a specific reason to avoid them
- Always create a composable to manage server state, instead of using `fetch`. If it doesn't have to manage the state of the API response, the file name should be `use{api-name}Api.ts` (e.g. `useHealthApi.ts`). If it manages the state of API responses, the file name should be `use{api-name}Query.ts` (e.g. `useUserQuery.ts`)
- Always use the `@` alias instead of relative paths for imports within `client/src/`
- Always use `@lucide/vue` for icons
- Always update locale entries for all supported languages whenever user-facing text in `client/src/` is added, changed, or removed. Locale keys must live under and be referenced from the component or page that renders that text, even if the same wording exists elsewhere.
- Always make Vue props required whenever possible, and avoid defining default values unless they are truly needed
- Always run `pnpm lint`, `pnpm format:check`, `pnpm test:browser -- --run`, `pnpm build`, and `pnpm type-check` and make sure to resolve all errors before finishing work

### Backend

- Always keep API handlers, OpenAPI spec, and SST infrastructure definitions in sync
- Always keep OpenAPI component schema files in `server/openapi/components/schemas/` scoped to REST operations. Request/response schema filenames must start with the operation verb they serve, such as `get-`, `create-`, `update-`, or `delete-`, instead of generic domain nouns, except for shared `error-response.yml`
- Always create a new migration file when modifying the database schema. Name migration files as `{YYYYMMDDHHMMSS}_{title}.sql`, including the local 24-hour time down to seconds; date-only names are invalid. Every migration file must contain both `-- migrate:up` and `-- migrate:down` sections.
- Always run `pnpm generate:api` at `apps/web/` after updating API endpoint and OpenAPI spec inside `server/openapi/`
- Always run `uv run ruff check .` and `uv run pytest` and make sure to resolve all errors before finishing work

## Development Commands

### Frontend

Execute commands below at `client/`:

- `pnpm lint` - Run linter
- `pnpm lint:fix` - Automatically fix lint issues
- `pnpm format` - Automatically fix format issues
- `pnpm format:check` - Check format issues
- `pnpm test:browser` - Run browser tests
- `pnpm build` - Type-check and build the application
- `pnpm type-check` - Run type check
- `pnpm storybook` - Start Storybook
- `pnpm build-storybook` - Build the static Storybook site

### Backend

Execute commands below at `server/`:

- `uv run ruff check .` - Run linter
- `uv run ruff check . --fix` - Automatically fix lint issues
- `uv run pytest` - Run unit test
- `pnpm db:migrate` - Apply pending migration
- `pnpm db:new <migration_name>` - Create a new migration
- `pnpm db:rollback` - Rollback the latest migration
- `pnpm db:status` - Check migration status
