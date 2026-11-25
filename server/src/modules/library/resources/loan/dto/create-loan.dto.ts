import { IsDateString, IsUUID } from 'class-validator';

export class CreateLoanDto {
  @IsUUID()
  memberId: string;

  @IsUUID()
  bookId: string;

  @IsDateString()
  dueAt: string;
}
