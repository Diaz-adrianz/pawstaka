import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { MediaMimeType } from '../../../../../shared/constants/media-types.constant';
import { MB } from '../../../../../shared/utils/number.util';
import {
  IsStorageUpload,
  IsStorageUploadResult,
} from '../../../../storage/decorators/validators/is-storage-upload.validator';

export const BookCoverMimeTypes: MediaMimeType[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const BookCoverMaxSize = 3 * MB;

export class CreateBookDto {
  @IsOptional()
  @IsStorageUpload({
    mimeTypes: BookCoverMimeTypes,
    maxSize: BookCoverMaxSize,
  })
  cover?: IsStorageUploadResult | null;

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
