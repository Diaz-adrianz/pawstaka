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
Task 9 pre-flight: consumes `CategoryApi`/`Category` from Task 8 and existing list/dialog/combobox patterns; no interface conflict; web has no test runner.
Task 9: Ruling: category filter uses `CategoryCombobox` with `max={1}` and `query.set('eq', …)` directly in the page — plan asks for a combobox filter but not a separate component; cost: page owns filter state instead of the book slice.
Task 9: Ruling: defer the browser create/edit/search manual check — user forbade running dev servers until the end; static verification is typecheck, lint, and production build; cost: table `3 / 3` display and search not clicked through yet.
Task 9: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS; manual check deferred).
Task 9 correction: user ruled `CategoryCombobox` belongs to the category slice and should use `AsyncComboboxSingle` for now — moved the file, exported it from `features/category`, switched form/filter callbacks to a single item, updated plan; cost: no multi-select until `AsyncCombobox` is needed again.
Task 9 correction: re-verified (npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS).
Task 10 pre-flight: consumes `BookList`, `BookListTable`, `BookListSearchFilter`, `useResourceQuery` from Task 9 — names and paths match; no conflict.
Task 10: Ruling: `task-start` script failed (`../subagent-driven-development/scripts` missing) — used the brief already read from the plan and manual ledger appends; cost: no script-generated BASE/test artifact.
Task 10: Ruling: stock page has no route-level `Can` wrapper — menu ability hides it and the plan asks only for no create button/actions; cost: direct URL access relies on server authorization.
Task 10: Ruling: defer the browser stock check — user forbade running dev servers until the end; static verification is typecheck, lint, and production build; cost: `Low`/`Out` tab behavior not clicked through yet.
Task 10: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS; manual check deferred).
Task 11 pre-flight: consumes the category/book slice patterns from Tasks 8-9 — names and paths match; no conflict.
Task 11: Ruling: `email` uses a yup transform from empty string to `undefined` before `.email()` — optional email fields would otherwise reject the blank value the form sends; cost: inferred value is `string | undefined` instead of `string | null`.
Task 11: Ruling: defer the browser member check — user forbade running dev servers until the end; static verification is typecheck, lint, and production build; cost: create/edit/archive/restore not clicked through yet.
Task 11: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS; manual check deferred).
Task 12 pre-flight: consumes `BookApi`/`Book` from Task 9 and `MemberApi`/`Member` from Task 11, plus the server loan DTO (`memberId`, `bookId`, `dueAt`) — names and paths match; no conflict.
Task 12: Ruling: apply the Task 9 combobox-ownership rule to `MemberCombobox`/`BookCombobox` — placed them in their resource slices and wrapped `AsyncComboboxSingle` instead of `AsyncCombobox`; loans pick one member and one book; cost: plan file paths and multi-select behavior differ until a multi-select loan form exists.
Task 12: Ruling: borrow dialog's `dueAt` is a `yyyy-MM-dd` string from `DatePickerSingle`, matching `CreateLoanDto` `@IsDateString` — no extra date serialization; cost: none.
Task 12: Ruling: defer the browser borrow/return check — user forbade running dev servers until the end; static verification is typecheck, lint, and production build; cost: stock decrement/increment and the hidden Return action not clicked through yet.
Task 12: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS; manual check deferred).
Task 13 pre-flight: consumes `ReportService.summary` response from Task 7 — shape matches `books`, `members`, `loans`, `topBooks`; no conflict.
Task 13: Ruling: page is wrapped in `Can I="read" a="library:report"` because Task 16 route wiring does not exist yet — keeps the page read-only and unexposed until the officer portal lands; cost: no route to click through yet.
Task 13: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS).
Task 14 pre-flight: consumes `BookApi`/`useBooks` from Task 9, `LoanApi`/`useLoans` from Task 12, `formatDate` — names and paths match; no conflict.
Task 14: Ruling: `web/src/features/library/index.ts` needed no change — book and loan slices were already exported by Tasks 9 and 12; cost: plan file list overstates the diff.
Task 14: Ruling: catalog/my-loans use `ResourceListPagination` and plain `Table` instead of `DataTable` — the brief asks for a card grid and fixed columns, not sorting/row selection; cost: no sortable headers on these member pages.
Task 14: Ruling: defer the browser member check — user forbade running dev servers until the end; static verification is typecheck, lint, and production build; cost: `/catalog` search and member loan scoping not clicked through yet.
Task 14: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS; manual check deferred).
Task 16 pre-flight: consumes admin library pages from Tasks 8-12 and `ReportsPage` from Task 13 — names and paths match; permission `portal:officer:access` already exists in seed data; no conflict.
Task 16: Ruling: officer layout duplicates the admin sidebar shell instead of extracting a shared portal layout — only two portals exist and the menu groups differ; cost: future portal-shell changes touch two files.
Task 16: Ruling: officer dashboard uses the report icon in the sidebar — dashboard renders `ReportsPage`, matching the portal's primary job; cost: dashboard and Reports share an icon.
Task 16: Ruling: defer the browser portal check — user forbade running dev servers until the end; static verification is typecheck, lint, and production build; cost: portal visibility and redirect behavior not clicked through yet.
Task 16: Ruling: reused admin library pages had a hardcoded `/admin` Dashboard breadcrumb — added `usePortalBase()` so the same pages point at `/officer` when mounted there; cost: one small shared hook.
Task 16: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS; manual check deferred).
Task 17: copy diagnosis: Situation A, blank placeholder, no product-marketing context file; audience is Anggota first, primary action locked to `Browse catalog`.
Task 17: locked copy candidates: headline A `Find a book. Borrow it. Bring it back.` / B `Your library, on one shelf.` / C `The catalog is open.` → A, because it names the three jobs and passes the swap test. Subhead A `Search the catalog, check what is on the shelf, and follow every loan from pickup to return.` / B `Browse titles, see stock, and keep track of what you have borrowed.` / C `A library catalog with the desk work handled.` → A, because every claim maps to a built feature. Sections: `Find a book`, `Borrow at the desk`, `Keep the shelf current`; body lines name search fields, staff loan logging, and stock/report visibility only.
Task 17: complete (no commits, tests: npm run typecheck → PASS; npm run lint → PASS with 13 pre-existing warnings; npm run build:prod → PASS; manual check deferred).
Final review: subagent (9router/Bansos#high) found no Critical/Important; four Minor findings reported.
Final: re-graded cover-key no-op from Minor to Important — a visible field accepted input and silently discarded it because the server DTO has no `cover`; fixed by removing the field and schema key, leaving cover to the Task 15 endpoint; static re-verification typecheck/lint/build PASS (web has no test runner).
Final: re-graded unreturned `toast.promise` from Minor to Important — Save/Borrow re-enabled during the request, allowing double POST and double stock decrement; fixed by returning the promise from book/member/loan submit handlers; static re-verification PASS.
Final: re-graded unlabeled date controls from Minor to Important — screen readers had no label for From/To/Due date; fixed by adding `id` support to `DatePickerSingle` and `htmlFor` on labels; static re-verification PASS.
Final: minor (deferred): clearing optional `publishedYear`, `pages`, or member `email` serializes to `undefined` and is omitted from PATCH, so old values remain; add null sends when clearing is required.
Final: no Critical/Important findings remain.
Final verification: server `npm run build && npm test` → PASS (4 suites, 15 tests); web `npm run typecheck && npm run lint && npm run build:prod` → PASS (13 pre-existing warnings). Dev servers and browser checks not run; manual checks remain deferred.
Final: user accepted and committed as `feat(web): library catalog, loans, reports, and portals`.
