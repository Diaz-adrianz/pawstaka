import { apiClient } from '@/lib/axios/api.client';
import type {
  ApiPaginatedResponse,
  ApiParams,
  ApiResponse,
} from '@/lib/axios/api.type';
import type { BookValues } from '../schemas/book.schema';
import type { Book } from '../types/book.type';

const PRE = '/library/books/';

export const BookApi = {
  findMany: (params: ApiParams) =>
    apiClient.get<ApiPaginatedResponse<Book>>(PRE, { params }),
  findOne: (id: string) => apiClient.get<ApiResponse<Book>>(PRE + id),
  create: (values: BookValues) => apiClient.post<ApiResponse>(PRE, values),
  update: (id: string, values: BookValues) =>
    apiClient.patch<ApiResponse>(PRE + id, values),
  archive: (id: string) => apiClient.patch<ApiResponse>(PRE + id + '/archive'),
  restore: (id: string) => apiClient.patch<ApiResponse>(PRE + id + '/restore'),
  delete: (id: string) => apiClient.delete<ApiResponse>(PRE + id),
};
