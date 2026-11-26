import * as y from 'yup';
import { type CategoryComboboxItem } from '../../category';
import { nullableNumber, nullableString } from '@/utils/yup';

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
  stockTotal: y.number().integer().min(0).required('Stock total is required'),
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
  stockTotal: y.number().integer().min(0).optional(),
});

type UpdateBookValues = y.InferType<typeof updateBookSchema>;

export { createBookSchema, updateBookSchema };
export type { CreateBookValues, UpdateBookValues };
