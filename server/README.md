# Server

## Setup

### Prerequisites

- [Node.js](https://nodejs.org)
- [pnpm](https://pnpm.io/installation)
- [Python 3.14](https://www.python.org/downloads/)
- [uv](https://docs.astral.sh/uv/getting-started/installation/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-iam)

This doc assumes that you already configured IAM Identity Center authentication. Please follow [this instructions](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).

Verify available profiles:

```sh
cat ~/.aws/config
```

Expected output:
```sh
[profile my-profile] 
sso_session = my-sso 
sso_account_id = 123456789012 
sso_role_name = AdministratorAccess
region = ap-northeast-1
```

Login using AWS SSO:

```sh
aws sso login --profile <your-profile>
```

Set the profile for the current shell:

```sh
export AWS_PROFILE=<your-profile>
```

Verify authentication:

```sh
aws sts get-caller-identity
```

Expected output:

```sh
{
  "Account": "...",
  "Arn": "...",
  "UserId": "..."
}
```

Install dependencies:

```sh
uv sync
```

```sh
pnpm install
```

Start development environment:

```sh
pnpm dev
```

Run unit tests:

```sh
uv run pytest
```

Run Linter:

```sh
uv run ruff check .
```

```sh
uv run ruff check . --fix
```

##### Manage database migrations:

Set the connection string for the current shell:

```sh
export DATABASE_URL='postgresql://...'
```

Apply pending migrations:

```sh
pnpm db:migrate
```

Create a new migration:

```sh
pnpm db:new <migration_name>
```

Rollback the latest migration:

```sh
pnpm db:rollback
```

Check migration status:

```sh
pnpm db:status
```

##### Manage resources:

List deployed stages:

```sh
pnpm state:list
```

Show deployed resources for `dev`:

```sh
pnpm state:dev
```

Show deployed resources for `prod`:

```sh
pnpm state:prod
```

Remove deployed `dev` resources:

```sh
pnpm remove:dev
```

Remove deployed `prod` resources:

```sh
pnpm remove:prod
```
