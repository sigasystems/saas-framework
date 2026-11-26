# SaaS Framework (Starter Kit) – Technical Plan

**Version:** v1 plan
**Last updated:** 26 Nov 2026
**Shape for v1:** Single Next.js app (Next.js + NestJS shape comes later)

---

## 1. Overview

A reusable starter kit that new custom and SaaS projects start from. It gives every project the same base: authentication, organizations, roles and permissions, audit log, admin panel, logging, billing hooks and a deployment pipeline. Project-specific features are added on top as modules.

Technical goals:

- One consistent structure across all projects.
- Performance, security and scalability built in, not added later.
- Features can be switched on or off per project (a simple CMS does not need billing or custom roles).
- Code layered so the backend can later move to NestJS and shared code can move into packages with little change.

---

## 2. Scope of v1

| Feature                                           | In v1?          | Notes                                            |
| ------------------------------------------------- | --------------- | ------------------------------------------------ |
| Signup, login, email verification, password reset | Yes (P1)        | Better Auth                                      |
| Application logging                               | Yes (P1)        | pino, request ID, secrets redacted               |
| Audit log                                         | Yes (P1)        | Database table, helper and admin screen          |
| Organizations, invites, members                   | Yes             | Better Auth organization plugin (do not rebuild) |
| Static roles (owner, admin, member)               | Yes             | Defined in config                                |
| Admin panel                                       | Yes             | Users, organizations, audit log                  |
| Example module (`posts`)                          | Yes             | Reference pattern for new modules                |
| Stripe billing hooks                              | Yes, after P1   | Plans, checkout, webhook, feature gating         |
| Custom roles (created by customers)               | Optional module | Behind a feature flag                            |
| Separate NestJS backend                           | No              | Later version                                    |
| Notifications, i18n, analytics                    | No              | v2 list                                          |

---

## 3. Key technical decisions

1. **Single Next.js app for v1.** One repo, one deploy, one auth setup, no CORS or cross-domain cookie issues. Covers simple apps such as a CMS.
2. **Better Auth organization plugin** for organizations, invites and members. We do not rebuild these.
3. **Own roles and permissions layer.** App code always calls `can(user, 'permission')`. Permissions come from fixed roles (simple apps) or database roles (apps with custom roles) through a `PermissionProvider` interface.
4. **Feature flags** for multi-tenant, custom roles, billing and admin panel.
5. **Layered code.** No business logic in pages, components or server actions. This keeps a later move to NestJS cheap.
6. **Packages later.** Build inside one app first. After a few real projects, move the framework-free code (`core/`) into versioned packages.
7. **Frontend stays Next.js** in both shapes (single app, and Next.js + NestJS), so the UI is not built twice.

---

## 4. Tech stack

| Area                   | Choice                                                |
| ---------------------- | ----------------------------------------------------- |
| Framework              | Next.js (App Router), TypeScript strict mode          |
| UI                     | Tailwind CSS, shadcn/ui                               |
| Database               | PostgreSQL                                            |
| ORM                    | Prisma                                                |
| Auth                   | Better Auth (with organization plugin)                |
| Validation             | Zod (also for env variables)                          |
| Forms                  | React Hook Form + Zod                                 |
| Client data and tables | TanStack Query, TanStack Table                        |
| Email                  | Resend or SMTP, React Email templates                 |
| Billing                | Stripe (after P1)                                     |
| Logging                | pino                                                  |
| Testing                | Vitest (services), Playwright (main flows)            |
| Code quality           | ESLint, Prettier, Husky, lint-staged, commitlint      |
| Package manager        | pnpm (confirm team standard first)                    |
| Local setup            | Docker Compose (Postgres)                             |
| CI/CD                  | GitHub Actions: lint, type check, test, build, deploy |

Pin exact versions in `package.json`. Check the Better Auth and Prisma docs during setup, because setup steps change between versions.

---

## 5. Folder structure

