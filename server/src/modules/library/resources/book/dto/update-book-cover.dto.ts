import { type MediaMimeType } from '../../../../../shared/constants/media-types.constant';
import { MB } from '../../../../../shared/utils/number.util';
import {
  IsStorageUpload,
  type IsStorageUploadResult,
} from '../../../../storage/decorators/validators/is-storage-upload.validator';
import { IsNullable } from '../../../../../common/decorators/validators/is-nullable';

export const BookCoverMimeTypes: MediaMimeType[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const BookCoverMaxSize = 2 * MB;

export class UpdateBookCoverDto {
  @IsNullable()
  @IsStorageUpload({
    mimeTypes: BookCoverMimeTypes,
    maxSize: BookCoverMaxSize,
  })
  cover: IsStorageUploadResult | null;
}
