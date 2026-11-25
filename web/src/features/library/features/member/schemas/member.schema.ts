import * as y from 'yup';

const memberSchema = y.object({
  code: y.string().trim().required('Code is required'),
  name: y.string().trim().required('Name is required'),
  email: y
    .string()
    .trim()
    .transform((value) => value || undefined)
    .email('Invalid email')
    .optional(),
  phone: y.string().optional(),
  address: y.string().optional(),
  active: y.boolean().required(),
});

type MemberValues = y.InferType<typeof memberSchema>;

export { memberSchema };
export type { MemberValues };
