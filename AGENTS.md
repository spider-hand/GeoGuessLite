# GeoGuessLite

## Directory Structure

Key paths are below.

### Frontend

- `client/` - Vue application for the web client
  - `src/components/` - Components; subdirectories are organized by layouts and pages, except for `shared/`
    - `shared/` - Components used across pages and layouts
  - `src/composables/` - Shared reactive logic and server-state management with TanStack Query
  - `src/locales/` - Translations; the structure mirrors `client/src/`
  - `src/pages/` - Page components
  - `src/services/` - Auto-generated API client from OpenAPI Generator
  - `src/stories/` - Storybook stories; the subdirectory structure mirrors `client/src/`
  - `src/tests/` - Test setup and unit tests; unit-test subdirectories mirror `client/src/`

### Backend

- `server/` - Backend application using AWS Lambda + SST
  - `db/` - Database migration files
  - `openapi/` - OpenAPI specification
  - `src/` - Files included in the build artifact
    - `api/` - API handlers; the subdirectory structure mirrors the endpoint structure
    - `core/` - Shared infrastructure and cross-cutting concerns such as logging, authentication, configuration, and utilities
    - `data/` - Static application data bundled with Lambda
    - `features/` - Feature-oriented business modules such as repositories, services, models, and domain logic
    - `jobs/` - Scheduled functions

## Coding Guidelines

### Frontend

#### Components

- Always create unit-test and Storybook story files when creating a new component
- Always make Vue props required whenever possible, and avoid default values unless they are genuinely necessary
- Always use `@lucide/vue` for icons
- Always use arrow functions unless there is a specific reason to avoid them
- Always use the `@` alias instead of relative paths for imports within `client/src/`

#### Unit Tests

- Always use `it("should ...")` for test cases
- Write test descriptions in terms of externally observable behavior or outcomes, not implementation details
- Include one default-state test when it helps establish the baseline render; name it `should render the default state properly`
- Do not test behavior that is neither user-visible nor exposed as a public outcome, such as an emitted event, navigation, or child props owned by the current unit
- Do not assert child-component internals from parent or page tests unless the parent is explicitly responsible for that output
- Always use `it.each(...)` when multiple meaningful inputs exercise the same behavior
- Before adding a new test case, inspect existing tests and avoid adding another case when the same behavior is already protected
- Do not add redundant cases that exercise the same behavior with equivalent inputs

#### Stories

- Always write one story per meaningful branch

#### Composables and API Access

- Always use a composable for server communication instead of calling `fetch` directly
- If the composable does not manage API response state, name it `use{ApiName}Api.ts`, for example `useHealthApi.ts`
- If the composable manages API response state, name it `use{ApiName}Query.ts`, for example `useUserQuery.ts`
- Do not manually modify files under `client/src/services/`

#### Localization

- Always update locale entries for all supported languages whenever user-facing text in `client/src/` is added, changed, or removed
- Locale keys must live under and be referenced from the component or page that renders the text, even if identical wording exists elsewhere

#### Validation

- Always run `pnpm lint`, `pnpm format:check`, `pnpm test:browser -- --run`, `pnpm build`, and `pnpm type-check`
- Resolve all errors before finishing work

### Backend

#### API and OpenAPI

- Always keep API handlers, OpenAPI specifications, and SST infrastructure definitions in sync
- Keep OpenAPI component schema files in `server/openapi/components/schemas/` scoped to REST operations
- Request and response schema filenames must start with the operation verb they serve, such as `get-`, `create-`, `update-`, or `delete-`
- Avoid generic domain-noun schema filenames unless the schema is intentionally shared
- `error-response.yml` is the exception for shared error responses
- Always run `pnpm generate:api` at `apps/web/` after updating API endpoints or OpenAPI specifications under `server/openapi/`

#### Database Migrations

- Always create a new migration file when modifying the database schema
- Name migration files as `{YYYYMMDDHHMMSS}_{title}.sql`
- Migration filenames must include the local 24-hour time down to seconds; date-only names are invalid
- Every migration file must contain both `-- migrate:up` and `-- migrate:down` sections

#### Unit Tests

- Create one test case for each distinct observable behavior or terminal outcome rather than every possible combination of conditions
- Name test cases after the behavior they verify, such as `test_create_user_raises_conflict_when_email_already_exists` and avoid vague names
- Cover boundary values when behavior changes at the boundary
- Do not add arbitrary nearby values that exercise the same behavior
- Use `pytest.mark.parametrize` when multiple meaningful inputs exercise the same behavior or branch
- Before adding a new test case, inspect existing tests and avoid adding another case when the same behavior is already protected
- Do not test implementation details that can change without affecting observable behavior

#### Validation

- Always run `uv run ruff check .` and `uv run pytest`
- Resolve all errors before finishing work

## Development Commands

### Frontend

Execute the following commands from `client/`:

- `pnpm lint` - Run the linter
- `pnpm lint:fix` - Automatically fix lint issues
- `pnpm format` - Automatically fix formatting issues
- `pnpm format:check` - Check formatting
- `pnpm test:browser` - Run browser tests
- `pnpm build` - Type-check and build the application
- `pnpm type-check` - Run type checking
- `pnpm storybook` - Start Storybook
- `pnpm build-storybook` - Build the static Storybook site

### Backend

Execute the following commands from `server/`:

- `uv run ruff check .` - Run the linter
- `uv run ruff check . --fix` - Automatically fix lint issues
- `uv run pytest` - Run unit tests
- `pnpm db:migrate` - Apply pending migrations
- `pnpm db:new <migration_name>` - Create a new migration
- `pnpm db:rollback` - Roll back the latest migration
- `pnpm db:status` - Check migration status
