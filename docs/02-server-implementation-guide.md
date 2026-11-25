# Server Implementation Guide — Sistem Perpustakaan Digital

Implementation plan for the library domain on top of the existing NestJS boilerplate (`server/`).
Based on `docs/01-overview.md`, `README.md`, and the current code in `server/src` and `web/src`.

## 1. Baseline — what the boilerplate already has

| Area | Existing |
| --- | --- |
| Auth | JWT access + refresh, sessions, local sign-in, cookies |
| RBAC | Roles, permissions, conditional permissions, global guards |
| Identity | Users, profiles, invites, password reset |
| Infra | TypeORM (Postgres), Redis cache, BullMQ queue, S3 storage, WebSocket, logger |
| Audit | Entity subscriber (automatic) + activity log queue |
| API conventions | `ResourceService`, `ResourceQuery`, global response/pagination interceptor |
| Seed/migrate | `typeorm-extension` seeders, migrations, docker entrypoint |

## 2. Gaps versus the required features

Required: book/category CRUD, member data, book search, borrowing, returning, stock monitoring, reports. Two user types.

Missing entirely:

- Library schema: categories, books, loans, members projection.
- Library permissions, roles (`Petugas`, `Anggota`), demo users.
- Stock enforcement (no negative stock, no double return).
- Library reports.
- Library UI (admin and member portal).
- `docker-compose.yml`, web `Dockerfile`, HTTPS deployment.
- Working e2e test. `test/app.e2e-spec.ts` targets `GET /` and `Hello World!`; no such route exists, so it currently fails.
- `package.json` typeorm scripts depend on `$DB`, which is not defined in `.env.example`; commands resolve to `./src/database//datasource.ts`. Fix by setting `DB=default` or hardcoding `default`.

Docs present: only `01-overview.md`. Missing use case, ERD, API, deployment, and testing docs.

## 3. Design decisions (recommended defaults)

1. **Member model**: member = `identity.users` with role `Anggota` + `identity.profiles`. No `library.members` table. Identity data stays in one home; no synchronization. A dedicated members table can be added later if member numbers/status are required.
2. **Borrowing model**: counter/library-staff model. `Petugas` performs borrow and return. `Anggota` is read-only: catalog, stock, own loans.
3. **Loan state**: derived, not stored. `returned_at IS NULL` means active; `returned_at IS NULL AND due_at < now()` means overdue. No status enum to drift.
4. **Stock**: `stock_total` + `stock_available` on `books`. `stock_available` is maintained atomically by the loan service. Both are guarded by DB `CHECK` constraints.
5. **Out of scope** (not in `01-overview.md`): fines, lost books, renewals, reservations. Add only if required.

## 4. Database design

New Postgres schema `library`, created by one additive migration.

```sql
CREATE SCHEMA IF NOT EXISTS "library";

CREATE TABLE "library"."categories" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" varchar NOT NULL UNIQUE,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

CREATE TABLE "library"."books" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "isbn" varchar NOT NULL UNIQUE,
  "title" varchar NOT NULL,
  "author" varchar NOT NULL,
  "publisher" varchar,
  "published_year" int,
  "category_id" uuid NOT NULL REFERENCES "library"."categories"("id"),
  "cover" varchar,
  "description" text,
  "stock_total" int NOT NULL DEFAULT 0 CHECK ("stock_total" >= 0),
  "stock_available" int NOT NULL DEFAULT 0
    CHECK ("stock_available" >= 0 AND "stock_available" <= "stock_total"),
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "deleted_at" timestamptz
);

CREATE TABLE "library"."loans" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "book_id" uuid NOT NULL REFERENCES "library"."books"("id"),
  "member_id" uuid NOT NULL REFERENCES "identity"."users"("id"),
  "borrowed_at" timestamptz NOT NULL DEFAULT now(),
  "due_at" timestamptz NOT NULL,
  "returned_at" timestamptz,
  "handled_by" uuid REFERENCES "identity"."users"("id"),
  "returned_by" uuid REFERENCES "identity"."users"("id"),
  "notes" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "loans_due_after_borrowed" CHECK ("due_at" > "borrowed_at")
);

CREATE INDEX "loans_member_active_idx"
  ON "library"."loans" ("member_id", "returned_at");
CREATE INDEX "loans_book_idx" ON "library"."loans" ("book_id");
CREATE INDEX "loans_due_idx"
  ON "library"."loans" ("due_at") WHERE "returned_at" IS NULL;
```

