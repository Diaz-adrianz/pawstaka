import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseKeys } from '../../../../database/database-keys.constant';
import { ReportRangeException } from '../../classes/exceptions/library.exception';
import { Book } from '../../entities/book.entity';
import { Loan } from '../../entities/loan.entity';
import { Member } from '../../entities/member.entity';
import { LoanStatus } from '../../enums/loan-status.enum';
import { ReportQueryDto } from './dto/report-query.dto';

type CountRow = {
  total?: string;
  active?: string;
  returned?: string;
  overdue?: string;
};

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Book, DatabaseKeys.DEFAULT)
    private bookRepo: Repository<Book>,
    @InjectRepository(Member, DatabaseKeys.DEFAULT)
    private memberRepo: Repository<Member>,
    @InjectRepository(Loan, DatabaseKeys.DEFAULT)
    private loanRepo: Repository<Loan>,
  ) {}

  async summary(query: ReportQueryDto) {
    if (
      query.from &&
      query.to &&
      new Date(query.from).getTime() > new Date(query.to).getTime()
    )
      throw new ReportRangeException();

    const booksQb = this.bookRepo
      .createQueryBuilder('book')
      .select('COUNT(book.id)', 'totalTitles')
      .addSelect('COALESCE(SUM(book.stockTotal), 0)', 'totalStock')
      .addSelect('COALESCE(SUM(book.stockAvailable), 0)', 'availableStock')
      .where('book.deletedAt IS NULL');

    const membersQb = this.memberRepo
      .createQueryBuilder('member')
      .select('COUNT(member.id)', 'total')
      .addSelect(
        'COUNT(member.id) FILTER (WHERE member.active = true)',
        'active',
      )
      .where('member.deletedAt IS NULL');

    const loansQb = this.loanRepo
      .createQueryBuilder('loan')
      .select('COUNT(loan.id)', 'total')
      .addSelect(
        'COUNT(loan.id) FILTER (WHERE loan.status = :active)',
        'active',
      )
      .addSelect(
        'COUNT(loan.id) FILTER (WHERE loan.status = :returned)',
        'returned',
      )
      .addSelect(
        'COUNT(loan.id) FILTER (WHERE loan.status = :active AND loan.dueAt < NOW())',
        'overdue',
      )
      .setParameters({
        active: LoanStatus.ACTIVE,
        returned: LoanStatus.RETURNED,
      });

    const topBooksQb = this.loanRepo
      .createQueryBuilder('loan')
      .innerJoin('loan.book', 'book')
      .select('book.id', 'bookId')
      .addSelect('book.title', 'title')
      .addSelect('COUNT(loan.id)', 'total')
      .groupBy('book.id')
      .addGroupBy('book.title')
      .orderBy('COUNT(loan.id)', 'DESC')
      .limit(5);

    if (query.from) {
      loansQb.andWhere('loan.borrowedAt >= :from', { from: query.from });
      topBooksQb.andWhere('loan.borrowedAt >= :from', { from: query.from });
    }
    if (query.to) {
      loansQb.andWhere('loan.borrowedAt <= :to', { to: query.to });
      topBooksQb.andWhere('loan.borrowedAt <= :to', { to: query.to });
    }

    const [books, members, loans, topBooks] = await Promise.all([
      booksQb.getRawOne<{
        totalTitles: string;
        totalStock: string;
        availableStock: string;
      }>(),
      membersQb.getRawOne<{ total: string; active: string }>(),
      loansQb.getRawOne<CountRow>(),
      topBooksQb.getRawMany<{ bookId: string; title: string; total: string }>(),
    ]);

    return {
      books: {
        totalTitles: Number(books?.totalTitles ?? 0),
        totalStock: Number(books?.totalStock ?? 0),
        availableStock: Number(books?.availableStock ?? 0),
      },
      members: {
        total: Number(members?.total ?? 0),
        active: Number(members?.active ?? 0),
      },
      loans: {
        total: Number(loans?.total ?? 0),
        active: Number(loans?.active ?? 0),
        overdue: Number(loans?.overdue ?? 0),
        returned: Number(loans?.returned ?? 0),
      },
      topBooks: topBooks.map((row) => ({
        bookId: row.bookId,
        title: row.title,
        total: Number(row.total),
      })),
    };
  }
}
