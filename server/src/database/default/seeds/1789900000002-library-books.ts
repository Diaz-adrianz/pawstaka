import { DataSource, In } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Book } from '../../../modules/library/entities/book.entity';
import { Category } from '../../../modules/library/entities/category.entity';
import { BooksData } from '../data/library/books.data';

export class LibraryBooks1789900000002 implements Seeder {
  track = false;

  public async run(
    dataSource: DataSource,
    _: SeederFactoryManager,
  ): Promise<any> {
    const bookRepo = dataSource.getRepository(Book),
      categoryRepo = dataSource.getRepository(Category);

    const categories = await categoryRepo.find({
        where: { name: In(BooksData.map((book) => book.categoryName)) },
      }),
      categoryIds = new Map(
        categories.map((category) => [category.name, category.id]),
      );

    const existing = await bookRepo.find({
      where: { title: In(BooksData.map((book) => book.title)) },
      withDeleted: true,
    });
    const existingTitles = new Set(existing.map((book) => book.title));

    const values = BooksData.filter(
      (book) => !existingTitles.has(book.title),
    ).flatMap((book) => {
      const categoryId = categoryIds.get(book.categoryName);
      if (!categoryId) return [];
      return [{ ...book, categoryId }];
    });

    let inserted = 0;
    if (values.length) {
      const result = await bookRepo
        .createQueryBuilder()
        .insert()
        .values(values)
        .orIgnore()
        .execute();
      inserted = (result.raw as any[]).length ?? 0;
    }

    console.log(`🌱 [library] books: ${inserted}/${BooksData.length} inserted`);
  }
}
