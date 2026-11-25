import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

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

export class BookOutOfStockException extends ConflictException {
  constructor() {
    super('Book is out of stock.');
  }
}

export class LoanAlreadyReturnedException extends ConflictException {
  constructor() {
    super('Loan has already been returned.');
  }
}

export class BookStockConflictException extends ConflictException {
  constructor() {
    super('Book stock is inconsistent. Please try again.');
  }
}

export class LoanNotFoundException extends NotFoundException {
  constructor() {
    super('Loan not found.');
  }
}

export class ReportRangeException extends BadRequestException {
  constructor() {
    super('"from" must be before "to".');
  }
}
