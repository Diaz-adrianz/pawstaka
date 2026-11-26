import * as y from 'yup';
import { type CategoryComboboxItem } from '../../category';
import { nullableNumber, nullableString, requiredNumber } from '@/utils/yup';
import type { MimeType } from '@/constants/mimetype.constant';

export const BOOK_COVER_MIME_TYPES: MimeType[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export const BOOK_COVER_MAX_SIZE = 3 * 1024 * 1024;

const createBookSchema = y.object({
  title: y.string().trim().required('Title is required'),
  subtitle: nullableString,
  author: y.string().trim().required('Author is required'),
  isbn: nullableString,
  publisher: nullableString,
  publishedYear: nullableNumber.integer().min(1000).max(2100),
  publishedPlace: nullableString,
  edition: nullableString,
  language: nullableString,
  pages: nullableNumber.integer().min(1),
  description: nullableString,
  shelfLocation: nullableString,
  category: y.mixed<CategoryComboboxItem>().required('Category is required'),
  stockTotal: requiredNumber
    .integer()
    .min(0)
    .required('Stock total is required'),
});

type CreateBookValues = y.InferType<typeof createBookSchema>;

const updateBookSchema = y.object({
  title: y.string().trim().optional(),
  subtitle: nullableString,
  author: y.string().trim().optional(),
  isbn: nullableString,
  publisher: nullableString,
  publishedYear: nullableNumber.integer().min(1000).max(2100),
  publishedPlace: nullableString,
  edition: nullableString,
  language: nullableString,
  pages: nullableNumber.integer().min(1),
  description: nullableString,
  shelfLocation: nullableString,
  category: y.mixed<CategoryComboboxItem>().optional(),
});

type UpdateBookValues = y.InferType<typeof updateBookSchema>;

const updateBookStockSchema = y.object({
  stockTotal: requiredNumber
    .integer()
    .min(0)
    .required('Stock total is required'),
});

type UpdateBookStockValues = y.InferType<typeof updateBookStockSchema>;

export { createBookSchema, updateBookSchema, updateBookStockSchema };
export type { CreateBookValues, UpdateBookValues, UpdateBookStockValues };
