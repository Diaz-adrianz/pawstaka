import { ConflictException } from '@nestjs/common';

export class CategoryInUseException extends ConflictException {
  constructor() {
    super('Category still has books.');
  }
}

export class BookHasActiveLoansException extends ConflictException {
  constructor() {
    super('Book still has active loans.');
  }
}

export class BookStockBelowBorrowedException extends ConflictException {
  constructor() {
    super('Stock total cannot be lower than borrowed copies.');
  }
}

export class MemberHasLoansException extends ConflictException {
  constructor() {
    super('Member still has loans.');
  }
}
