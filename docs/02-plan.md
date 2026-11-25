# Sistem Perpustakaan Digital Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a library management app on the existing NestJS + React boilerplate: books, categories, members, borrowing, returns, stock monitoring, and reports.

**Architecture:** One new NestJS `library` module with four TypeORM entities and a transactional loan service. One new React `library` feature folder, surfaced through `/admin/library/*` for Petugas and `/catalog` + `/loans` for Anggota. All access goes through the existing JWT, CASL, and `@Permission` plumbing.

**Tech Stack:** NestJS 11, TypeORM, PostgreSQL, React 19, Vite, TanStack Query/Table, CASL, react-hook-form + yup, shadcn/ui.

**Spec:** `docs/01-overview.md`

## Global Constraints

- Do not add dependencies. Use only packages already in `server/package.json` and `web/package.json`.
- Roles are exactly `Superadmin`, `Officer`, `Member`. `Admin` and `User` are removed.
- Role mapping: **Petugas = `Officer`**, **Anggota = `Member`**, `Superadmin` keeps full access.
- Permission keys are always three parts: `library:<resource>:<action>`.
- Every list endpoint uses `store.buildResourceQuery().addFromDto(query)` so permission conditions apply.
- Master data (`categories`, `books`, `members`) uses soft delete: `createdAt`, `updatedAt`, `deletedAt` as `timestamptz`. Loans are not soft-deleted.
- All IDs are UUIDs. All dates are ISO 8601 UTC (`timestamptz`).
- UI copy stays English, matching the existing app.
- Web has no test runner. Its verification is `npm run typecheck` and `npm run lint`.
- Server unit tests run with `npm test -- <name>` because Jest `rootDir` is `src`.

## Review Focus

1. Borrow when `stockAvailable = 0` must return 409 and leave stock unchanged. Tested in Task 6.
2. Returning the same loan twice must return 409 and increment stock only once. Tested in Task 6.
3. Two returns racing on one loan must serialize on a row lock; the loser sees `returnedAt` set and gets 409. Tested in Task 6.
4. Returning when `stockAvailable = stockTotal` (drifted data) must return 409 rather than exceed total stock. Tested in Task 6.
5. Archiving/deleting a category that still has books, or a book with active loans, must return 409 and keep the record. Tested in Tasks 3 and 4.
6. A failed book-cover update must delete the newly moved permanent object and leave the old cover intact. Tested in Task 15.

---

### Task 1: Library Schema, Entities, and Migration

**Files:**
- Create: `server/src/modules/library/entities/category.entity.ts`
- Create: `server/src/modules/library/entities/book.entity.ts`
- Create: `server/src/modules/library/entities/member.entity.ts`
- Create: `server/src/modules/library/entities/loan.entity.ts`
- Create: `server/src/modules/library/enums/loan-status.enum.ts`
- Create: generated migration `server/src/database/default/migrations/<timestamp>-library.ts` (via migration:generate)

**Interfaces:**
- Produces: `Category`, `Book`, `Member`, `Loan` entities, all in schema `library`.
- Produces: `LoanStatus { ACTIVE = 'active', RETURNED = 'returned' }`.

Entity fields:

```ts
// Category
id: string; name: string; description: string | null; books: Book[];
createdAt: Date; updatedAt: Date; deletedAt: Date;

// Book
id: string; title: string; subtitle: string | null; author: string;
isbn: string | null; publisher: string | null; publishedYear: number | null;
publishedPlace: string | null; edition: string | null; language: string | null;
pages: number | null; description: string | null;
cover: string | null; // S3 object key, not a URL
shelfLocation: string | null;
categoryId: string; category: Category;
stockTotal: number; stockAvailable: number;
createdAt: Date; updatedAt: Date; deletedAt: Date;

// Member
id: string; userId: string | null; user: User | null;
code: string; name: string; email: string | null;
phone: string | null; address: string | null; active: boolean;
createdAt: Date; updatedAt: Date; deletedAt: Date;

// Loan
id: string; memberId: string; member: Member;
bookId: string; book: Book;
borrowedAt: Date; dueAt: Date; returnedAt: Date | null;
status: LoanStatus; handledBy: string | null;
createdAt: Date; updatedAt: Date;
```

- [ ] **Step 1: Create the four entity files and the enum**

Use `@Entity({ schema: 'library', name: '...' })`, `@PrimaryGeneratedColumn('uuid')`, `@Column('varchar')`, `@Column('int')`, `@Column('bool')`, `@Column('text', { nullable: true })`, `@CreateDateColumn({ type: 'timestamptz' })`, `@UpdateDateColumn`, `@DeleteDateColumn` exactly as used by `Role` and `User`.

`Book.categoryId` uses `@Column('uuid', { name: 'category_id' })` plus `@ManyToOne(() => Category, { onDelete: 'RESTRICT' })` and `@JoinColumn({ name: 'category_id' })`. `Member.userId` uses `@Column('uuid', { name: 'user_id', nullable: true, unique: true })` plus `@OneToOne(() => User)` / `@JoinColumn({ name: 'user_id' })`. `Loan.status` uses `@Column('enum', { enum: LoanStatus, enumName: 'loan_status_enum' })`.

Add `@Check` decorators so the generated migration contains the invariants:
- on `Book`: `@Check('"stock_available" >= 0')` and `@Check('"stock_available" <= "stock_total"')`
- on `Loan`: `@Check('(status = \'active\' AND returned_at IS NULL) OR (status = \'returned\' AND returned_at IS NOT NULL)')`

Snake_case columns: `subtitle`, `published_place`, `shelf_location`, `category_id`, `user_id`, `stock_total`, `stock_available`, `cover`, `borrowed_at`, `due_at`, `returned_at`, `handled_by`, `created_at`, `updated_at`, `deleted_at`.

- [ ] **Step 2: Generate the migration**

Ensure the `library` schema exists, then generate:

```bash
cd server && DB=default NAME=library npm run typeorm:migration:generate
```

Inspect the generated `server/src/database/default/migrations/<timestamp>-library.ts`. It must create `library.categories`, `library.books`, `library.members`, `library.loans`, the enum `library.loan_status_enum ('active','returned')`, FKs (`books.category_id -> categories(id)`, `loans.member_id -> members(id)`, `loans.book_id -> books(id)` all `ON DELETE RESTRICT`; `members.user_id -> identity.users(id) ON DELETE SET NULL`), the two `Book` checks, the `Loan` status check, and indexes on `books(category_id)`, `loans(member_id)`, `loans(book_id)`, `loans(status)`. If `CREATE SCHEMA IF NOT EXISTS "library"` is absent, add it as the first statement in `up()`; add it to `down()` as the last drop.

- [ ] **Step 3: Run the migration**

Run: `cd server && DB=default npm run typeorm:migration:run`
Expected: the generated `library` migration runs without error.

---

### Task 2: Roles, Library Permissions, and Per-Entity Seeders

