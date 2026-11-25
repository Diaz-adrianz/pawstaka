import 'reflect-metadata';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
import {
  BookHasActiveLoansException,
  BookStockBelowBorrowedException,
} from '../../classes/exceptions/library.exception';
import { BookService } from './book.service';

const dto = { title: 'T', author: 'A', categoryId: 'cat-1', stockTotal: 3 };

describe('BookService', () => {
  it('sets stockAvailable from stockTotal on create', async () => {
    const bookRepo = {
      create: jest.fn((v) => v),
      save: jest.fn(async (v) => v),
    } as any;
    const categoryRepo = {
      findOneByOrFail: jest.fn().mockResolvedValue({ id: 'cat-1' }),
    } as any;
    const loanRepo = {} as any;

    const service = new BookService(bookRepo, categoryRepo, loanRepo);
    const result = await service.create(dto);

    expect(result.stockAvailable).toBe(3);
  });

  it('rejects lowering stockTotal below borrowed copies', async () => {
    const bookRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({
        id: 'b1',
        stockTotal: 3,
        stockAvailable: 1,
      }),
      merge: jest.fn(),
      save: jest.fn(),
    } as any;
    const service = new BookService(bookRepo, {} as any, {} as any);

    await expect(
      service.update(new ResourceQuery([['id', 'eq', 'b1']]), {
        stockTotal: 1,
      }),
    ).rejects.toBeInstanceOf(BookStockBelowBorrowedException);
    expect(bookRepo.save).not.toHaveBeenCalled();
  });

  it('rejects archive while an active loan exists', async () => {
    const bookRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1' }),
      softRemove: jest.fn(),
    } as any;
    const loanRepo = { count: jest.fn().mockResolvedValue(1) } as any;
    const service = new BookService(bookRepo, {} as any, loanRepo);

    await expect(
      service.archive(new ResourceQuery([['id', 'eq', 'b1']])),
    ).rejects.toBeInstanceOf(BookHasActiveLoansException);
    expect(bookRepo.softRemove).not.toHaveBeenCalled();
  });

  it('rejects hard delete when any loan history exists', async () => {
    const bookRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1' }),
      remove: jest.fn(),
    } as any;
    const loanRepo = {
      count: jest.fn().mockResolvedValueOnce(0).mockResolvedValueOnce(1),
    } as any;
    const service = new BookService(bookRepo, {} as any, loanRepo);

    await expect(
      service.delete(new ResourceQuery([['id', 'eq', 'b1']])),
    ).rejects.toBeInstanceOf(BookHasActiveLoansException);
    expect(bookRepo.remove).not.toHaveBeenCalled();
  });
});
