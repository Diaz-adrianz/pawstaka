import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsString } from 'class-validator';
import { IsOptionalNonNull } from '../../../../../common/decorators/validators/is-optional-non-null.validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptionalNonNull()
  @IsString()
  name?: string;
}
