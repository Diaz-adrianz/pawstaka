import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceService } from '../../../../common/services/resource.service';
import { DatabaseKeys } from '../../../../database/database-keys.constant';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
import { CategoryInUseException } from '../../classes/exceptions/library.exception';
import { Book } from '../../entities/book.entity';
import { Category } from '../../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService extends ResourceService<Category> {
  constructor(
    @InjectRepository(Category, DatabaseKeys.DEFAULT)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Book, DatabaseKeys.DEFAULT)
    private bookRepo: Repository<Book>,
  ) {
    super(categoryRepo);
  }

  async create(dto: CreateCategoryDto) {
    const data = this.categoryRepo.create(dto);
    return this.categoryRepo.save(data);
  }

  async findMany(rq: ResourceQuery) {
    return this.categoryRepo.findAndCount(rq.toFindOptions());
  }

  async findOne(rq: ResourceQuery) {
    return this.categoryRepo.findOneOrFail(rq.toFindOptions());
  }

  async update(rq: ResourceQuery, dto: UpdateCategoryDto) {
    const data = await this.load(rq.toFindOptions());
    this.categoryRepo.merge(data, dto);
    return this.categoryRepo.save(data);
  }

  async archive(rq: ResourceQuery) {
    const data = await this.load(rq.toFindOptions());

    const books = await this.bookRepo.count({
      where: { categoryId: data.id },
    });
    if (books) throw new CategoryInUseException();

    return this.categoryRepo.softRemove(data);
  }

  async restore(rq: ResourceQuery) {
    rq.setTrash(true);
    const data = await this.load(rq.toFindOptions());
    return this.categoryRepo.recover(data);
  }

  async delete(rq: ResourceQuery) {
    rq.setTrash(true);
    const data = await this.load(rq.toFindOptions());

    const books = await this.bookRepo.count({
      where: { categoryId: data.id },
      withDeleted: true,
    });
    if (books) throw new CategoryInUseException();

    return this.categoryRepo.remove(data);
  }
}
