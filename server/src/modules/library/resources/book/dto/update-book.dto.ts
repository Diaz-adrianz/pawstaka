import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { IsOptionalNonNull } from '../../../../../common/decorators/validators/is-optional-non-null.validator';
import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @IsOptionalNonNull()
  @IsString()
  title?: string;

  @IsOptionalNonNull()
  @IsString()
  author?: string;

  @IsOptionalNonNull()
  @IsUUID()
  categoryId?: string;

  @IsOptionalNonNull()
  @IsInt()
  @Min(0)
  stockTotal?: number;
}
