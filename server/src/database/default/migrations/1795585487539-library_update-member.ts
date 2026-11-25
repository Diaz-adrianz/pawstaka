import { MigrationInterface, QueryRunner } from 'typeorm';

export class LibraryUpdateMember1795585487539 implements MigrationInterface {
  name = 'LibraryUpdateMember1795585487539';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "library"."members" DROP CONSTRAINT "FK_da404b5fd9c390e25338996e2d1"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "library"."members" ADD CONSTRAINT "FK_da404b5fd9c390e25338996e2d1" FOREIGN KEY ("user_id") REFERENCES "identity"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
