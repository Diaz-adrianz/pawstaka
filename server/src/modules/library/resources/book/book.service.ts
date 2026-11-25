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
import { UpdateBookCoverDto } from './dto/update-book-cover.dto';
import { UpdateBookDto } from './dto/update-book.dto';

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

  async create(dto: CreateBookDto) {
    await this.categoryRepo.findOneByOrFail({ id: dto.categoryId });

    const data = this.bookRepo.create({
      ...dto,
      stockAvailable: dto.stockTotal,
    });
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

  async update(rq: ResourceQuery, dto: UpdateBookDto) {
    const data = await this.load(rq.toFindOptions());
    const { stockTotal, ...rest } = dto;

    if (stockTotal !== undefined) {
      const borrowed = data.stockTotal - data.stockAvailable;
      if (stockTotal < borrowed) throw new BookStockBelowBorrowedException();

      data.stockTotal = stockTotal;
      data.stockAvailable = stockTotal - borrowed;
    }

    this.bookRepo.merge(data, rest);
    return this.bookRepo.save(data);
  }

  async updateCover(rq: ResourceQuery, dto: UpdateBookCoverDto) {
    const book = await this.load(rq.toFindOptions());
    const previousCover = book.cover;

    const cover = dto.cover
      ? (
          await this.storage.move(
            dto.cover.key,
            `public/library/book-covers/${book.id}/${randomUUID()}`,
            {
              etag: dto.cover.etag,
              cacheControl: 'public, max-age=31536000, immutable',
            },
          )
        ).key
      : null;

    try {
      const result = await this.update(rq, { cover: cover as string });
      if (previousCover) await this.storage.delete(previousCover).catch();
      return result;
    } catch (e) {
      if (cover) await this.storage.delete(cover).catch();
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
}