Notes:

- Cross-schema FKs to `identity.users` are intentional. Members are users.
- Hard delete of a book that already has loans fails on FK; archive (`deleted_at`) is the normal operation. This is acceptable and should be surfaced to the UI.
- Optional partial unique index to prevent the same member borrowing the same book twice while active. Not required by `01-overview.md`; skip unless requested.

Migration file: `server/src/database/default/migrations/1789900000000-library.ts`.
Never edit `1700000000000-init.ts`.

## 5. Backend module structure

Follow existing conventions: one module, entities, `resources/<resource>/` with controller + service + DTOs, `ResourceService`/`ResourceQuery`, permission decorators, global response interceptor.

```
server/src/modules/library/
  library.module.ts
  entities/
    category.entity.ts
    book.entity.ts
    loan.entity.ts
  resources/
    category/{category.controller.ts, category.service.ts, dto/create-category.dto.ts, dto/update-category.dto.ts}
    book/{book.controller.ts, book.service.ts, dto/create-book.dto.ts, dto/update-book.dto.ts, dto/update-book-cover.dto.ts}
    member/{member.controller.ts, member.service.ts, dto/create-member.dto.ts, dto/update-member.dto.ts}
    loan/{loan.controller.ts, loan.service.ts, dto/create-loan.dto.ts}
    report/{report.controller.ts, report.service.ts}
  constants/library.constant.ts        # LOAN_PERIOD_DAYS = 7
  classes/exceptions/loan.exception.ts
```

Wire `LibraryModule` into `app.module.ts` under "App modules".

Entities follow existing style: snake_case naming strategy is global, `timestamptz` timestamps, `DeleteDateColumn` where history allows archiving.

### 5.1 Categories

Standard CRUD via `ResourceService`:

- `findMany(rq)` / `findOne(rq)` / `create(dto)` / `update(rq, dto)` / `archive(rq)` / `restore(rq)` / `delete(rq)`.
- Unique name conflict is caught by the existing TypeORM filter; add a friendly check in `create` only if the generic response is unclear.

### 5.2 Books

- `findMany`: relations `{ category: true }`; search allowed fields `title`, `author`, `isbn`, `category.name`; select `stockTotal`, `stockAvailable`.
- `findOne`: full fields + category.
- `create` / `update`: validate `categoryId` exists. `stockAvailable` is not accepted from the client; on create it equals `stockTotal`.
- Stock edits: transaction. Compute `activeLoans` for the book, set `stockAvailable = newStockTotal - activeLoans`, reject if negative. This keeps `available + activeLoans = total`.
- Archive/restore/delete: standard. Hard delete may fail with FK; return a clear conflict message if so.

### 5.3 Members (projection over identity)

No new table and no duplicated credentials.

| Endpoint | Behavior |
| --- | --- |
| `GET /library/members` | Custom QueryBuilder on `identity.users` joined to `role_users` + `roles` where `roles.name = 'Anggota'`, joined to `profiles`. Supports search on `username`, `email`, `profile.firstName`, `profile.lastName`, plus pagination and `order`. |
| `POST /library/members` | Delegate `UserService.invite()` with forced role `Anggota`. Reuses invitation token + email flow. |
| `PATCH /library/members/:id` | Delegate `UserService.updateById()` for username/status and `ProfileService.update()` for profile fields. |
| `PATCH /library/members/:id/archive` | Delegate `UserService.archive()`. |
| `PATCH /library/members/:id/restore` | Delegate `UserService.restore()`. |
| `DELETE /library/members/:id` | Delegate `UserService.delete()`. |

Requires `ProfileService` to be exported from `IdentityModule` (currently only `UserService` is exported).

The custom QueryBuilder is the deliberate exception to `ResourceQuery`: role membership lives in `access_control` and adding a bidirectional entity relation would couple modules.

### 5.4 Loans

