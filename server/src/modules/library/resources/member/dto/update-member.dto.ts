import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsString } from 'class-validator';
import { IsOptionalNonNull } from '../../../../../common/decorators/validators/is-optional-non-null.validator';
import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @IsOptionalNonNull()
  @IsString()
  code?: string;

  @IsOptionalNonNull()
  @IsString()
  name?: string;

  @IsOptionalNonNull()
  @IsBoolean()
  active?: boolean;
}
