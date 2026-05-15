# Project Structure & Architecture Conventions

## Project Structure

```txt
src
├── tools                         # Infrastructure-level tools
│   ├── config
│   ├── db
│   ├── redis
│   ├── logger
│   └── events
│
├── lib                           # Pure reusable utilities/libraries
│   ├── dates
│   ├── pagination
│   ├── strings
│   └── objects
│
├── external                      # Third-party service integrations
│   ├── stripe
│   ├── aws
│   ├── telegram
│   └── ...
│
├── modules                       # Business domains / bounded contexts
│   └── [domain-name]
│       ├── controllers           # HTTP/API transport layer
│       ├── dto                   # DTOs and validation schemas
│       ├── entities              # Database entities/models
│       ├── services              # Public domain services / module API
│       ├── internal              # Private module implementation
│       └── index.ts              # Public module exports
```

---

# Directory Responsibilities

## `tools/`

Infrastructure-level tools used by the application.

Examples:

- database client
- Redis/cache client
- config loader
- logger
- event bus wrapper

Rules:

- no business logic
- no pure helper functions
- may depend on frameworks, SDKs, or runtime configuration

---

## `lib/`

Pure reusable utilities and small libraries.

Examples:

- date helpers
- string helpers
- pagination helpers
- object/array helpers

Rules:

- no business logic
- no framework-specific code
- no runtime side effects
- should be easy to unit test

---

## `external/`

Third-party service integrations.

Examples:

- Stripe
- AWS SDK wrappers
- Telegram
- SendGrid
- Twilio

Rules:

- isolate third-party SDK usage here
- expose application-friendly APIs
- avoid leaking provider-specific types into business modules

---

## `modules/`

Business domains / bounded contexts.

Rules:

- each module should be self-contained
- business logic belongs here
- modules communicate through public APIs only

---

# Module Structure

Each business module should follow this structure:

```txt
modules/[domain-name]
├── controllers
├── dto
├── entities
├── services
├── internal
└── index.ts
```

## `controllers/`

Transport layer only.

Responsibilities:

- parse requests
- validate input
- call services
- return responses

Rules:

- keep controllers thin
- avoid business logic

---

## `dto/`

Typed contracts and validation.

Contains:

- request DTOs
- response DTOs
- validation schemas
- typed payload definitions

---

## `entities/`

Persistence layer models.

Contains:

- ORM entities
- database table models
- persistence mappings

---

## `services/`

Public module services.

Rules:

- represents the public API of the module
- may be used by other modules
- should contain reusable business use-cases
- keep service classes small and focused
- split large services by business responsibility or use-case

---

## `internal/`

Private module implementation.

Contains:

- internal orchestration logic
- helper services
- implementation details

Rules:

- must not be imported directly from other modules
- must not be re-exported by the module

---

# Public APIs & `index.ts`

Use `index.ts` only in leaf folders such as:

- `services/`
- `dto/`
- `entities/`

Avoid module-level barrel exports.

## Good

```txt
modules/users
├── services
│   ├── user-lookup.service.ts
│   ├── user-registration.service.ts
│   └── index.ts
│
├── dto
│   ├── user-response.dto.ts
│   ├── create-user.dto.ts
│   └── index.ts
│
├── entities
│   ├── user.entity.ts
│   └── index.ts
```

```ts
import { UserLookupService } from '../users/services';
import { UserResponseDto } from '../users/dto';
import { UserEntity } from '../users/entities';
```

## Bad

```txt
modules/users
└── index.ts
```

```ts
import { UserRegistrationService } from '../users/internal/user-registration.service';
```

Do not export anything from `internal/`.

---

# Architectural Guidelines

## General

- Prefer dependency injection over singletons.
- Keep business logic inside `modules/`.
- Avoid framework-specific logic inside core business code.
- Put infrastructure-level abstractions in `tools/`.
- Put pure reusable utilities in `lib/`.
- Put third-party provider integrations in `external/`.

---

## Controllers

- Keep controllers thin.
- Controllers should handle transport concerns only.

