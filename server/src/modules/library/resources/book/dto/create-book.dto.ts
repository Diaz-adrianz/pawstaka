import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  subtitle?: string | null;

  @IsNotEmpty()
  @IsString()
  author: string;

  @IsOptional()
  @IsString()
  isbn?: string | null;

  @IsOptional()
  @IsString()
  publisher?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(2100)
  publishedYear?: number | null;

  @IsOptional()
  @IsString()
  publishedPlace?: string | null;

  @IsOptional()
  @IsString()
  edition?: string | null;

  @IsOptional()
  @IsString()
  language?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number | null;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  shelfLocation?: string | null;

  @IsUUID()
  categoryId: string;

  @IsInt()
  @Min(0)
  stockTotal: number;
}
