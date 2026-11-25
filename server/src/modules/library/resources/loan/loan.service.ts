import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ResourceService } from '../../../../common/services/resource.service';
import { DatabaseKeys } from '../../../../database/database-keys.constant';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
import {
  BookOutOfStockException,
  BookStockConflictException,
  LoanAlreadyReturnedException,
  LoanNotFoundException,
} from '../../classes/exceptions/library.exception';
import { Book } from '../../entities/book.entity';
import { Loan } from '../../entities/loan.entity';
import { Member } from '../../entities/member.entity';
import { LoanStatus } from '../../enums/loan-status.enum';
import { CreateLoanDto } from './dto/create-loan.dto';

@Injectable()
export class LoanService extends ResourceService<Loan> {
  constructor(
    @InjectRepository(Loan, DatabaseKeys.DEFAULT)
    private loanRepo: Repository<Loan>,
    @InjectDataSource(DatabaseKeys.DEFAULT)
    private dataSource: DataSource,
  ) {
    super(loanRepo);
  }

  async borrow(dto: CreateLoanDto, handledBy: string) {
    return this.dataSource.transaction(async (manager) => {
      const book = await manager.findOne(Book, {
        where: { id: dto.bookId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) throw new NotFoundException('Book not found.');
      if (book.stockAvailable < 1) throw new BookOutOfStockException();

      const member = await manager.findOne(Member, {
        where: { id: dto.memberId },
      });
      if (!member) throw new NotFoundException('Member not found.');

      book.stockAvailable -= 1;
      await manager.save(book);

      const loan = manager.create(Loan, {
        memberId: dto.memberId,
        bookId: dto.bookId,
        borrowedAt: new Date(),
        dueAt: new Date(dto.dueAt),
        status: LoanStatus.ACTIVE,
        handledBy,
      });
      return manager.save(loan);
    });
  }

  async returnLoan(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const loan = await manager.findOne(Loan, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!loan) throw new LoanNotFoundException();
      if (loan.returnedAt) throw new LoanAlreadyReturnedException();

      const book = await manager.findOne(Book, {
        where: { id: loan.bookId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!book) throw new NotFoundException('Book not found.');
      if (book.stockAvailable >= book.stockTotal)
        throw new BookStockConflictException();

      loan.returnedAt = new Date();
      loan.status = LoanStatus.RETURNED;
      book.stockAvailable += 1;

      await manager.save(book);
      return manager.save(loan);
    });
  }

  async findMany(rq: ResourceQuery) {
    return this.loanRepo.findAndCount({
      ...rq.toFindOptions(),
      relations: { member: true, book: true },
    });
  }

  async findOne(rq: ResourceQuery) {
    return this.loanRepo.findOneOrFail({
      ...rq.toFindOptions(),
      relations: { member: true, book: true },
    });
  }
}