---

## Services

- Keep services testable.
- Keep service classes small and focused.
- Split large services by business responsibility or use-case.

Example:

```txt
users/services/
├── user-lookup.service.ts
├── user-registration.service.ts
└── user-password-reset.service.ts
```

---

## Module Boundaries

- Avoid importing internal files from another module.
- Avoid `forwardRef` and circular dependency injection.
- Treat `forwardRef` as a signal that module boundaries should be refactored.
- Prefer extracting shared business behavior into a dedicated module instead of creating cyclic dependencies.

---

# File Naming Conventions

- `*.module.ts` — Nest.js module definition.
  <br><br>
- `*.controller.ts` — controller implementation.
- `*.controller.spec.ts` — controller test suite.
  <br><br>
- `*.service.ts` — service implementation.
- `*.service.spec.ts` — service test suite.
  <br><br>
- `*.dto.ts` — request/response DTOs and validation schemas.
- `*.entity.ts` — database entity/table model.
  <br><br>
- `*.config.ts` — typed configuration factory/section.
- `*.schema.ts` — validation schema.
  <br><br>
- `*.types.ts` — TypeScript type definitions.
- `*.const.ts` — constants.

---

# Testing Conventions

Every service and controller file must have a corresponding test suite in the same directory.

Examples:

```txt
src/modules/users/services/user-lookup.service.ts
src/modules/users/services/user-lookup.service.spec.ts
```

```txt
src/modules/users/controllers/users.controller.ts
src/modules/users/controllers/users.controller.spec.ts
```

```txt
src/tools/config/config.service.ts
src/tools/config/config.service.spec.ts
```

---

# Controller Testing

Controller tests should focus on controller-level behavior.

The purpose of controller tests is to verify:

- controller-local middlewares
- controller-local interceptors
- validation/transformation pipelines
- response DTO mapping/serialization

Use `supertest` for controller testing to ensure the real HTTP pipeline is exercised.

Mock services/business logic dependencies while testing controllers.

---

# Database & Integration Testing

- Do not mock the database in tests for services that interact with the database directly.
- Do not mock TypeORM repositories
- Prefer using real infrastructure for integration tests.
- Prefer using Testcontainers to spin up databases and external services such as Redis.
- Prefer using shared test helpers from the `test/` folder to set up the test environment.
- Do not use `test/` helper functions in files that do not end with `*.spec.ts`.
- Prefer isolated test data per test case.
- Clean up database state between tests.
- Mock external systems only when real infrastructure is impractical or unnecessary for the test scope.

---

# Logging

The application uses structured logging.

In local development, logs are printed in a pretty, human-readable format to make debugging easier.

In cloud and production environments, logs are printed as plain JSON. This makes them easy to collect, search, and process by log systems such as CloudWatch, Loki, OpenSearch, Datadog, or Kubernetes log collectors.

Each log entry contains the service name, request context, optional user context, and the actual log message body.

```ts
{
  timestamp: string;
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

  service: string;

  requestId?: string;
  userId?: string;

  body: unknown[];

  err?: {
    message: string;
    stack?: string;
  };
}
```

The `timestamp` field is exported as an ISO 8601 UTC string.

Example:

```json
{
  "timestamp": "2026-05-14T17:30:00.000Z",
  "level": "info",
  "service": "users-service",
  "requestId": "req_123",
  "userId": "user_456",
  "body": [
    "User created",
    {
      "email": "test@example.com"
    }
  ]
}
```

## Controller DTOs & Response Serialization

Use DTOs to describe the public API contract, not database/entity table definitions.

### Request DTOs

Use DTOs for all controller inputs:

- `@Query()`
- `@Param()`
- `@Body()`

Rules:

- controller inputs must go through validation and transformation pipelines
- request DTOs should validate and normalize incoming data
- keep request DTOs inside the related module `dto/` folder

---

### Response DTOs

Rules:

- use explicit response DTOs for all controller responses.
- use ISO 8601 UTC strings for dates
