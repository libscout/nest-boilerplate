# For project rules and conventions see:

[`rules.md`](./rules.md)

# Project Boilerplate

This project was created for demonstration purposes as an example/boilerplate project.

It is intended to showcase:

- project structure
- architectural conventions
- testing approach
- logging setup
- module boundaries
- general backend engineering practices

# Logging

The application uses structured logging.

In local development, logs are printed in a pretty, human-readable format to make debugging easier.

In cloud and production environments, logs are printed as plain JSON. This makes them easy to collect, search, and process by log systems such as CloudWatch, Loki, OpenSearch, Datadog, or Kubernetes log collectors.

Each log entry contains the service name, request context, optional user context, and the actual log message body.

```ts
interface LogEntry {
  timestamp: string; // ISO
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  service: string; // service name

  requestID?: string;
  userID?: string;

  body: unknown[];

  err?: {
    message: string;
    stack?: string;
  };
}
```

# Usage

## Install Dependencies

```bash
npm install
```

---

## Start Development Server

```bash
npm run start:dev
```

---

## Run Tests

```bash
npm run test
```

---

## Database Migrations

Generate migration:

```bash
npm run migration:generate --name=create-users-table
```

Create empty migration:

```bash
npm run migration:create --name=create-users-table
```

Run migrations:

```bash
npm run migration:run
```

Revert last migration:

```bash
npm run migration:revert
```

Show migration status:

```bash
npm run migration:show
```

---

## Environment Variables

Create `.env` file in the project root.

Example:

```env
NODE_ENV=development

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=app

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Project Rules

See:

[`./rules.md`](./rules.md)
