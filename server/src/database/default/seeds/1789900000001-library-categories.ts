import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Category } from '../../../modules/library/entities/category.entity';
import { CategoriesData } from '../data/library/categories.data';

export class LibraryCategories1789900000001 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    _: SeederFactoryManager,
  ): Promise<any> {
    const categoryRepo = dataSource.getRepository(Category);

    const existing = await categoryRepo.find({
        where: { name: In(CategoriesData.map((dat) => dat.name)) },
        withDeleted: true,
      }),
      existingNames = new Set(existing.map((category) => category.name));

    const values = CategoriesData.filter((dat) => !existingNames.has(dat.name));

    let inserted = 0;
    if (values.length) {
      const result = await categoryRepo
        .createQueryBuilder()
        .insert()
        .values(values)
        .orIgnore()
        .execute();
      inserted = (result.raw as any[]).length ?? 0;
    }

    console.log(
      `🌱 [library] categories: ${inserted}/${CategoriesData.length} inserted`,
    );
  }
}
