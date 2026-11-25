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
