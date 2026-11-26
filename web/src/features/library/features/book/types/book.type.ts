import type { Category } from '../../category/types/category.type';

export type Book = {
  id: string;
  title: string;
  subtitle: string | null;
  author: string;
  isbn: string | null;
  publisher: string | null;
  publishedYear: number | null;
  publishedPlace: string | null;
  edition: string | null;
  language: string | null;
  pages: number | null;
  description: string | null;
  cover: string | null;
  coverUrl?: string | null;
  shelfLocation: string | null;
  categoryId: string;
  category?: Category;
  stockTotal: number;
  stockAvailable: number;
  createdAt: string;
  updatedAt: string;
};

// api
export type CreateData = {
  title: string;
  subtitle?: string | null;
  author: string;
  isbn?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  publishedPlace?: string | null;
  edition?: string | null;
  language?: string | null;
  pages?: number | null;
  description?: string | null;
  shelfLocation?: string | null;
  categoryId: string;
  stockTotal: number;
};

export type UpdateData = {
  title?: string;
  subtitle?: string | null;
  author?: string;
  isbn?: string | null;
  publisher?: string | null;
  publishedYear?: number | null;
  publishedPlace?: string | null;
  edition?: string | null;
  language?: string | null;
  pages?: number | null;
  description?: string | null;
  shelfLocation?: string | null;
  categoryId?: string;
  stockTotal?: number;
};