**Files:**
- Modify: `server/src/database/default/data/access-control/roles.data.ts`
- Modify: `server/src/database/default/data/identity/users.data.ts`
- Modify: `server/src/database/default/data/access-control/permissions.data.ts`
- Create: `server/src/database/default/seeds/1789900000001-library-categories.ts`
- Create: `server/src/database/default/seeds/1789900000002-library-books.ts`
- Create: `server/src/database/default/seeds/1789900000003-library-members.ts`

**Interfaces:**
- Consumes: existing `RolesData`, `UsersData`, and `PermissionsData` shapes.
- Produces: roles `Superadmin`, `Officer`, `Member`; library permissions; one seeder per library entity.

- [ ] **Step 1: Replace the `Admin` and `User` roles**

In `roles.data.ts`, set:

```ts
export const RolesData = {
  SUPERADMIN: 'Superadmin',
  OFFICER: 'Officer',
  MEMBER: 'Member',
};
```

In `permissions.data.ts` and `users.data.ts`, replace every `RolesData.ADMIN` with `RolesData.OFFICER` and every `RolesData.USER` with `RolesData.MEMBER`. In `users.data.ts`, use usernames/emails `superadmin@example.com`, `officer@example.com`, `member@example.com` with roles `Superadmin`, `Officer`, `Member` respectively.

For an existing database, delete the obsolete `Admin` and `User` roles and their `role_users` / `role_permissions` rows before reseeding; the existing seeders use `orIgnore()` and will not remove them.

- [ ] **Step 2: Append a `library` module to `PermissionsData`**

Add this object at the end of the `PermissionsData` array:

```ts
{
  name: 'library',
  entries: [
    // category
    { description: 'Create category', permission: 'category:create', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Read category', permission: 'category:read', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }, { name: RolesData.MEMBER }] },
    { description: 'Update category', permission: 'category:update', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Archive category', permission: 'category:archive', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Restore category', permission: 'category:restore', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Delete category', permission: 'category:delete', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },

    // book
    { description: 'Create book', permission: 'book:create', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Read book', permission: 'book:read', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }, { name: RolesData.MEMBER }] },
    { description: 'Update book', permission: 'book:update', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Archive book', permission: 'book:archive', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Restore book', permission: 'book:restore', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Delete book', permission: 'book:delete', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },

    // member
    { description: 'Create member', permission: 'member:create', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Read member', permission: 'member:read', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Update member', permission: 'member:update', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Archive member', permission: 'member:archive', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Restore member', permission: 'member:restore', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    { description: 'Delete member', permission: 'member:delete', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },

    // loan
    { description: 'Create loan', permission: 'loan:create', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
    {
      description: 'Read loan',
      permission: 'loan:read',
      roles: [
        { name: RolesData.SUPERADMIN },
        { name: RolesData.OFFICER },
        { name: RolesData.MEMBER, condition: { member: { userId: { eq: '{{actor.id}}' } } } },
      ],
    },
    { description: 'Return loan', permission: 'loan:return', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },

    // report
    { description: 'Read report', permission: 'report:read', roles: [{ name: RolesData.SUPERADMIN }, { name: RolesData.OFFICER }] },
  ],
},
```

- [ ] **Step 3: Create one seeder per entity**

Each seeder implements `Seeder`, uses `.orIgnore()` for idempotency, and logs an inserted/total line like the existing seeders:

- `1789900000001-library-categories.ts`: insert `Fiction`, `Science`
- `1789900000002-library-books.ts`: resolve category IDs by name, then insert:
  - `The Hobbit` / J.R.R. Tolkien / ISBN `9780261102217` / Fiction / total 3
  - `A Brief History of Time` / Stephen Hawking / ISBN `9780553380163` / Science / total 2
  - `Clean Code` / Robert C. Martin / ISBN `9780132350884` / Science / total 1
  - set `stockAvailable = stockTotal`; leave `cover` null
- `1789900000003-library-members.ts`: look up `identity.users` by email `member@example.com`, then insert one member with code `AGT-001`, name `Demo Member`, that email, `userId` (null if absent), `active: true`

- [ ] **Step 4: Run the seed**

Run: `cd server && DB=default npm run typeorm:seed:run`
Expected: log lines include roles, users, permissions, role permissions, and the three library seeders.

---

### Task 3: Category Resource and Library Module

**Files:**
- Create: `server/src/modules/library/library.module.ts`
- Create: `server/src/modules/library/classes/exceptions/library.exception.ts`
- Create: `server/src/modules/library/resources/category/category.service.ts`
- Create: `server/src/modules/library/resources/category/category.controller.ts`
- Create: `server/src/modules/library/resources/category/dto/create-category.dto.ts`
- Create: `server/src/modules/library/resources/category/dto/update-category.dto.ts`
- Create: `server/src/modules/library/resources/category/category.service.spec.ts`
- Modify: `server/src/app.module.ts`

**Interfaces:**
- Consumes: `Category`, `Book`, `ResourceService`, `ResourceQuery`, `StoreService`.
- Produces: `CategoryService.create(dto)`, `findMany(rq)`, `findOne(rq)`, `update(rq, dto)`, `archive(rq)`, `restore(rq)`, `delete(rq)`.
- Produces: `CategoryInUseException extends ConflictException` with message `Category still has books.`

- [ ] **Step 1: Write the failing test**

```ts
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
import { CategoryInUseException } from '../../classes/exceptions/library.exception';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  it('rejects delete when books still reference the category', async () => {
    const categoryRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'c1', name: 'Fiction' }),
      softRemove: jest.fn(),
      remove: jest.fn(),
    } as any;
    const bookRepo = { count: jest.fn().mockResolvedValue(2) } as any;

    const service = new CategoryService(categoryRepo, bookRepo);

    await expect(
      service.delete(new ResourceQuery([['id', 'eq', 'c1']])),
    ).rejects.toBeInstanceOf(CategoryInUseException);
    expect(categoryRepo.softRemove).not.toHaveBeenCalled();
    expect(categoryRepo.remove).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd server && npm test -- category.service.spec`
Expected: FAIL because `CategoryService` does not exist.

- [ ] **Step 3: Implement the DTOs and service**

`CreateCategoryDto`: `name` (`@IsNotEmpty() @IsString()`), `description` (`@IsOptional() @IsString()`). `UpdateCategoryDto extends PartialType(CreateCategoryDto)`.

`CategoryService extends ResourceService<Category>` with constructor `(@InjectRepository(Category, DatabaseKeys.DEFAULT) private categoryRepo, @InjectRepository(Book, DatabaseKeys.DEFAULT) private bookRepo)`. `findMany` uses `findAndCount(rq.toFindOptions())`. `archive` counts non-deleted books with `bookRepo.count({ where: { categoryId: category.id } })` and throws `CategoryInUseException` when greater than zero. `delete` sets `rq.setTrash(true)` before loading the category, then counts with `withDeleted: true` so soft-deleted books still block hard delete.

- [ ] **Step 4: Implement the controller and module**

