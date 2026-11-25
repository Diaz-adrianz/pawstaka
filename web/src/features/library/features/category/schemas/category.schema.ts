import * as y from 'yup';

const categorySchema = y.object({
  name: y.string().trim().required('Name is required'),
  description: y.string().optional(),
});

type CategoryValues = y.InferType<typeof categorySchema>;

export { categorySchema };
export type { CategoryValues };
