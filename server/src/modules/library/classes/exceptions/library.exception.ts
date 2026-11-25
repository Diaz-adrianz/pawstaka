import { ConflictException } from '@nestjs/common';

export class CategoryInUseException extends ConflictException {
  constructor() {
    super('Category still has books.');
  }
}