- `findMany`: relations `{ book: true, member: true }`; select a safe subset (no password). Support filters such as `book.title`, `member.username`, `returnedAt`, `dueAt`, and `order`.
- `findOne`: full loan + book + member + profile.
- `create` and `return` implement the business rules in section 6.
- No update/delete/archive endpoints. Loan history is immutable.
- `@Permission('library:loan:read')` with a seeded condition for `Anggota`: `{ memberId: { eq: '{{actor.id}}' } }`. `store.buildResourceQuery()` merges it into every list/detail query.

### 5.5 Reports

`ReportService` uses QueryBuilder/aggregates, not `ResourceQuery`.

- `GET /library/reports/summary`
  - total titles, total copies, total available, total members (`Anggota`), active loans, overdue loans, loans this month.
- `GET /library/reports/top-books?limit=10`
  - book title, author, borrow count, ordered descending.
- `GET /library/reports/loans?from=&to=`
  - borrow count, return count, active count, overdue count for a date range.

Keep the queries in one service; do not duplicate stock math in the frontend.

## 6. Business rules — enforcement

Rules from `01-overview.md`:

1. Cannot borrow a book with no available stock.
2. Borrowing decreases available stock.
3. Returning increases available stock.
4. Double return must be prevented.

Implementation uses DB-level conditional writes inside `DataSource.transaction`. Do not read-then-write stock from application memory.

### Borrow

```
BEGIN
  UPDATE library.books
     SET stock_available = stock_available - 1
   WHERE id = $bookId AND stock_available > 0
  -- affected = 0 -> ConflictException('Book out of stock'), ROLLBACK

  -- verify member exists, status active, has role Anggota

  INSERT INTO library.loans(book_id, member_id, due_at, handled_by)
  VALUES ($bookId, $memberId, COALESCE($dueAt, now() + 7 days), actor.id)

  -- audit: module 'library', action 'borrow', resourceType 'Loan'
COMMIT
```

The conditional `UPDATE` is the guarantee that stock never goes negative, including concurrent requests.

### Return

```
BEGIN
  UPDATE library.loans
     SET returned_at = now(), returned_by = $actorId
   WHERE id = $loanId AND returned_at IS NULL
  RETURNING book_id
  -- affected = 0 -> ConflictException('Loan already returned'), ROLLBACK

  UPDATE library.books
     SET stock_available = stock_available + 1
   WHERE id = $bookId AND stock_available < stock_total

  -- audit: module 'library', action 'return', resourceType 'Loan'
COMMIT
```

The conditional `UPDATE` on `returned_at IS NULL` is the guarantee against double return, including concurrent requests.

### Overdue

Never stored. Queries use `returned_at IS NULL AND due_at < now()`.
Frontend renders an "Overdue" badge from `dueAt`.

### Explicit audit

`AuditEntitySubscriber` automatically audits non-blacklisted entities, including all `library.*` entities. Borrow and return additionally call `EventService.emitAuditActivityLog()` with business action names (`borrow`, `return`). Do not add library entities to `AUDIT_BLACKLIST`.

## 7. Permissions and roles

Permission keys must be `module:resource:action` (enforced by `Permission` decorator).
Frontend CASL derives subject `module:resource`, action `action` automatically from `/access-control/me`.

| Endpoint group | Permission key |
| --- | --- |
| categories CRUD/archive/restore/delete | `library:category:create/read/update/archive/restore/delete` |
| books CRUD/archive/restore/delete | `library:book:create/read/update/archive/restore/delete` |
| members list/create/update/archive/restore/delete | `library:member:create/read/update/archive/restore/delete` |
| borrow | `library:loan:create` |
| list/detail loans | `library:loan:read` |
| return | `library:loan:return` |
| reports | `library:report:read` |

Seed mapping in `permissions.data.ts`:

- `Superadmin`: all keys.
- `Petugas`: all category/book/member keys except `delete`; `loan:create`, `loan:read`, `loan:return`; `report:read`.
- `Anggota`: `library:book:read`, `library:category:read`, `library:loan:read` with condition `{ memberId: { eq: '{{actor.id}}' } }`.

Role additions in `roles.data.ts`:

```ts
export const RolesData = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Admin',
  USER: 'User',
  PETUGAS: 'Petugas',
  ANGGOTA: 'Anggota',
};
```

Demo accounts in `users.data.ts`:

- `petugas@example.com` → role `Petugas`
- `anggota@example.com` → role `Anggota`

Existing seeds use `track = false` and are re-run by the docker entrypoint, so new role/permission/user rows are inserted naturally. Do not modify the applied migration.

## 8. Seeds

Add `server/src/database/default/seeds/1789900000000-library-books.ts`:

- ~6 categories (e.g. Fiksi, Non-Fiksi, Teknologi, Sejarah, Sains, Referensi).
- ~15 books with varied stock, including at least one with `stockTotal = 0` and one with `stockAvailable = 0` to demo the out-of-stock rule.
- Idempotent inserts with `.orIgnore()` keyed on category name and ISBN.
- Timestamp must be greater than all existing seeds so it runs after roles and permissions.

## 9. API summary

```
POST   /library/categories
GET    /library/categories
GET    /library/categories/:id
PATCH  /library/categories/:id
PATCH  /library/categories/:id/archive
PATCH  /library/categories/:id/restore
DELETE /library/categories/:id

POST   /library/books
GET    /library/books
GET    /library/books/:id
PATCH  /library/books/:id
PATCH  /library/books/:id/cover
PATCH  /library/books/:id/archive
PATCH  /library/books/:id/restore
DELETE /library/books/:id

POST   /library/members
GET    /library/members
PATCH  /library/members/:id
PATCH  /library/members/:id/archive
PATCH  /library/members/:id/restore
DELETE /library/members/:id

POST   /library/loans
GET    /library/loans
GET    /library/loans/:id
PATCH  /library/loans/:id/return

GET    /library/reports/summary
GET    /library/reports/top-books
GET    /library/reports/loans
```

