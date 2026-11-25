import { MigrationInterface, QueryRunner } from 'typeorm';

export class Library1795574606358 implements MigrationInterface {
  name = 'Library1795574606358';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "library"`);
    await queryRunner.query(
      `CREATE TABLE "library"."categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "library"."books" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "subtitle" character varying, "author" character varying NOT NULL, "isbn" character varying, "publisher" character varying, "published_year" integer, "published_place" character varying, "edition" character varying, "language" character varying, "pages" integer, "description" text, "cover" character varying, "shelf_location" character varying, "category_id" uuid NOT NULL, "stock_total" integer NOT NULL, "stock_available" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "CHK_12dd12a465ced0223b1f8bdebc" CHECK ("stock_available" <= "stock_total"), CONSTRAINT "CHK_f08789f4a23e07e697a86aa89a" CHECK ("stock_available" >= 0), CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_46f5b35b90175a660f99810bc9" ON "library"."books"  ("category_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "library"."members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "code" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying, "phone" character varying, "address" text, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_da404b5fd9c390e25338996e2d1" UNIQUE ("user_id"), CONSTRAINT "UQ_8b08a36b59b238402b8c38d1f6f" UNIQUE ("code"), CONSTRAINT "REL_da404b5fd9c390e25338996e2d" UNIQUE ("user_id"), CONSTRAINT "PK_28b53062261b996d9c99fa12404" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "library"."loan_status_enum" AS ENUM('active', 'returned')`,
    );
    await queryRunner.query(
      `CREATE TABLE "library"."loans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "member_id" uuid NOT NULL, "book_id" uuid NOT NULL, "borrowed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "due_at" TIMESTAMP WITH TIME ZONE NOT NULL, "returned_at" TIMESTAMP WITH TIME ZONE, "status" "library"."loan_status_enum" NOT NULL, "handled_by" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_e3a721717a07fdfde6b1ed4e11" CHECK ((status = 'active' AND returned_at IS NULL) OR (status = 'returned' AND returned_at IS NOT NULL)), CONSTRAINT "PK_5c6942c1e13e4de135c5203ee61" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7f4f9757fb65bb6aad252ea1f7" ON "library"."loans"  ("member_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09b09d3d1b8e33c0f8dd4cafa4" ON "library"."loans"  ("book_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a630540e1bb9644436a2258c3d" ON "library"."loans"  ("status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "library"."books" ADD CONSTRAINT "FK_46f5b35b90175a660f99810bc97" FOREIGN KEY ("category_id") REFERENCES "library"."categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "library"."members" ADD CONSTRAINT "FK_da404b5fd9c390e25338996e2d1" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "library"."loans" ADD CONSTRAINT "FK_7f4f9757fb65bb6aad252ea1f76" FOREIGN KEY ("member_id") REFERENCES "library"."members"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "library"."loans" ADD CONSTRAINT "FK_09b09d3d1b8e33c0f8dd4cafa48" FOREIGN KEY ("book_id") REFERENCES "library"."books"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "library"."loans" DROP CONSTRAINT "FK_09b09d3d1b8e33c0f8dd4cafa48"`,
    );
    await queryRunner.query(
      `ALTER TABLE "library"."loans" DROP CONSTRAINT "FK_7f4f9757fb65bb6aad252ea1f76"`,
    );
    await queryRunner.query(
      `ALTER TABLE "library"."members" DROP CONSTRAINT "FK_da404b5fd9c390e25338996e2d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "library"."books" DROP CONSTRAINT "FK_46f5b35b90175a660f99810bc97"`,
    );
    await queryRunner.query(
      `DROP INDEX "library"."IDX_a630540e1bb9644436a2258c3d"`,
    );
    await queryRunner.query(
      `DROP INDEX "library"."IDX_09b09d3d1b8e33c0f8dd4cafa4"`,
    );
    await queryRunner.query(
      `DROP INDEX "library"."IDX_7f4f9757fb65bb6aad252ea1f7"`,
    );
    await queryRunner.query(`DROP TABLE "library"."loans"`);
    await queryRunner.query(`DROP TYPE "library"."loan_status_enum"`);
    await queryRunner.query(`DROP TABLE "library"."members"`);
    await queryRunner.query(
      `DROP INDEX "library"."IDX_46f5b35b90175a660f99810bc9"`,
    );
    await queryRunner.query(`DROP TABLE "library"."books"`);
    await queryRunner.query(`DROP TABLE "library"."categories"`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS "library"`);
  }
}
