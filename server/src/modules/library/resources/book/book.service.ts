import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { ResourceService } from '../../../../common/services/resource.service';
import { DatabaseKeys } from '../../../../database/database-keys.constant';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
import { StorageService } from '../../../storage/storage.service';
import {
  BookHasActiveLoansException,
  BookStockBelowBorrowedException,
} from '../../classes/exceptions/library.exception';
import { Book } from '../../entities/book.entity';
import { Category } from '../../entities/category.entity';
import { Loan } from '../../entities/loan.entity';
import { LoanStatus } from '../../enums/loan-status.enum';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { IsStorageUploadResult } from '../../../storage/decorators/validators/is-storage-upload.validator';

@Injectable()
export class BookService extends ResourceService<Book> {
  constructor(
    @InjectRepository(Book, DatabaseKeys.DEFAULT)
    private bookRepo: Repository<Book>,
    @InjectRepository(Category, DatabaseKeys.DEFAULT)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Loan, DatabaseKeys.DEFAULT)
    private loanRepo: Repository<Loan>,
    private storage: StorageService,
  ) {
    super(bookRepo);
  }

  async create({ cover, ...dto }: CreateBookDto) {
    await this.categoryRepo.findOneByOrFail({ id: dto.categoryId });

    const data = this.bookRepo.create({
      ...dto,
      id: randomUUID(),
      stockAvailable: dto.stockTotal,
    });
    if (cover) data.cover = await this.putCover(data.id, cover);
    return this.bookRepo.save(data);
  }

  async findMany(rq: ResourceQuery) {
    return this.bookRepo.findAndCount({
      ...rq.toFindOptions(),
      relations: { category: true },
    });
  }

  async findOne(rq: ResourceQuery) {
    return this.bookRepo.findOneOrFail({
      ...rq.toFindOptions(),
      relations: { category: true },
    });
  }

  async update(rq: ResourceQuery, { cover, ...dto }: UpdateBookDto) {
    const data = await this.load(rq.toFindOptions()),
      oldCover = data.cover;

    const { stockTotal, ...rest } = dto;

    if (stockTotal !== undefined) {
      const borrowed = data.stockTotal - data.stockAvailable;
      if (stockTotal < borrowed) throw new BookStockBelowBorrowedException();

      data.stockTotal = stockTotal;
      data.stockAvailable = stockTotal - borrowed;
    }

    this.bookRepo.merge(data, rest);
    if (cover) data.cover = await this.putCover(data.id, cover);

    try {
      const result = await this.bookRepo.save(data);
      if (cover && oldCover) await this.storage.delete(oldCover).catch();
      return result;
    } catch (e) {
      if (cover && data.cover) await this.storage.delete(data.cover).catch();
      throw e;
    }
  }

  async archive(rq: ResourceQuery) {
    const data = await this.load(rq.toFindOptions());

    const activeLoans = await this.loanRepo.count({
      where: { bookId: data.id, status: LoanStatus.ACTIVE },
    });
    if (activeLoans) throw new BookHasActiveLoansException();

    return this.bookRepo.softRemove(data);
  }

  async restore(rq: ResourceQuery) {
    rq.setTrash(true);
    const data = await this.load(rq.toFindOptions());
    return this.bookRepo.recover(data);
  }

  async delete(rq: ResourceQuery) {
    rq.setTrash(true);
    const data = await this.load(rq.toFindOptions());

    const activeLoans = await this.loanRepo.count({
      where: { bookId: data.id, status: LoanStatus.ACTIVE },
    });
    if (activeLoans) throw new BookHasActiveLoansException();

    const loans = await this.loanRepo.count({
      where: { bookId: data.id },
      withDeleted: true,
    });
    if (loans) throw new BookHasActiveLoansException();
    const res = await this.bookRepo.remove(data);
    if (res.cover) await this.storage.delete(res.cover).catch();
    return res;
  }

  // Utils
  // ----------------------------------------------------------------
  private async putCover(id: string, cover: IsStorageUploadResult) {
    return (
      await this.storage.move(
        cover.key,
        `public/library/book-covers/${id}/${randomUUID()}`,
        {
          etag: cover.etag,
          cacheControl: 'public, max-age=31536000, immutable',
        },
      )
    ).key;
  }
}
