import 'reflect-metadata';
import {
  BookOutOfStockException,
  BookStockConflictException,
  LoanAlreadyReturnedException,
} from '../../classes/exceptions/library.exception';
import { Book } from '../../entities/book.entity';
import { Loan } from '../../entities/loan.entity';
import { LoanStatus } from '../../enums/loan-status.enum';
import { LoanService } from './loan.service';

const book = (stockTotal: number, stockAvailable: number) => ({
  id: 'b1',
  stockTotal,
  stockAvailable,
});
const member = { id: 'm1', userId: 'u1' };

function setup() {
  const manager = {
    findOne: jest.fn(),
    create: jest.fn((_, v) => v),
    save: jest.fn(async (v) => v),
  };
  const dataSource = { transaction: jest.fn(async (cb) => cb(manager)) };
  const service = new LoanService({} as any, dataSource as any);
  return { manager, dataSource, service };
}

describe('LoanService', () => {
  it('rejects borrow when stock is empty', async () => {
    const { manager, service } = setup();
    manager.findOne.mockResolvedValueOnce(book(1, 0));

    await expect(
      service.borrow(
        {
          memberId: 'm1',
          bookId: 'b1',
          dueAt: '2026-12-01T00:00:00.000Z',
        },
        'staff-1',
      ),
    ).rejects.toBeInstanceOf(BookOutOfStockException);
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('decrements stock and locks the book row on borrow', async () => {
    const { manager, service } = setup();
    const b = book(2, 2);
    manager.findOne.mockResolvedValueOnce(b).mockResolvedValueOnce(member);

    const loan = await service.borrow(
      {
        memberId: 'm1',
        bookId: 'b1',
        dueAt: '2026-12-01T00:00:00.000Z',
      },
      'staff-1',
    );

    expect(b.stockAvailable).toBe(1);
    expect(loan.status).toBe(LoanStatus.ACTIVE);
    expect(manager.findOne).toHaveBeenCalledWith(
      Book,
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
  });

  it('rejects a second return and does not touch stock', async () => {
    const { manager, service } = setup();
    manager.findOne.mockResolvedValueOnce({
      id: 'l1',
      bookId: 'b1',
      returnedAt: new Date(),
      status: LoanStatus.RETURNED,
    });

    await expect(service.returnLoan('l1')).rejects.toBeInstanceOf(
      LoanAlreadyReturnedException,
    );
    expect(manager.save).not.toHaveBeenCalled();
    expect(manager.findOne).toHaveBeenCalledWith(
      Loan,
      expect.objectContaining({
        where: { id: 'l1' },
        lock: { mode: 'pessimistic_write' },
      }),
    );
  });

  it('rejects return when available stock already equals total', async () => {
    const { manager, service } = setup();
    manager.findOne
      .mockResolvedValueOnce({
        id: 'l1',
        bookId: 'b1',
        returnedAt: null,
        status: LoanStatus.ACTIVE,
      })
      .mockResolvedValueOnce(book(2, 2));

    await expect(service.returnLoan('l1')).rejects.toBeInstanceOf(
      BookStockConflictException,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });

  it('increments stock and marks the loan returned', async () => {
    const { manager, service } = setup();
    const loan = {
      id: 'l1',
      bookId: 'b1',
      returnedAt: null,
      status: LoanStatus.ACTIVE,
    };
    const b = book(2, 1);
    manager.findOne
      .mockResolvedValueOnce(loan)
      .mockResolvedValueOnce(b);

    const result = await service.returnLoan('l1');

    expect(b.stockAvailable).toBe(2);
    expect(result.status).toBe(LoanStatus.RETURNED);
    expect(manager.save).toHaveBeenCalledWith(b);
    expect(manager.findOne).toHaveBeenCalledWith(
      Book,
      expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
    );
  });
});