`CategoryController` at `@Controller('library/categories')`:
- `POST /` `@Permission('library:category:create')`
- `GET /` `@Permission('library:category:read')` + `store.buildResourceQuery().addFromDto(query)`
- `GET /:id` `@Permission('library:category:read')`
- `PATCH /:id` `@Permission('library:category:update')`
- `PATCH /:id/archive` `@Permission('library:category:archive')`
- `PATCH /:id/restore` `@Permission('library:category:restore')`
- `DELETE /:id` `@Permission('library:category:delete')`

`LibraryModule` imports `DefaultDatabaseModule.forFeature([Category, Book])`, declares `CategoryController` and `CategoryService`. Register `LibraryModule` in `AppModule.imports`.

- [ ] **Step 5: Run test and build**

Run: `cd server && npm test -- category.service.spec && npm run build`
Expected: PASS and successful build.

---

### Task 4: Book Resource, Search, and Stock Rules

**Files:**
- Create: `server/src/modules/library/resources/book/book.service.ts`
- Create: `server/src/modules/library/resources/book/book.controller.ts`
- Create: `server/src/modules/library/resources/book/dto/create-book.dto.ts`
- Create: `server/src/modules/library/resources/book/dto/update-book.dto.ts`
- Create: `server/src/modules/library/resources/book/book.service.spec.ts`
- Modify: `server/src/modules/library/library.module.ts`
- Modify: `server/src/modules/library/classes/exceptions/library.exception.ts`

**Interfaces:**
- Consumes: `Book`, `Category`, `Loan`, `LoanStatus`.
- Produces: `BookService.create`, `findMany`, `findOne`, `update`, `archive`, `restore`, `delete`.
- Produces: `BookHasActiveLoansException`, `BookStockBelowBorrowedException` (both `ConflictException`).

`CreateBookDto`:
- required: `title`, `author` (`@IsNotEmpty() @IsString()`), `categoryId` (`@IsUUID()`), `stockTotal` (`@IsInt() @Min(0)`)
- optional: `subtitle`, `isbn`, `publisher`, `publishedPlace`, `edition`, `language`, `shelfLocation`, `cover` (`@IsOptional() @IsString()`); `description` (`@IsOptional() @IsString()`); `publishedYear` (`@IsOptional() @IsInt() @Min(1000) @Max(2100)`); `pages` (`@IsOptional() @IsInt() @Min(1)`)

`cover` is an S3 object key (for example `public/library/covers/<uuid>.jpg`), never a URL. `UpdateBookDto extends PartialType(CreateBookDto)`.

- [ ] **Step 1: Write the failing tests**

```ts
import { LoanStatus } from '../../enums/loan-status.enum';
import { BookHasActiveLoansException, BookStockBelowBorrowedException } from '../../classes/exceptions/library.exception';
import { BookService } from './book.service';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';

const dto = { title: 'T', author: 'A', categoryId: 'cat-1', stockTotal: 3 };

describe('BookService', () => {
  it('sets stockAvailable from stockTotal on create', async () => {
    const bookRepo = {
      create: jest.fn((v) => v),
      save: jest.fn(async (v) => v),
    } as any;
    const categoryRepo = { findOneByOrFail: jest.fn().mockResolvedValue({ id: 'cat-1' }) } as any;
    const loanRepo = {} as any;

    const service = new BookService(bookRepo, categoryRepo, loanRepo);
    const result = await service.create(dto);

    expect(result.stockAvailable).toBe(3);
  });

  it('rejects lowering stockTotal below borrowed copies', async () => {
    const bookRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1', stockTotal: 3, stockAvailable: 1 }),
      merge: jest.fn(),
      save: jest.fn(),
    } as any;
    const service = new BookService(bookRepo, {} as any, {} as any);

    await expect(
      service.update(new ResourceQuery([['id', 'eq', 'b1']]), { stockTotal: 1 }),
    ).rejects.toBeInstanceOf(BookStockBelowBorrowedException);
    expect(bookRepo.save).not.toHaveBeenCalled();
  });

  it('rejects archive while an active loan exists', async () => {
    const bookRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1' }),
      softRemove: jest.fn(),
    } as any;
    const loanRepo = { count: jest.fn().mockResolvedValue(1) } as any;
    const service = new BookService(bookRepo, {} as any, loanRepo);

    await expect(
      service.archive(new ResourceQuery([['id', 'eq', 'b1']])),
    ).rejects.toBeInstanceOf(BookHasActiveLoansException);
    expect(bookRepo.softRemove).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test -- book.service.spec`
Expected: FAIL because `BookService` does not exist.

- [ ] **Step 3: Implement `BookService`**

- `create`: verify category exists with `categoryRepo.findOneByOrFail({ id: dto.categoryId })`; set `stockAvailable = stockTotal`; save.
- `update`: load book; when `stockTotal` is provided compute `borrowed = stockTotal - stockAvailable`; throw `BookStockBelowBorrowedException` if the new total is less than `borrowed`; otherwise set `stockAvailable = newTotal - borrowed`. Merge the remaining DTO fields and save.
- `findMany`: `findAndCount({ ...rq.toFindOptions(), relations: { category: true } })`.
- `findOne`: `findOneOrFail` with `relations: { category: true }`.
- `archive` / `delete`: count loans with `where: { bookId, status: LoanStatus.ACTIVE }`; throw `BookHasActiveLoansException` when non-zero. `delete` sets `rq.setTrash(true)` before loading, additionally counts all loans (any status), blocks when non-zero, then `remove`.

- [ ] **Step 4: Implement the controller**

`@Controller('library/books')`, same seven routes as categories, permissions `library:book:*`. `GET /` uses `store.buildResourceQuery().addFromDto(query)`.

- [ ] **Step 5: Register and verify**

Add `Book` to `DefaultDatabaseModule.forFeature`, and `BookController` / `BookService` to `LibraryModule`.

Run: `cd server && npm test -- book.service.spec && npm run build`
Expected: PASS and successful build.

---

### Task 5: Member Resource

**Files:**
- Create: `server/src/modules/library/resources/member/member.service.ts`
- Create: `server/src/modules/library/resources/member/member.controller.ts`
- Create: `server/src/modules/library/resources/member/dto/create-member.dto.ts`
- Create: `server/src/modules/library/resources/member/dto/update-member.dto.ts`
- Create: `server/src/modules/library/resources/member/member.service.spec.ts`
- Modify: `server/src/modules/library/library.module.ts`
- Modify: `server/src/modules/library/classes/exceptions/library.exception.ts`

**Interfaces:**
- Produces: `MemberService` with the same CRUD method names as `CategoryService`.
- Produces: `MemberHasLoansException extends ConflictException`.

`CreateMemberDto`: `code`, `name` (`@IsNotEmpty() @IsString()`), `email` (`@IsOptional() @IsEmail()`), `phone`, `address` (`@IsOptional() @IsString()`), `userId` (`@IsOptional() @IsUUID()`), `active` (`@IsOptional() @IsBoolean()`). `UpdateMemberDto extends PartialType(CreateMemberDto)` and overrides `code`, `name`, `active` with `@IsOptionalNonNull()` so null is rejected for non-null columns.

- [ ] **Step 1: Write the failing test**

