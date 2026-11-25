import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceService } from '../../../../common/services/resource.service';
import { DatabaseKeys } from '../../../../database/database-keys.constant';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
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

@Injectable()
export class BookService extends ResourceService<Book> {
  constructor(
    @InjectRepository(Book, DatabaseKeys.DEFAULT)
    private bookRepo: Repository<Book>,
    @InjectRepository(Category, DatabaseKeys.DEFAULT)
    private categoryRepo: Repository<Category>,
    @InjectRepository(Loan, DatabaseKeys.DEFAULT)
    private loanRepo: Repository<Loan>,
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

    return this.bookRepo.remove(data);
  }
}