List endpoints accept `ResourceQueryDto`: `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `in`, `nin`, `search`, `order`, `page`, `limit`, `trash`.
Responses are wrapped by the global interceptor: `{ statusCode, message, data }`, paginated as `{ items, total, page, limit }`.

## 10. Frontend

Follow the existing feature pattern under `web/src/features/<domain>/`:
`api/{x.api.ts,x.query.ts,x.mutation.ts}`, `schemas/`, `types/`, `components/`.
Use `apiClient`, TanStack Query, yup + react-hook-form, existing `ResourceList`/`DataTable`/dialogs.

### Admin routes

Add to `admin.routes.tsx` and the sidebar in `admin.layout.tsx`:

| Path | Page | CASL subject |
| --- | --- | --- |
| `/admin/library/categories` | Category list + create/update/archive/restore | `library:category`, read |
| `/admin/library/books` | Book list + search + create/update + stock | `library:book`, read |
| `/admin/library/members` | Member list + invite + edit + archive | `library:member`, read |
| `/admin/library/loans` | Borrow dialog, loan list, return action | `library:loan`, read |
| `/admin/library/reports` | Summary cards, top books, date-range loans | `library:report`, read |

Details:

- Book list: title, ISBN, author, category, stock `available/total` badge, stock-out filter.
- Book form: category combobox, stock total, optional cover upload using the existing storage hook and `updateBookCover` endpoint.
- Borrow dialog: member async combobox (`/library/members`), book async combobox filtered to `stock_available > 0`, due date (default +7 days).
- Loan list: member, book, borrowed date, due date, returned date, overdue badge; return action with confirmation.
- Reports: no chart library needed; summary cards + tables are enough.

### Member portal

- `/library` catalog: search, category filter, stock badge, book detail.
- `/library/loans`: own loans only; backend permission condition enforces this.
- Hide borrow/return actions from `Anggota` using CASL.

No new UI dependencies.

## 11. Docker, deployment, HTTPS

- `web/Dockerfile`: Node build with `VITE_API_URL=/api`, serve with nginx, SPA fallback, proxy `/api` to `server:5001`.
- Root `docker-compose.yml` services: `postgres:16`, `redis:7`, `minio`, `mailpit`, `server`, `web`, `caddy`.
- Server keeps the existing `Dockerfile` and `scripts/docker-entrypoint.sh` (migrations then seeds then start).
- Compose must provide every environment variable validated by the zod configs:
  `APP_MODE`, `APP_PORT`, `APP_ORIGIN`, `APP_CLIENT_DEFAULT_ORIGIN`,
  `AUTH_JWT_ACCESS_SECRET`, `AUTH_JWT_ACCESS_EXPIRE`, `AUTH_JWT_REFRESH_SECRET`, `AUTH_JWT_REFRESH_EXPIRE`, `AUTH_JWT_ISSUER`,
  `DATABASE_DEFAULT_*`, `REDIS_DEFAULT_*`, `QUEUE_DEFAULT_REDIS_*`, `CACHE_TTL`,
  `MAILER_DEFAULT_*`, `S3_DEFAULT_*` (MinIO), `FIREBASE_DEFAULT_SERVICEACCOUNT_PATH`, `SEED_USERS_PASSWORD`.
- Production: DNS A record to VPS, Caddy for automatic TLS. Add `docs/05-deployment.md`.
- Do not commit `.env`. `.env.example` gets any new variables (`DB=default` for typeorm scripts).

## 12. Testing

- Replace the broken `test/app.e2e-spec.ts` with:
  - `GET /health` returns success.
  - Sign in as `petugas` and `anggota`.
- Library e2e against a migrated test database:
  1. Borrow with available stock decreases `stock_available`.
  2. Borrow when `stock_available = 0` returns `409`.
  3. Return increases `stock_available` and sets `returned_at`.
  4. Returning the same loan twice returns `409`.
  5. `Anggota` cannot create a book (`403`).
  6. `Anggota` loan list contains only their own loans.
  7. Report summary numbers match direct SQL counts.
- Optionally add a unit test for the loan service using a mocked repository to pin the conditional-update branches.
- Documentation for testing goes in `docs/07-testing.md`.

## 13. Documentation deliverables

- `docs/02-server-implementation-guide.md` (this file).
- `docs/03-erd.md`: Mermaid ERD, including `identity.users`, `identity.profiles`, `access_control.*`, and `library.*`.
- `docs/04-use-case.md`: use case diagram and descriptions (Petugas, Anggota).
- `docs/05-api.md`: endpoint and permission table from this guide.
- `docs/06-deployment.md`: compose, env, DNS, HTTPS, backup notes.
- `docs/07-testing.md`: how to run tests and the scenarios above.
- Update root `README.md` deliverables checklist.

## 14. Execution order

1. Fix `$DB` in typeorm scripts; add migration and seed data; run migrate + seed. Verify tables and seeded rows with SQL.
2. Category + Book modules, entities, DTOs, permissions, seed permissions. Verify CRUD with curl.
3. Member projection endpoints over `IdentityModule`. Verify invite → role assigned → member appears in list.
4. Loan module with transactional borrow/return. Verify stock and double-return behavior, including concurrent requests.
5. Report queries. Verify each number against direct SQL.
6. Admin and member-portal frontend pages.
7. Web Dockerfile, compose, Caddy, deploy.
8. E2E tests and docs.

## 15. Verification commands

Server:

```bash
cd server
DB=default npm run typeorm:migration:run
DB=default npm run typeorm:seed:run
npm run start:dev
npm run build
npm run lint
npm run test
```

Manual API checks (after seeding):

```bash
# sign in as petugas, store access token
curl -X POST http://localhost:5001/auth/sign-in -H 'Content-Type: application/json' \
  -d '{"username":"petugas","password":"<SEED_USERS_PASSWORD>"}'

# borrow, return, double return, out-of-stock
curl -X POST http://localhost:5001/library/loans \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"bookId":"<uuid>","memberId":"<uuid>"}'
```

Web:

```bash
cd web
npm run typecheck
npm run lint
npm run build:prod
```

Compose:

```bash
docker compose config
docker compose up -d --build
curl -f https://<domain>/health
```

## 16. Acceptance checklist

- [ ] Books and categories CRUD with search and archive/restore.
- [ ] Member list with invite, profile edit, archive/restore.
- [ ] Borrow decrements stock; zero stock returns `409`.
- [ ] Return increments stock; second return returns `409`.
- [ ] Anggota sees only own loans; cannot mutate library data.
- [ ] Stock monitoring visible in book list and reports.
- [ ] Summary/top-books/loans reports match DB.
- [ ] Admin UI pages and member portal work.
- [ ] Compose stack runs, HTTPS valid, demo accounts seeded.
- [ ] E2E tests pass; docs complete.
