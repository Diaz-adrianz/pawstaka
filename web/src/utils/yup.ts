import * as y from 'yup';
import { isValidDateString } from './date';

export const nullableString = y
  .string()
  .transform((v) => (typeof v === 'string' && v.trim() === '' ? null : v))
  .nullable()
  .optional();

export const nullableNumber = y
  .number()
  .transform((v, orig) =>
    orig === '' || orig === null || Number.isNaN(v) ? null : v
  )
  .nullable()
  .optional();

export const requiredNumber = y
  .number()
  .transform((value) => (Number.isNaN(value) ? undefined : value));

export const strongPassword = y
  .string()
  .min(8)
  .matches(/[a-z]/, 'Must contain lowercase')
  .matches(/[A-Z]/, 'Must contain uppercase')
  .matches(/\d/, 'Must contain number')
  .matches(/[^A-Za-z0-9]/, 'Must contain symbol');

export const matchesPhoneNumber: [RegExp, string] = [
  /^\+[1-9]\d{6,14}$/,
  'Invalid phone number',
];

export const testDateString: [
  string,
  string,
  (value?: string | null | undefined) => boolean,
] = [
  'valid-date',
  'Invalid date',
  (value) => {
    if (!value) return true;
    return isValidDateString(value);
  },
];