```ts
import { MemberHasLoansException } from '../../classes/exceptions/library.exception';
import { MemberService } from './member.service';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';

it('rejects hard delete when loan history exists', async () => {
  const memberRepo = {
    findOneOrFail: jest.fn().mockResolvedValue({ id: 'm1' }),
    remove: jest.fn(),
  } as any;
  const loanRepo = { count: jest.fn().mockResolvedValue(1) } as any;

  const service = new MemberService(memberRepo, loanRepo);

  await expect(
    service.delete(new ResourceQuery([['id', 'eq', 'm1']])),
  ).rejects.toBeInstanceOf(MemberHasLoansException);
  expect(memberRepo.remove).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd server && npm test -- member.service.spec`
Expected: FAIL because `MemberService` does not exist.

- [ ] **Step 3: Implement service, controller, and module**

`MemberService extends ResourceService<Member>`; `findMany` / `findOne` select all columns. `archive` is allowed (soft delete keeps loan history). `delete` sets `rq.setTrash(true)` before loading, counts all loans for the member, throws `MemberHasLoansException` when non-zero, then hard deletes.

`MemberController` at `@Controller('library/members')` with the seven standard routes and permissions `library:member:*`. Add `Member` to `forFeature`, and controller/service to `LibraryModule`.

- [ ] **Step 4: Verify**

Run: `cd server && npm test -- member.service.spec && npm run build`
Expected: PASS and successful build.

---

### Task 6: Loan Resource with Transactional Borrow and Return

**Files:**
- Create: `server/src/modules/library/resources/loan/loan.service.ts`
- Create: `server/src/modules/library/resources/loan/loan.controller.ts`
- Create: `server/src/modules/library/resources/loan/dto/create-loan.dto.ts`
- Create: `server/src/modules/library/resources/loan/loan.service.spec.ts`
- Modify: `server/src/modules/library/library.module.ts`
- Modify: `server/src/modules/library/classes/exceptions/library.exception.ts`

**Interfaces:**
- Consumes: `Book`, `Member`, `Loan`, `LoanStatus`, `@InjectDataSource(DatabaseKeys.DEFAULT)`.
- Produces: `LoanService.borrow(dto: CreateLoanDto, handledBy: string): Promise<Loan>`.
- Produces: `LoanService.returnLoan(id: string): Promise<Loan>`.
- Produces: `LoanService.findMany(rq)`, `findOne(rq)`.
- Produces: `BookOutOfStockException`, `LoanAlreadyReturnedException`, `BookStockConflictException`, `LoanNotFoundException`.

`CreateLoanDto`: `memberId` (`@IsUUID()`), `bookId` (`@IsUUID()`), `dueAt` (`@IsDateString()`).

- [ ] **Step 1: Write the failing tests**

```ts
import { Book } from '../../entities/book.entity';
import { BookOutOfStockException, BookStockConflictException, LoanAlreadyReturnedException } from '../../classes/exceptions/library.exception';
import { LoanService } from './loan.service';

const book = (stockTotal: number, stockAvailable: number) => ({ id: 'b1', stockTotal, stockAvailable });
const member = { id: 'm1', userId: 'u1' };

function setup() {
  const manager = {
    findOne: jest.fn(),
    create: jest.fn((_, v) => v),
    save: jest.fn(async (v) => v),
  };
  const dataSource = { transaction: jest.fn(async (cb) => cb(manager)) };
  const service = new LoanService({} as any, dataSource as any);
  return { manager, dataSource, service };
}

describe('LoanService', () => {
  it('rejects borrow when stock is empty', async () => {
    const { manager, service } = setup();
    manager.findOne.mockResolvedValueOnce(book(1, 0));

    await expect(
      service.borrow({ memberId: 'm1', bookId: 'b1', dueAt: '2026-12-01T00:00:00.000Z' }, 'staff-1'),
    ).rejects.toBeInstanceOf(BookOutOfStockException);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('decrements stock and locks the book row on borrow', async () => {
    const { manager, service } = setup();
    const b = book(2, 2);
    manager.findOne.mockResolvedValueOnce(b).mockResolvedValueOnce(member);

    const loan = await service.borrow(
      { memberId: 'm1', bookId: 'b1', dueAt: '2026-12-01T00:00:00.000Z' },
      'staff-1',
    );

    expect(b.stockAvailable).toBe(1);
    expect(loan.status).toBe('active');
    expect(manager.findOne).toHaveBeenCalledWith(
      Book,
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
  });

  it('rejects a second return and does not touch stock', async () => {
    const { manager, service } = setup();
    manager.findOne.mockResolvedValueOnce({
      id: 'l1',
      bookId: 'b1',
      returnedAt: new Date(),
      status: 'returned',
    });

    await expect(service.returnLoan('l1')).rejects.toBeInstanceOf(LoanAlreadyReturnedException);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('rejects return when available stock already equals total', async () => {
    const { manager, service } = setup();
    manager.findOne
      .mockResolvedValueOnce({ id: 'l1', bookId: 'b1', returnedAt: null, status: 'active' })
      .mockResolvedValueOnce(book(2, 2));

    await expect(service.returnLoan('l1')).rejects.toBeInstanceOf(BookStockConflictException);
    expect(manager.save).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test -- loan.service.spec`
Expected: FAIL because `LoanService` does not exist.

- [ ] **Step 3: Implement `LoanService`**

Constructor: `@InjectRepository(Loan, DatabaseKeys.DEFAULT) loanRepo`, `@InjectDataSource(DatabaseKeys.DEFAULT) dataSource`; call `super(loanRepo)`.

`borrow` runs inside `dataSource.transaction`:
1. `manager.findOne(Book, { where: { id: dto.bookId }, lock: { mode: 'pessimistic_write' } })`; throw `NotFoundException('Book not found.')` when missing, `BookOutOfStockException` when `stockAvailable < 1`.
2. `manager.findOne(Member, { where: { id: dto.memberId } })`; throw `NotFoundException('Member not found.')` when missing.
3. `book.stockAvailable -= 1`; save book.
4. create and save `{ memberId, bookId, borrowedAt: new Date(), dueAt: new Date(dto.dueAt), status: LoanStatus.ACTIVE, handledBy }`.

`returnLoan` runs inside `dataSource.transaction`:
1. `manager.findOne(Loan, { where: { id }, lock: { mode: 'pessimistic_write' } })`; throw `LoanNotFoundException` when missing.
2. throw `LoanAlreadyReturnedException` when `returnedAt` is set.
3. `manager.findOne(Book, { where: { id: loan.bookId }, lock: { mode: 'pessimistic_write' } })`; throw `BookStockConflictException` when `stockAvailable >= stockTotal`.
4. set `loan.returnedAt = new Date()`, `loan.status = LoanStatus.RETURNED`, increment `book.stockAvailable`, save both.

`findMany` uses `findAndCount({ ...rq.toFindOptions(), relations: { member: true, book: true } })`. `findOne` uses `findOneOrFail` with the same relations.

- [ ] **Step 4: Implement the controller**

