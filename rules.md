# Project Structure & Architecture Conventions

## Project Structure

```txt
src
├── tools                         # Shared infrastructure and low-level utilities
│   ├── redis
│   ├── config
│   └── db
│
├── modules                       # Business domains / bounded contexts
│   └── [domain-name]
│       ├── controllers           # HTTP/API transport layer
│       ├── dto                   # Request/response DTOs and validation schemas
│       ├── entities              # Database entities/models
│       ├── services              # Public domain services (module API)
│       ├── internal              # Internal/private module implementation
│       └── index.ts              # Public exports for other modules
```

---

# Architecture Rules

## `tools/`

Contains reusable infrastructure-level utilities.

Must not contain business logic.

Examples:

- database clients
- redis/cache integrations
- config loaders
- external SDK wrappers

---

## `modules/`

Contains isolated business domains.

Each module should be as self-contained as possible.

---

## `controllers/`

Responsible only for transport concerns.

Responsibilities:

- parse requests
- call services
- return responses

Keep controllers thin and avoid business logic.

---

## `dto/`

Contains:

- request/response contracts
- validation schemas
- typed payload definitions

---

## `entities/`

Contains:

- ORM entities
- database table models
- persistence mappings

---

## `services/`

Contains public application/domain services.

Rules:

- allowed to be used by other modules
- represents the public API of the module
- should contain reusable business use-cases

---

## `internal/`

Contains private implementation details.

Rules:

- internal orchestration logic
- helper services
- implementation-specific logic
- must not be imported directly from other modules
- must not be re-exported by the module

---

# Module Boundaries

Avoid importing internal files from another domain.

## Bad

```ts
import { UserRegistrationService } from '../users/internal/user-registration.service';
```

## Good

```ts
import { UserLookupService } from '../users';
```

---

# Public Module API

Use `index.ts` as the public module API.

Example:

```ts
// modules/users/index.ts

export { UserLookupService } from './services/user-lookup.service';

// DO NOT export anything from ./internal
```

Other modules should import only from the module root:

```ts
import { UserLookupService } from '../users';
```

---

# Additional Recommendations

## Architecture

- Prefer dependency injection over singletons.
- Avoid framework-specific logic inside domain/business code.
- Put shared cross-domain abstractions in `tools/` or dedicated shared packages.

---

## Controllers

- Keep controllers thin.
- Controllers should handle transport concerns only.

---

## Services

- Keep business logic inside `services/` and `internal/`.
- Keep service classes small and focused.
- Split large services by business responsibility or use-case.
- Keep services testable.

---

## Module Boundaries

- Avoid `forwardRef` and circular dependency injection.
- Treat `forwardRef` as a signal that module boundaries should be refactored.
- Prefer extracting shared logic into a separate module instead of creating cyclic dependencies.
---

# Testing Conventions

Every service file must have a corresponding test suite in the same directory.

If a file named `[service-name].ts` exists, a test file `[service-name].spec.ts` must be
created alongside it.

## Example

```txt
src/modules/users/services/user-lookup.service.ts
src/modules/users/services/user-lookup.service.spec.ts
```

```txt
src/tools/config/config.service.ts
src/tools/config/config.service.spec.ts
```

## Database & Integration Testing

- Do not mock the database in tests for services that interact with the database directly.
- Prefer using real infrastructure for integration tests.
- Prefer using Testcontainers to spin up databases and external services such as Redis.
- Prefer using shared test helpers from the `test/` folder to set up the test environment.
- Do not use `test/` helper functions in files that do not end with `*.spec.ts`.
- Prefer isolated test data per test case.
- Clean up database state between tests.
- Mock external systems only when real infrastructure is impractical or unnecessary for the test scope.