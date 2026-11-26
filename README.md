# SaaS Framework

A reusable starter kit for custom and SaaS applications. It is being built as a single Next.js application with a consistent foundation for authentication, organizations, permissions, audit logging, administration, billing hooks, and deployment.

The full technical design and delivery roadmap live in [saas-framework-plan.md](./saas-framework-plan.md).

## Project status

The repository currently contains the Next.js foundation and code-quality tooling. The application features below are planned and will be delivered incrementally:

- Authentication, email verification, and password reset with Better Auth
- Organizations, invitations, members, and fixed roles
- Server-side permissions and tenant isolation
- Structured application and audit logs
- An admin panel and a `posts` reference module
- Stripe billing hooks and feature gating

Custom roles, notifications, internationalization, analytics, and a separate NestJS backend are outside the initial scope.

## Planned stack

- Next.js App Router with strict TypeScript
- PostgreSQL and Prisma
- Better Auth, including its organization plugin
- Tailwind CSS and shadcn/ui
- Zod, React Hook Form, TanStack Query, and TanStack Table
- Pino for structured logging
- Vitest and Playwright for testing
- Docker Compose for local PostgreSQL
- GitHub Actions for linting, type checking, tests, builds, and deployment

Exact dependency versions are pinned in [package.json](./package.json). Package-manager choice is still an open team decision; this repository currently uses npm and includes a `package-lock.json`.

## Getting started

### Prerequisites

- Node.js (use a version supported by the installed Next.js release)
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

```bash
npm run dev          # Start the development server
npm run build        # Create a production build
npm run start        # Run the production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript without emitting files
npm run format       # Format repository files with Prettier
npm run format:check # Check formatting without changing files
```

Husky runs through the `prepare` script after dependencies are installed. Commit messages follow the Conventional Commits format, such as `feat: add organization invites`.

## Intended architecture

The project keeps framework and business concerns separate so that the backend can later move to NestJS with minimal disruption.

```text
app/          Routes, layouts, and thin server-action entry points
modules/      Feature modules: schema, repository, service, permissions, actions, UI
core/         Framework-free permissions, errors, and utilities
lib/          Integrations such as auth, database, email, Stripe, logging, and env validation
components/   Shared UI and layout components
config/       Feature flags and static role definitions
```

Architecture rules:

- Keep pages, components, and server actions free of business logic and Prisma queries.
- Put business rules and server-side permission checks in module services.
- Keep Prisma access in repositories and apply organization filtering centrally.
- Record important actions in the audit log.
- Check feature flags in both routes and navigation.
- Keep `core/` independent of Next.js, Prisma, and Better Auth.

## Roadmap

1. **Foundation and auth** — environment validation, local PostgreSQL, logging, Better Auth, email flows, and route protection.
2. **Organizations, roles, and audit** — organization management, invitations, static permissions, tenant isolation, audit log, admin basics, and the `posts` example module.
3. **Billing and documentation** — Stripe hooks, feature gating, complete setup and architecture documentation, release checklist, and v1.0.0.
4. **Hardening** — custom roles if needed, a sample application, and fixes discovered through real use.

## Working agreements

- Keep `main` deployable; use `feature/<name>` branches and small pull requests.
- Run linting, type checks, tests, and builds in CI before merge.
- Never commit secrets; use environment-specific configuration.
- Add and review one Prisma migration for each schema change; do not edit old migrations.
- Update relevant documentation in the same pull request as the code.

## Definition of done for v1

v1 is complete when a new project can be started using the documentation alone; authentication, organizations, invitations, roles, audit logging, and the admin panel work; tenant-isolation and permission tests pass in CI; logs are structured and redact secrets; and Stripe works for one example plan.