`@Controller('library/loans')`:
- `POST /` `@Permission('library:loan:create')` → `service.borrow(dto, store.user.id)`
- `GET /` `@Permission('library:loan:read')` → `store.buildResourceQuery().addFromDto(query)`
- `GET /:id` `@Permission('library:loan:read')`
- `PATCH /:id/return` `@Permission('library:loan:return')` → `service.returnLoan(id)`

Add `Loan` to `forFeature`, and controller/service to `LibraryModule`.

- [ ] **Step 5: Run tests and build**

Run: `cd server && npm test -- loan.service.spec && npm run build`
Expected: 5 tests PASS and successful build.

---

### Task 7: Library Report

**Files:**
- Create: `server/src/modules/library/resources/report/report.service.ts`
- Create: `server/src/modules/library/resources/report/report.controller.ts`
- Create: `server/src/modules/library/resources/report/dto/report-query.dto.ts`
- Create: `server/src/modules/library/resources/report/report.service.spec.ts`
- Modify: `server/src/modules/library/library.module.ts`
- Modify: `server/src/modules/library/classes/exceptions/library.exception.ts`

**Interfaces:**
- Produces: `ReportService.summary(query: ReportQueryDto)` returning:

```ts
{
  books: { totalTitles: number; totalStock: number; availableStock: number };
  members: { total: number; active: number };
  loans: { total: number; active: number; overdue: number; returned: number };
  topBooks: { bookId: string; title: string; total: number }[];
}
```

- Produces: `ReportRangeException extends BadRequestException` with message `"from" must be before "to".`

`ReportQueryDto`: `from?` and `to?` both `@IsOptional() @IsDateString()`.

- [ ] **Step 1: Write the failing test**

```ts
import { ReportRangeException } from '../../classes/exceptions/library.exception';
import { ReportService } from './report.service';

it('rejects a reversed date range', async () => {
  const service = new ReportService({} as any, {} as any, {} as any);

  await expect(
    service.summary({ from: '2026-02-01', to: '2026-01-01' }),
  ).rejects.toBeInstanceOf(ReportRangeException);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `cd server && npm test -- report.service.spec`
Expected: FAIL because `ReportService` does not exist.

- [ ] **Step 3: Implement `ReportService`**

Constructor injects `Repository<Book>`, `Repository<Member>`, `Repository<Loan>`. `summary` first throws `ReportRangeException` when `from > to`. Then:
- books: count titles, `SUM(stock_total)`, `SUM(stock_available)` where `deleted_at IS NULL`
- members: count all and count `active = true`, both `WHERE deleted_at IS NULL`
- loans: count all, count `status = 'active'`, count `status = 'returned'`, count overdue where `status = 'active' AND due_at < now()`
- topBooks: group loans by `book_id`, join books, order count desc, limit 5
- when `from` / `to` are provided, add `loan.borrowed_at >= from` and `loan.borrowed_at <= to` to loan counts and top books

Cast aggregate values with `Number(...)` so the response contains numbers, not strings.

- [ ] **Step 4: Implement the controller**

`@Controller('library/reports')` with `GET /summary` and `@Permission('library:report:read')`. Add `ReportController` / `ReportService` to `LibraryModule`.

- [ ] **Step 5: Run test and build**

Run: `cd server && npm test -- report.service.spec && npm run build`
Expected: PASS and successful build.

---

### Task 8: Web Library Foundation and Categories

**Files:**
- Create: `web/src/features/library/index.ts`
- Create: `web/src/features/library/features/category/types/category.type.ts`
- Create: `web/src/features/library/features/category/schemas/category.schema.ts`
- Create: `web/src/features/library/features/category/api/category.api.ts`
- Create: `web/src/features/library/features/category/api/category.query.ts`
- Create: `web/src/features/library/features/category/api/category.mutation.ts`
- Create: `web/src/features/library/features/category/hooks/use-category-mutations.ts`
- Create: `web/src/features/library/features/category/components/category-list.tsx`
- Create: `web/src/features/library/features/category/components/category-form-dialog.tsx`
- Create: `web/src/features/library/features/category/components/category-actions.tsx`
- Create: `web/src/features/library/features/category/index.ts`
- Create: `web/src/app/routes/admin/library/categories.page.tsx`
- Modify: `web/src/app/routes/admin/admin.routes.tsx`
- Modify: `web/src/app/routes/admin/admin.layout.tsx`

**Interfaces:**
- Produces: `Category { id: string; name: string; description?: string | null; createdAt: string; updatedAt: string }`.
- Produces: `CategoryApi`, `categoryKeys`, `useCategories`, `useCategory`, `useCreateCategory`, `useUpdateCategory`, `useArchiveCategory`, `useRestoreCategory`, `useDeleteCategory`.
- Produces: `CategoryList`, `CategoryListSearchFilter`, `CategoryListTrashFilter`, `CategoryListTable`, `CategoryFormDialog`, `CategoryActions`.

- [ ] **Step 1: Create the feature slice**

Mirror `web/src/features/access-control/features/role/`:
- API base `const PRE = '/library/categories/'`.
- Query keys `['library', 'category']` with `lists()`, `list(params)`, `detail(id)`.
- Mutations invalidate `lists()` and `detail(id)`.
- `CategoryFormDialog` handles both create and update. Props: `{ open, onOpenChange, hide, payload?: { id: string } }`. Use `yupResolver` and fields `name`, `description`.
- `CategoryList` follows the `RoleList` context pattern: provider takes optional `query`, `useCategories(query.params)`, search on `{ name: value }`, trash filter, table pagination/sorting.
- `CategoryActions` uses `ResourceActions` with subjects `library:category`.

- [ ] **Step 2: Create the admin page**

`categories.page.tsx` follows `roles.page.tsx`: `Page` / `PageNav` / `PageHeader` / `PageSection` / `Card`. Breadcrumb `Dashboard > Library > Categories`. Create button gated by `<Can I="create" a="library:category">`. Columns: `#`, name, description, actions. Trash mode shows restore/delete; active mode shows edit/archive.

- [ ] **Step 3: Add route and menu**

In `admin.routes.tsx`, add:

```tsx
{
  path: 'library',
  children: [{ path: 'categories', element: <CategoriesPage /> }],
},
```

In `admin.layout.tsx`, add a `Library` menu group containing Categories with `ability: { action: 'read', subject: 'library:category' }` and `RiPriceTag3Line` / `RiPriceTag3Fill` icons.

- [ ] **Step 4: Verify**

Run: `cd web && npm run typecheck && npm run lint`
Expected: both pass.

Manual check: sign in as `officer@example.com`, open `/admin/library/categories`, create, edit, archive, restore, delete.

---

### Task 9: Web Books

