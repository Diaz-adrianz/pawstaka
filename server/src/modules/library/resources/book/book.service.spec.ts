import 'reflect-metadata';
import { ResourceQuery } from '../../../../shared/classes/resource-query.class';
import {
  BookHasActiveLoansException,
  BookStockBelowBorrowedException,
} from '../../classes/exceptions/library.exception';
import { BookService } from './book.service';

jest.mock('file-type', () => ({ fileTypeFromStream: jest.fn() }));

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

    const service = new BookService(bookRepo, categoryRepo, loanRepo, {} as any);
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
    const service = new BookService(bookRepo, {} as any, {} as any, {} as any);

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
    const service = new BookService(bookRepo, {} as any, loanRepo, {} as any);

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
    const service = new BookService(bookRepo, {} as any, loanRepo, {} as any);

    await expect(
      service.delete(new ResourceQuery([['id', 'eq', 'b1']])),
    ).rejects.toBeInstanceOf(BookHasActiveLoansException);
    expect(bookRepo.remove).not.toHaveBeenCalled();
  });

  it('moves cover upload and deletes previous cover', async () => {
    const bookRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1', cover: 'old.jpg' }),
      merge: jest.fn((v, patch) => Object.assign(v, patch)),
      save: jest.fn(async (v) => v),
    } as any;
    const storage = {
      move: jest.fn().mockResolvedValue({ key: 'new.jpg', etag: 'etag' }),
      delete: jest.fn().mockResolvedValue(undefined),
    } as any;
    const service = new BookService(bookRepo, {} as any, {} as any, storage);

    const result = await service.updateCover(
      new ResourceQuery([['id', 'eq', 'b1']]),
      {
        cover: { key: 'temp/key', etag: 'etag' },
      },
    );

    expect(storage.move).toHaveBeenCalledWith(
      'temp/key',
      expect.stringMatching(/^public\/library\/book-covers\/b1\/[0-9a-f-]+$/),
      expect.objectContaining({
        etag: 'etag',
        cacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    expect(storage.delete).toHaveBeenCalledWith('old.jpg');
    expect(result.cover).toBe('new.jpg');
  });

  it('removes cover without moving an upload', async () => {
    const bookRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1', cover: 'old.jpg' }),
      merge: jest.fn((v, patch) => Object.assign(v, patch)),
      save: jest.fn(async (v) => v),
    } as any;
    const storage = {
      move: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    } as any;
    const service = new BookService(bookRepo, {} as any, {} as any, storage);

    await service.updateCover(new ResourceQuery([['id', 'eq', 'b1']]), {
      cover: null,
    });

    expect(storage.move).not.toHaveBeenCalled();
    expect(storage.delete).toHaveBeenCalledWith('old.jpg');
    expect(bookRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ cover: null }),
    );
  });

  it('deletes moved cover when update fails', async () => {
    const bookRepo = {
      findOneOrFail: jest.fn().mockResolvedValue({ id: 'b1', cover: 'old.jpg' }),
      merge: jest.fn(),
      save: jest.fn().mockRejectedValue(new Error('db down')),
    } as any;
    const storage = {
      move: jest.fn().mockResolvedValue({ key: 'new.jpg', etag: 'etag' }),
      delete: jest.fn().mockResolvedValue(undefined),
    } as any;
    const service = new BookService(bookRepo, {} as any, {} as any, storage);

    await expect(
      service.updateCover(new ResourceQuery([['id', 'eq', 'b1']]), {
        cover: { key: 'temp/key', etag: 'etag' },
      }),
    ).rejects.toThrow('db down');
    expect(storage.delete).toHaveBeenCalledWith('new.jpg');
    expect(storage.delete).not.toHaveBeenCalledWith('old.jpg');
  });
});
