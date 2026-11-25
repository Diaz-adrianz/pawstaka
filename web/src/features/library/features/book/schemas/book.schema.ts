import * as y from 'yup';

const bookSchema = y.object({
  title: y.string().trim().required('Title is required'),
  subtitle: y.string().optional(),
  author: y.string().trim().required('Author is required'),
  isbn: y.string().optional(),
  publisher: y.string().optional(),
  publishedYear: y
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .integer()
    .min(1000)
    .max(2100)
    .optional(),
  publishedPlace: y.string().optional(),
  edition: y.string().optional(),
  language: y.string().optional(),
  pages: y
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .integer()
    .min(1)
    .optional(),
  description: y.string().optional(),
  shelfLocation: y.string().optional(),
  categoryId: y.string().required('Category is required'),
  stockTotal: y.number().integer().min(0).required('Stock total is required'),
});

type BookValues = y.InferType<typeof bookSchema>;

export { bookSchema };
export type { BookValues };