**Files:**
- Create: `web/src/features/library/features/book/types/book.type.ts`
- Create: `web/src/features/library/features/book/schemas/book.schema.ts`
- Create: `web/src/features/library/features/book/api/book.api.ts`
- Create: `web/src/features/library/features/book/api/book.query.ts`
- Create: `web/src/features/library/features/book/api/book.mutation.ts`
- Create: `web/src/features/library/features/book/hooks/use-book-mutations.ts`
- Create: `web/src/features/library/features/book/components/book-list.tsx`
- Create: `web/src/features/library/features/book/components/book-form-dialog.tsx`
- Create: `web/src/features/library/features/book/components/book-actions.tsx`
- Create: `web/src/features/library/features/book/components/category-combobox.tsx`
- Create: `web/src/features/library/features/book/index.ts`
- Create: `web/src/app/routes/admin/library/books.page.tsx`
- Modify: `web/src/features/library/index.ts`
- Modify: `web/src/app/routes/admin/admin.routes.tsx`
- Modify: `web/src/app/routes/admin/admin.layout.tsx`

**Interfaces:**
- Produces: `Book { id; title; subtitle?; author; isbn?; publisher?; publishedYear?; publishedPlace?; edition?; language?; pages?; description?; cover?; shelfLocation?; categoryId; category?: Category; stockTotal; stockAvailable; createdAt; updatedAt }`. `cover` is an S3 key.
- Produces: `bookKeys` for cross-feature invalidation.
- Produces: `useBooks`, `useBook`, `BookList`, `BookListSearchFilter`, `BookListTrashFilter`, `BookListTable`, `BookFormDialog`, `BookActions`, `CategoryCombobox`.
- `BookList` accepts an optional `query` prop like `RoleList` so the stock page can control the query.

- [ ] **Step 1: Create the feature slice**

Mirror the category slice with `PRE = '/library/books/'`. Schema: `title`, `author`, `categoryId` required; `stockTotal` number min 0. Optional fields mirror the server DTO: `subtitle`, `isbn`, `publisher`, `publishedPlace`, `edition`, `language`, `shelfLocation`, `cover`, `description`, `publishedYear`, `pages`. `publishedYear` and `pages` use `valueAsNumber` so the API receives numbers; `cover` is entered as an S3 key.

`CategoryCombobox` wraps `AsyncCombobox<Pick<Category, 'id' | 'name'>>` and calls `CategoryApi.findMany({ search: 'name:' + s, limit: 10 })`.

`BookListSearchFilter` sends `search: { title: value, author: value, isbn: value }`. `BookListTable` columns: `#`, title (sortable), author, category name, ISBN, stock (`stockAvailable / stockTotal`), actions.

`BookFormDialog` handles create and update; `stockTotal` is editable, `stockAvailable` is read-only and not sent.

- [ ] **Step 2: Create the page and wire it**

`books.page.tsx` mirrors the categories page, with a create button gated by `library:book` and a category filter in the list (a `CategoryCombobox` that sets `eq.categoryId`).

Add route `{ path: 'books', element: <BooksPage /> }` and menu item Books with `RiBookLine` / `RiBookFill`, subject `library:book`.

- [ ] **Step 3: Verify**

Run: `cd web && npm run typecheck && npm run lint`
Expected: both pass.

Manual check: create a book with `stockTotal: 3`, confirm the table shows `3 / 3`; edit the title; search by title and author.

---

### Task 10: Web Stock Monitoring

**Files:**
- Create: `web/src/features/library/features/book/components/book-stock-filter.tsx`
- Create: `web/src/app/routes/admin/library/stock.page.tsx`
- Modify: `web/src/features/library/features/book/index.ts`
- Modify: `web/src/app/routes/admin/admin.routes.tsx`
- Modify: `web/src/app/routes/admin/admin.layout.tsx`

**Interfaces:**
- Consumes: `BookList`, `BookListTable`, `BookListSearchFilter`, `useResourceQuery`.
- Produces: `BookStockFilter`.

- [ ] **Step 1: Create the stock filter**

`BookStockFilter` renders `Tabs` with `All`, `Out`, `Low`. It receives the `query` from `useResourceQuery` and uses `query.batch`:
- All: set `eq` and `lte` to `undefined`
- Out: set `eq` to `{ stockAvailable: 0 }` and `lte` to `undefined`
- Low: set `eq` to `undefined` and `lte` to `{ stockAvailable: 3 }`

- [ ] **Step 2: Create the stock page**

`stock.page.tsx` uses `useResourceQuery({ page: 1, limit: 10, order: { stockAvailable: 'asc' } })`, wraps `BookList`, shows search + `BookStockFilter`, and renders columns: `#`, title, author, category, stock available, total, status badge (`Out of stock` when 0, `Low` when ≤ 3, `Available` otherwise). No create button and no actions.

- [ ] **Step 3: Add route and menu**

Add `{ path: 'stock', element: <StockPage /> }` and a Stock menu item with `RiArchiveLine` / `RiArchiveFill`, subject `library:book`.

- [ ] **Step 4: Verify**

Run: `cd web && npm run typecheck && npm run lint`
Expected: both pass.

Manual check: the demo `Clean Code` book has stock 1 and appears under `Low`; borrowing it later makes it `Out`.

---

### Task 11: Web Members

**Files:**
- Create: `web/src/features/library/features/member/types/member.type.ts`
- Create: `web/src/features/library/features/member/schemas/member.schema.ts`
- Create: `web/src/features/library/features/member/api/member.api.ts`
- Create: `web/src/features/library/features/member/api/member.query.ts`
- Create: `web/src/features/library/features/member/api/member.mutation.ts`
- Create: `web/src/features/library/features/member/hooks/use-member-mutations.ts`
- Create: `web/src/features/library/features/member/components/member-list.tsx`
- Create: `web/src/features/library/features/member/components/member-form-dialog.tsx`
- Create: `web/src/features/library/features/member/components/member-actions.tsx`
- Create: `web/src/features/library/features/member/index.ts`
- Create: `web/src/app/routes/admin/library/members.page.tsx`
- Modify: `web/src/features/library/index.ts`
- Modify: `web/src/app/routes/admin/admin.routes.tsx`
- Modify: `web/src/app/routes/admin/admin.layout.tsx`

**Interfaces:**
- Produces: `Member { id; code; name; email?; phone?; address?; userId?; active; createdAt; updatedAt }`.
- Produces: `useMembers`, `useMember`, `MemberList`, `MemberListSearchFilter`, `MemberListTrashFilter`, `MemberListTable`, `MemberFormDialog`, `MemberActions`.

- [ ] **Step 1: Create the feature slice**

Mirror the category slice with `PRE = '/library/members/'`. Schema: `code` and `name` required; `email` optional email; `phone`, `address` optional strings; `active` boolean. Search sends `{ code: value, name: value, email: value }`. Columns: `#`, code, name, email, phone, active badge, actions.

- [ ] **Step 2: Create the page and wire it**

`members.page.tsx` mirrors the categories page. Add route `{ path: 'members', element: <MembersPage /> }` and menu item Members with `RiTeamLine` / `RiTeamFill`, subject `library:member`.

- [ ] **Step 3: Verify**

Run: `cd web && npm run typecheck && npm run lint`
Expected: both pass.

Manual check: create member `AGT-002`, edit the phone, archive and restore it.

