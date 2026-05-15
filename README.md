# For project rules and conventions see:

[`rules.md`](./rules.md)

---

# Project Boilerplate

This project was created for demonstration purposes as an example/boilerplate project.

It is intended to showcase:

- project structure
- architectural conventions
- testing approach
- logging setup
- module boundaries
- general backend engineering practices

## Request Context & Logging

The application keeps request-specific context using `AsyncLocalStorage`.

For every incoming HTTP request, `ContextInterceptor` creates a request context containing:

```ts
{
  requestID: string;
  userID?: string;
}
```

The `requestID` is read from the `x-request-id` header. If the header is missing, a new UUID is generated. The same `requestID` is also added to the response headers as `x-request-id`.

The `userID` is read from the optional `x-user-id` header when the request is performed on behalf of an authenticated user.

`ContextService` stores this context for the lifetime of the request. Any service executed inside the same async request flow can access the current request context without passing `requestID` or `userID` manually through method arguments.

The logger uses this context automatically. Every log written during a request includes the current `requestID`, and includes `userID` when available.

Example log:

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

```json
{
  "level": "info",
  "time": "2026-05-15T10:31:19.000Z",
  "service": "users-service",
  "requestID": "req_123",
  "userID": "user_456",
  "body": ["User created"]
}
```

Logs written outside an HTTP request, for example during application startup or background jobs, are still valid but will not include `requestID` or `userID`.

In local/development environments, logs are printed in a pretty human-readable format. In production/cloud environments, logs are printed as structured JSON.

---

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
