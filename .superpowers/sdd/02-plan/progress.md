# SDD ledger — plan: docs/02-plan.md

Pre-flight: no shared interfaces (Task 1 is first).
Task 1: Ruling: executing-plans workspace/task scripts absent and worktree_create failed — implement in current tree with manual ledger — user requested this plan/tree; cost: less isolation than worktree execution.
Task 1: Ruling: no commits — earlier user instruction says do not run commits and plan has no commit steps; cost: task completion is recorded by ledger and file state, not git history.
Task 1: Ruling: add @Index decorators to Book.categoryId and Loan.memberId/bookId/status — Step 2 requires generated indexes; cost: generated index names chosen by TypeORM.
Task 1: Ruling: add `library-entities.spec.ts` not listed in plan — executing-plans requires RED-GREEN gate; cost: one small server test file.
Task 1: Ruling: test-driven-development sub-skill not installed — followed RED→GREEN manually with `library-entities.spec.ts`; cost: no skill-specific checklist.
Task 1: complete (no commits, tests: npm test -- library-entities.spec → 10 passed; build: PASS; migration: Library1795574606358 executed successfully).
Task 2 pre-flight: Task 2 consumes `Category`, `Book`, `Member` from Task 1 — names and paths match plan; no conflict.
Task 2: Ruling: add legacy-role cleanup to existing roles seeder — Step 1 requires removing obsolete `Admin`/`User` rows before reseeding; cost: deletes old role_permissions and role_users rows for those roles.
Task 2: Ruling: make library seeders idempotent via existence checks plus `.orIgnore()` — `category.name` and `book.title` are not unique; cost: one extra lookup query per seeder.
Task 2: Ruling: use flat dotted condition `{'member.userId': {eq: '{{actor.id}}'}}` instead of plan's nested object — `Condition` type and `StoreService.buildResourceQuery()` accept field strings with operators, not nested objects; cost: plan text stays stale, runtime query behavior matches permission mechanism.
Task 2: complete (no commits, tests: npm test -- library-seed-data.spec → 4 passed; seed: roles/users/role_users/permissions/role_permissions/templates/categories/books/members all inserted; repeat library seeders 0 inserted; build: PASS).
User: Task 2 fixes are desired — keep as-is, no revert.
Task 3: User instructed skip Steps 1 and 2 — skipped RED test write/run; spec added after implementation and run GREEN; cost: no observed failing-test gate for Task 3.
Task 3 pre-flight: consumes `Category`, `Book`, `ResourceService`, `ResourceQuery`, `StoreService` from earlier code — names and paths match; no conflict.
Task 3: Ruling: import `reflect-metadata` in `category.service.spec.ts` — Jest has no setup file and `ResourceQueryDto` decorators need Reflect metadata; cost: one import in each service spec that loads DTOs.
Task 3: complete (no commits, tests: npm test -- category.service.spec → 2 passed; build: PASS).
Repo note: user commits `0e6e209` and `8674ab1` changed seed data, removed added specs, and committed Tasks 2-3 — keep as-is, no revert.
Task 4 pre-flight: consumes `Book`, `Category`, `Loan`, `LoanStatus` from Task 1 and library module from Task 3 — names and paths match current code; no conflict.
Task 4: Ruling: register `Loan` in `LibraryModule.forFeature` — `BookService` injects `Loan` repository for active-loan guards; cost: one extra entity registration.
Task 4: Ruling: add fourth spec for hard-delete loan-history guard — Review Focus calls out delete behavior not covered by plan's three tests; cost: one extra small test.
Task 4: complete (no commits, tests: npm test -- book.service.spec → 4 passed; build: PASS).
Repo note: user commit `453334e` committed Task 4 — keep as-is, no revert.
Task 15 added per user request — appended after Task 14 and executed before Tasks 5-14; no renumbering; cost: plan order nonsequential.
Task 15: Ruling: append to `docs/02-plan.md` instead of creating a separate plan file — user asked for a new task in the active plan; cost: no separate plan artifact.
Task 15 pre-flight: consumes `BookService`, `Book`, `PermissionsData` from Tasks 1/2/4 and `StorageService` from existing storage module — names and paths match; no conflict.
Task 15: Ruling: web cover dialog/action deferred — Task 9 owns the web book feature and it does not exist yet; scope is server endpoint plus permission; cost: no UI control until a post-Task-9 follow-up.
Task 15: Ruling: keep `UpdateBookDto extends PartialType(CreateBookDto)` with excluded `cover?: string` — `OmitType(CreateBookDto, ['cover'])` failed typecheck in this repo; service casts null through update; cost: internal DTO field still typed string, excluded at transform.
Task 15: Ruling: mock `file-type` in `book.service.spec.ts` — Jest cannot parse the ESM dependency pulled in by `StorageService`; cost: upload validation itself is not exercised by this unit spec.
Task 15: Ruling: capture `previousCover` before update — mocked repositories return the same entity object, so reading `book.cover` after update loses the old key; cost: none in production, one local variable.
Task 15: Ruling: full seed run partially failed in user-owned `LibraryBooks` seeder (`stock_total` null) after permission rows inserted — did not change user seed data; cost: full seed command stays red until that seed data is fixed.
Task 15: complete (no commits, tests: npm test -- book.service.spec library-cover-permission.spec → 8 passed; build: PASS; DB verified: `library:book:update-cover` present with `Officer` and `Superadmin`).
Repo note: user commit `7918b56` committed Task 15 — keep as-is, no revert.
Task 5 pre-flight: consumes `Member`, `Loan`, `ResourceService`, `ResourceQuery`, `StoreService` from earlier tasks — names and paths match current code; no conflict.
Task 5: Ruling: use `IsOptionalNonNull` on `UpdateMemberDto.code`, `.name`, `.active` — `PartialType` converts required fields to `IsOptional`, which accepts null; matches user instruction and book/category pattern; cost: three explicit overrides in update DTO.
Task 5: Ruling: add update-DTO null validation test to `member.service.spec.ts` — user supplied the nullability rule as an explicit requirement; cost: one extra small test.
Task 5: complete (no commits, tests: npm test -- member.service.spec → 2 passed; build: PASS).
Repo note: user commit `70dbe59` committed Task 5 — keep as-is, no revert.
Task 6 pre-flight: consumes `Book`, `Member`, `Loan`, `LoanStatus`, `ResourceService`, `ResourceQuery`, `StoreService`, and `LibraryModule` from earlier tasks — names and paths match current code; no conflict.
Task 6: Ruling: add successful-return stock/lock assertion beyond plan's four tests — Review Focus requires return path to pin row lock and stock increment; cost: one extra small test.
Task 6: complete (no commits, tests: npm test -- loan.service.spec → 5 passed; build: PASS).
Repo note: user commit `3b2a48c` committed Task 6 — keep as-is, no revert.
Task 7 pre-flight: consumes `Book`, `Member`, `Loan`, `LoanStatus`, and `LibraryModule` from earlier tasks — names and paths match current code; no conflict.
Task 7: complete (no commits, tests: npm test -- report.service.spec → 1 passed; build: PASS; runtime: summary on current DB returned counts).
Repo note: user accepted Task 7 and committed `dc050b8 feat(library): report`.
Web review: no web tasks executed; plan updated only.
Web review: Ruling: add Task 16 `/officer` portal guarded by `portal:officer:access` and reuse admin library page components from Tasks 8-12 instead of duplicating feature slices — smallest change that gives Petugas a portal while Admin keeps its existing library pages; cost: officer routes couple to admin page files.
Web review: Ruling: officer dashboard renders `ReportsPage`; admin dashboard stays `AdminPage` and admin gets no Reports route/menu — user explicitly contrasted the two portals; cost: officer shows report both on dashboard and in menu.
Web review: Ruling: report page moves to `web/src/app/routes/officer/library/reports.page.tsx` in Task 13 — report is officer-only, so no admin page needed; cost: no report page under admin paths.
Web review: Ruling: officer portal tile reuses existing `Logo` asset — no officer-specific image exists; cost: generic tile icon until an asset is supplied.
Web review: Ruling: remove home page work from Task 14 and add Task 17 with `copywriting` skill — user asked for a dedicated creative task; cost: `/catalog` and `/loans` links exist only after Task 17.
Task 8 pre-flight: consumes the existing role feature and admin route/menu patterns; no interface conflict; web has no test runner.
Task 8: Ruling: defer the browser CRUD manual check — user forbade running dev servers until the end; static verification is typecheck, lint, and production build; cost: create/edit/archive/restore/delete not clicked through yet.
Task 8: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS; manual check deferred).