---

### Task 12: Web Loans and Returns

**Files:**
- Create: `web/src/features/library/features/loan/types/loan.type.ts`
- Create: `web/src/features/library/features/loan/schemas/loan.schema.ts`
- Create: `web/src/features/library/features/loan/api/loan.api.ts`
- Create: `web/src/features/library/features/loan/api/loan.query.ts`
- Create: `web/src/features/library/features/loan/api/loan.mutation.ts`
- Create: `web/src/features/library/features/loan/hooks/use-loan-mutations.ts`
- Create: `web/src/features/library/features/loan/components/loan-list.tsx`
- Create: `web/src/features/library/features/loan/components/loan-borrow-dialog.tsx`
- Create: `web/src/features/library/features/loan/components/loan-actions.tsx`
- Create: `web/src/features/library/features/loan/components/member-combobox.tsx`
- Create: `web/src/features/library/features/loan/components/book-combobox.tsx`
- Create: `web/src/features/library/features/loan/index.ts`
- Create: `web/src/app/routes/admin/library/loans.page.tsx`
- Modify: `web/src/features/library/index.ts`
- Modify: `web/src/app/routes/admin/admin.routes.tsx`
- Modify: `web/src/app/routes/admin/admin.layout.tsx`

**Interfaces:**
- Produces: `Loan { id; memberId; bookId; member?: Member; book?: Book; borrowedAt; dueAt; returnedAt?; status: 'active' | 'returned'; createdAt }`.
- Produces: `LoanApi.borrow(values)` and `LoanApi.returnLoan(id)`.
- Produces: `useLoans`, `useLoan`, `useBorrowLoan`, `useReturnLoan`, `LoanList`, `LoanBorrowDialog`, `LoanActions`.

- [ ] **Step 1: Create the feature slice**

`PRE = '/library/loans/'`. `LoanApi.borrow` is `POST PRE`, `returnLoan` is `PATCH PRE + id + '/return'`.

`useBorrowLoan` and `useReturnLoan` invalidate `loanKeys.lists()`, `bookKeys.lists()`, and `['library', 'report']` because stock changes affect book tables and reports.

`MemberCombobox` and `BookCombobox` wrap `AsyncCombobox` and call `MemberApi.findMany` / `BookApi.findMany` with string query params (the `ApiParams` type only allows primitives). Use `search: 'name:' + s` for members and `search: 'title:' + s` for books. `BookCombobox` hides empty books with `gt: 'stockAvailable:0'`.

`LoanBorrowDialog` fields: member, book, `dueAt` (DatePickerSingle, default `formatDate(addDays(new Date(), 7), 'yyyy-MM-dd')`). Submit calls `useBorrowLoan`.

`LoanActions` shows Return only for `status === 'active'`, with a confirm dialog.

- [ ] **Step 2: Create the page**

`loans.page.tsx` uses `useResourceQuery({ page: 1, limit: 10, order: { borrowedAt: 'desc' } })`. Columns: `#`, book title, member name, borrowed date, due date, status badge, actions. Status filter tabs: All / Active / Returned; Active and Returned set `eq.status`, All clears `eq` with `query.set('eq', undefined)`. Borrow button gated by `library:loan` create ability.

- [ ] **Step 3: Add route and menu**

Add `{ path: 'loans', element: <LoansPage /> }` and menu item Loans with `RiExchangeLine` / `RiExchangeFill`, subject `library:loan`.

- [ ] **Step 4: Verify**

Run: `cd web && npm run typecheck && npm run lint`
Expected: both pass.

Manual check: borrow a book, confirm stock decreases on `/admin/library/books`; return it, confirm stock increases; try returning again and confirm the button is gone.

---

### Task 13: Web Reports

**Files:**
- Create: `web/src/features/library/features/report/types/report.type.ts`
- Create: `web/src/features/library/features/report/api/report.api.ts`
- Create: `web/src/features/library/features/report/api/report.query.ts`
- Create: `web/src/features/library/features/report/components/report-summary.tsx`
- Create: `web/src/features/library/features/report/components/report-top-books.tsx`
- Create: `web/src/features/library/features/report/index.ts`
- Create: `web/src/app/routes/admin/library/reports.page.tsx`
- Modify: `web/src/features/library/index.ts`
- Modify: `web/src/app/routes/admin/admin.routes.tsx`
- Modify: `web/src/app/routes/admin/admin.layout.tsx`

**Interfaces:**
- Produces: `ReportSummary` matching the Task 7 response exactly.
- Produces: `ReportApi.summary({ from?, to? })`, `useReportSummary({ from?, to? })`, `ReportSummaryCards`, `ReportTopBooks`.

- [ ] **Step 1: Create the report feature**

API: `apiClient.get<ApiResponse<ReportSummary>>('/library/reports/summary', { params })`.

`useReportSummary({ from, to })` uses query key `['library', 'report', 'summary', { from, to }]` and `select: (d) => d.data.data`.

- [ ] **Step 2: Create the page**

`reports.page.tsx` shows two `DatePickerSingle` controls (From, To) and:
- cards: total titles, total stock, available stock, total members, active loans, overdue loans
- a top-books table: rank, title, total loans

The page is read-only and gated by `library:report` read ability.

- [ ] **Step 3: Add route and menu**

Add `{ path: 'reports', element: <ReportsPage /> }` and menu item Reports with `RiBarChart2Line` / `RiBarChart2Fill`, subject `library:report`.

- [ ] **Step 4: Verify**

Run: `cd web && npm run typecheck && npm run lint`
Expected: both pass.

Manual check: after a borrow, active loans increases; after a return, returned count increases; the top-books table lists the borrowed title.

---

### Task 14: Anggota Catalog and My Loans

**Files:**
- Create: `web/src/app/routes/home/catalog/catalog.page.tsx`
- Create: `web/src/app/routes/home/loans/my-loans.page.tsx`
- Modify: `web/src/app/routes/home/home.routes.tsx`
- Modify: `web/src/app/routes/home/home.page.tsx`
- Modify: `web/src/features/library/index.ts`

**Interfaces:**
- Consumes: `BookApi`, `useBooks`, `LoanApi`, `useLoans`, `formatDate`.
- Produces: `/catalog` and `/loans` routes for Anggota.

- [ ] **Step 1: Create the catalog page**

`catalog.page.tsx` uses `useResourceQuery({ page: 1, limit: 12, order: { title: 'asc' } })` and `useBooks(query.params)`. Search input sends `search: { title: value, author: value, isbn: value }`. Render a responsive card grid: title, author, category, ISBN, and a stock badge (`Available`, `Low`, `Out of stock`). No borrow action.

- [ ] **Step 2: Create the my-loans page**

`my-loans.page.tsx` uses `useResourceQuery({ page: 1, limit: 10, order: { borrowedAt: 'desc' } })` and `useLoans(query.params)`. The backend already scopes `loan:read` to the signed-in member through the permission condition, so no client-side filter is needed. Columns: book title, borrowed date, due date, status, returned date.

- [ ] **Step 3: Add routes and home links**