```
saas-starter/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ public/
├─ docs/
│  ├─ getting-started.md
│  ├─ architecture.md
│  ├─ add-a-module.md
│  └─ release-checklist.md
├─ .github/
│  ├─ workflows/ci.yml
│  └─ pull_request_template.md
├─ src/
│  ├─ app/                         # routes only, keep thin
│  │  ├─ (public)/                 # landing, blog, marketing
│  │  ├─ (auth)/                   # login, signup, reset, verify
│  │  ├─ (app)/                    # logged-in area
│  │  │  ├─ dashboard/
│  │  │  ├─ posts/
│  │  │  └─ settings/
│  │  ├─ (admin)/                  # admin panel
│  │  │  ├─ users/
│  │  │  ├─ organizations/
│  │  │  ├─ roles/                 # only when customRoles flag is on
│  │  │  └─ audit-log/
│  │  └─ api/
│  │     ├─ auth/[...all]/route.ts
│  │     └─ webhooks/stripe/route.ts
│  ├─ modules/                     # one folder per feature
│  │  ├─ posts/
│  │  │  ├─ schema.ts              # Zod schemas and inferred types
│  │  │  ├─ repository.ts          # Prisma queries only
│  │  │  ├─ service.ts             # business logic, no Next.js imports
│  │  │  ├─ permissions.ts         # permission keys of this module
│  │  │  ├─ actions.ts             # server actions, thin wrapper
│  │  │  └─ ui/                    # components of this module
│  │  ├─ members/
│  │  ├─ roles/                    # static roles and custom roles
│  │  ├─ billing/
│  │  └─ audit-log/
│  ├─ core/                        # framework-free logic (future packages)
│  │  ├─ permissions/              # catalog, can(), PermissionProvider
│  │  ├─ errors/                   # AppError, error codes
│  │  └─ utils/
│  ├─ lib/                         # glue code to libraries
│  │  ├─ auth/                     # Better Auth server and client setup
│  │  ├─ db/                       # Prisma client
│  │  ├─ email/                    # sender and templates
│  │  ├─ stripe/
│  │  ├─ logger.ts
│  │  └─ env.ts                    # Zod-validated env variables
│  ├─ components/                  # shared UI: ui/, layout/, data-table/
│  ├─ config/
│  │  ├─ features.ts               # feature flags
│  │  └─ roles.ts                  # static roles map
│  └─ middleware.ts                # session check, route protection
├─ tests/
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

---

## 6. Architecture rules

| Layer           | Rule                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------- |
| `app/`          | Routing and page layout only. No business logic, no Prisma.                              |
| `actions.ts`    | Read session, validate input with Zod, call the service, return result. Keep very small. |
| `service.ts`    | All business rules. Checks permissions with `can()`. No imports from `next/*`.           |
| `repository.ts` | The only place with Prisma queries. Every query filters by `organizationId`.             |
| `core/`         | No Next.js, no Prisma, no Better Auth. Becomes a shared package later.                   |
| `lib/`          | Glue code to libraries. If a library changes, only this folder changes.                  |

Extra rules:

- Do not use `next/headers` or `next/cache` inside services. Read them in the action layer and pass the values in.
- Apply the tenant filter in one central place (repository layer or Prisma extension), not per developer.
- Every important action writes an audit log entry.
- Permission checks run on the server. UI checks only show or hide buttons.
- Modules import each other only through public files, not internals.

### Module conventions

- **Start with flat files** (`schema.ts`, `repository.ts`, `service.ts`, `actions.ts`, `permissions.ts`). Split a file into a folder only when it passes about 200 to 300 lines or mixes topics.
- Use the same file names in every module so anyone can find things quickly.
- Do not create folders that would hold only one file.
- Infer types from Zod (`z.infer`). Create a separate `types.ts` only for types not tied to a schema.
- Files with `'use server'` make every export a server action. Export only real actions from them.
- Keep `ui/` as a folder from the start.
- **Sub-modules:** if it is another entity of the same feature, group it inside the module (for example `billing/plans/`, `billing/invoices/`). If it has its own screens, permissions and rules, make it its own top-level module. Nest only one level deep, and keep dependencies one-directional (parent imports child, never the reverse).

### Roles and permissions design

- Each module defines its permissions in code (example: `post:publish`).
- **Simple mode:** roles are fixed in `config/roles.ts`.
- **Custom roles mode:** roles are rows in the database. Tables: `roles`, `role_permissions`, `member_roles`.
- `PermissionProvider` has two implementations (static and dynamic), selected by the `customRoles` flag.
- Cache a member's permission set per request (or short-lived cache) and clear it when roles or assignments change.
- Safety rules for custom roles: a user cannot grant a permission they do not have, the last owner cannot be removed, system roles cannot be deleted or edited (owner), a role with members cannot be deleted without reassigning, all role changes are audit logged.

### Feature flags (`config/features.ts`)

```ts
export const features = {
  multiTenant: true,
  customRoles: false,
  billing: false,
  adminPanel: true,
};
```

Check flags in both the route (to block it) and the menu (to hide it). Single-tenant apps use one default organization so the same code works.

---

## 7. Phases and sprints

### Sprint 1: Foundation and Auth (P1)

- [ ] Create project, TypeScript strict, ESLint, Prettier, Husky, commitlint
- [ ] PR template, CI workflow, `.env.example`, Zod env validation
- [ ] Docker Compose with Postgres
- [ ] Logger (pino), request ID, secret redaction, `AppError` and central error handler
- [ ] Prisma base schema and Better Auth setup
- [ ] Email sender and templates (verification, reset, invite)
- [ ] Auth screens: signup, login, verify, reset, logout
- [ ] `middleware.ts` for route protection

**Done when:** a user can sign up, verify email, log in and reset password. Logs show a request ID and hide secrets.

### Sprint 2: Organizations, Roles, Audit (P1)

- [ ] Better Auth organization plugin: create organization, active organization, invites, members
- [ ] Member and invite screens
- [ ] `core/permissions`: permission catalog, `can()`, `PermissionProvider`, static roles
- [ ] Central tenant filter in the repository layer
- [ ] Audit log table, `audit.log()` helper, admin screen with filters
- [ ] Admin panel basics (users, organizations)
- [ ] `posts` example module showing the full pattern
- [ ] Tests: auth flows, tenant isolation (tenant A cannot read tenant B), permission checks

**Done when:** a user can create an organization, invite a member and assign a role. Protected actions reject users without permission. Important actions appear in the audit log.

### Sprint 3: Billing and Docs

- [ ] Stripe hooks: plans, checkout, webhook handler, `subscription` table, `hasFeature()` helper (check whether Better Auth's Stripe plugin covers this before writing our own)
- [ ] Feature flags wired in routes and menus
- [ ] Docs: README quickstart, architecture, "add a module", "create a new project from this", release checklist
- [ ] Tag `v1.0.0`, add `CHANGELOG.md`
- [ ] Custom roles module (stretch): build only if the above is done

**Done when:** a new project can be started from the docs alone, and the release checklist passes.

### Sprint 4: Hardening and Extras

- [ ] Custom roles module (if not done in Sprint 3)
- [ ] Build one sample app on the framework to find gaps
- [ ] Fix issues found, update docs

### Later

- NestJS backend shape for projects that need it
- Move `core/` into versioned packages (private registry) after 2 or 3 real projects
- v2 ideas: notifications, i18n, analytics, Razorpay, resource-level permissions

---

## 8. Ways of working

- **Branches:** `main` is always deployable. Work on `feature/<name>`, merge through pull requests. Keep PRs small.
- **Commits:** conventional commits (`feat:`, `fix:`, `chore:`).
- **Pre-commit:** lint-staged (lint and format) and type check.
- **CI:** every PR runs lint, type check, tests and build. No merge if it fails.
- **Environments:** local, staging, production, each with its own `.env` and database. Never commit secrets.
- **Migrations:** one Prisma migration per change, reviewed in the PR. Never edit an old migration.
- **Docs:** update `docs/` in the same PR as the code.
- **Versions:** tag releases and keep a changelog so projects know which version they started from.
- **Code review:** weekly review, and check for shortcuts such as Prisma queries inside actions or components.

---

## 9. Release checklist

- [ ] **Performance:** indexes on tenant columns, pagination on lists, no N+1 queries
- [ ] **Security:** input validated, permission check on every action, rate limiting on auth, secure cookies, no secrets in the repo
- [ ] **Scalability:** app is stateless, long work does not block requests, structured logs in place
- [ ] **Tenant isolation tests pass**
- [ ] **Docs and changelog updated**

---

## 10. Definition of done for v1

- A new project can start from the starter using only the docs.
- Auth, organizations, invites, roles, audit log and admin panel work.
- Tenant isolation and permission tests pass in CI.
- Logs are structured and do not leak secrets.
- Stripe hooks work with one example plan.

---

## 11. Risks and open decisions

| Item                       | Note                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| Timeline is tight          | Do not add extras to v1. Move them to the v2 list.                |
| Custom roles               | Stretch for v1. Can follow right after if time runs out.          |
| Package manager            | Confirm team standard (npm, pnpm or yarn). Use one lockfile only. |
| Better Auth plugin options | Check current docs for plugin setup and version before locking.   |
| Better Auth Stripe plugin  | Check whether it fits before writing a custom webhook.            |
| Hosting target             | Confirm where staging and production will run.                    |