In `home.routes.tsx`, add both pages wrapped in `<AuthRoute>`. In `home.page.tsx`, replace the placeholder with a simple hero and two `Link` buttons: `Browse catalog` → `/catalog`, `My loans` → `/loans`.

- [ ] **Step 4: Verify**

Run: `cd web && npm run typecheck && npm run lint`
Expected: both pass.

Manual check: sign in as `member@example.com`, open `/catalog`, search `Hobbit`, open `/loans`; only the demo member's loans appear.

---

### Task 15: Book Cover Upload

**Files:**
- Create: `server/src/modules/library/resources/book/dto/update-book-cover.dto.ts`
- Modify: `server/src/modules/library/resources/book/book.service.ts`
- Modify: `server/src/modules/library/resources/book/book.controller.ts`
- Modify: `server/src/modules/library/resources/book/dto/update-book.dto.ts`
- Modify: `server/src/modules/library/library.module.ts`
- Modify: `server/src/modules/library/entities/book.entity.ts`
- Modify: `server/src/database/default/data/access-control/permissions.data.ts`
- Modify: `server/src/modules/library/resources/book/book.service.spec.ts`
- Create: `server/src/database/default/data/access-control/library-cover-permission.spec.ts`

**Interfaces:**
- Consumes: `Book`, `BookService`, `StorageService`, `StoreService`, `PermissionsData`.
- Produces: `BookService.updateCover(rq, dto)`, `PATCH /library/books/:id/cover`, permission entry `book:update-cover`.
- `UpdateBookCoverDto` mirrors `UpdateUserAvatarDto`: nullable `IsStorageUploadResult`, same image MIME types, same `2 * MB` cap.
- `Book.cover` remains an S3 object key. `Book.coverUrl` is a computed public URL, mirroring `User.avatarUrl`.
- `UpdateBookDto` extends `PartialType(CreateBookDto)` and keeps `cover` as an internal excluded field, mirroring `UpdateUserDto.avatar`.

- [ ] **Step 1: Write the failing test**

Add to `book.service.spec.ts`, with `jest.mock('file-type', () => ({ fileTypeFromStream: jest.fn() }))` before the tests because Jest cannot parse the ESM dependency pulled in by `StorageService`:

```ts
it('moves cover upload and deletes previous cover', async () => {
  const bookRepo = {
    findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1', cover: 'old.jpg' }),
    merge: jest.fn((v, patch) => Object.assign(v, patch)),
    save: jest.fn(async (v) => v),
  } as any;
  const storage = {
    move: jest.fn().mockResolvedValue({ key: 'new.jpg', etag: 'etag' }),
    delete: jest.fn().mockResolvedValue(undefined),
  } as any;
  const service = new BookService(bookRepo, {} as any, {} as any, storage);

  await service.updateCover(new ResourceQuery([['id', 'eq', 'b1']]), {
    cover: { key: 'temp/key', etag: 'etag' },
  } as any);

  expect(storage.move).toHaveBeenCalledWith(
    'temp/key',
    expect.stringMatching(/^public\/library\/book-covers\/b1\//),
    expect.objectContaining({ etag: 'etag' }),
  );
  expect(storage.delete).toHaveBeenCalledWith('old.jpg');
});

it('removes cover without moving an upload', async () => {
  const bookRepo = {
    findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1', cover: 'old.jpg' }),
    merge: jest.fn((v, patch) => Object.assign(v, patch)),
    save: jest.fn(async (v) => v),
  } as any;
  const storage = {
    move: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
  } as any;
  const service = new BookService(bookRepo, {} as any, {} as any, storage);

  await service.updateCover(new ResourceQuery([['id', 'eq', 'b1']]), {
    cover: null,
  });

  expect(storage.move).not.toHaveBeenCalled();
  expect(storage.delete).toHaveBeenCalledWith('old.jpg');
  expect(bookRepo.save).toHaveBeenCalledWith(
    expect.objectContaining({ cover: null }),
  );
});

it('deletes moved cover when update fails', async () => {
  const bookRepo = {
    findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1', cover: 'old.jpg' }),
    merge: jest.fn(),
    save: jest.fn().mockRejectedValue(new Error('db down')),
  } as any;
  const storage = {
    move: jest.fn().mockResolvedValue({ key: 'new.jpg', etag: 'etag' }),
    delete: jest.fn().mockResolvedValue(undefined),
  } as any;
  const service = new BookService(bookRepo, {} as any, {} as any, storage);

  await expect(
    service.updateCover(new ResourceQuery([['id', 'eq', 'b1']]), {
      cover: { key: 'temp/key', etag: 'etag' },
    } as any),
  ).rejects.toThrow('db down');
  expect(storage.delete).toHaveBeenCalledWith('new.jpg');
  expect(storage.delete).not.toHaveBeenCalledWith('old.jpg');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd server && npm test -- book.service.spec library-cover-permission.spec`
Expected: FAIL because `BookService.updateCover`, its fourth constructor argument, and the permission entry do not exist.

- [ ] **Step 3: Implement the book cover route**

Create `update-book-cover.dto.ts` mirroring `update-user-avatar.dto.ts` with `cover` as the upload field. Add `coverUrl` with `@AfterLoad()` to `Book`. Mark `cover` excluded in `UpdateBookDto`. Add `StorageService` as the fourth `BookService` constructor dependency. Implement `updateCover` using the same move / update / delete-old / cleanup-on-failure flow as `UserService.updateAvatar`, destination prefix `public/library/book-covers/<book.id>/`. Add `@Permission('library:book:update-cover') @Patch(':id/cover')` to `BookController`. Import `StorageModule` in `LibraryModule`. Add permission entry `book:update-cover` under the library book section with `Superadmin` and `Officer` roles.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd server && npm test -- book.service.spec && npm run build`
Expected: PASS and successful build.

- [ ] **Step 5: Verify permission data**

Add `library-cover-permission.spec.ts` asserting `PermissionsData` has `book:update-cover` with `Superadmin` and `Officer` roles.

Run: `cd server && npm test -- library-cover-permission.spec && npm run build`
Expected: PASS and successful build.

- [ ] **Step 6: Apply permission seed**

Run: `cd server && SEED_USERS_PASSWORD=seedpass DB=default npm run typeorm:seed:run`.
Expected: `permissions` inserts the new `book:update-cover` row and `role_permissions` inserts `Superadmin` and `Officer` mappings.

---

## Final Verification

- [ ] Run `cd server && npm run build && npm test`
- [ ] Run `cd web && npm run typecheck && npm run lint && npm run build:prod`
- [ ] Start server: `cd server && npm run start:dev`
- [ ] Start web: `cd web && npm run dev`
- [ ] As `officer@example.com`: create category → create book with stock 1 → create member → borrow the book → confirm stock 0 → return → confirm stock 1 → confirm double return is impossible.
- [ ] As `member@example.com`: `/catalog` lists books, `/loans` shows only own loans.
- [ ] Confirm permission denial: a `Member` opening `/admin/library/books` is redirected by `CanRoute`.
