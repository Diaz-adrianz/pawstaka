import { apiClient } from '@/lib/axios/api.client';
import type {
  ApiPaginatedResponse,
  ApiParams,
  ApiResponse,
} from '@/lib/axios/api.type';
import type { Book, CreateData, UpdateData } from '../types/book.type';

const PRE = '/library/books/';

export const BookApi = {
  findMany: (params: ApiParams) =>
    apiClient.get<ApiPaginatedResponse<Book>>(PRE, { params }),
  findOne: (id: string) => apiClient.get<ApiResponse<Book>>(PRE + id),
  create: (data: CreateData) => apiClient.post<ApiResponse>(PRE, data),
  update: (id: string, data: UpdateData) =>
    apiClient.patch<ApiResponse>(PRE + id, data),
  archive: (id: string) => apiClient.patch<ApiResponse>(PRE + id + '/archive'),
  restore: (id: string) => apiClient.patch<ApiResponse>(PRE + id + '/restore'),
  delete: (id: string) => apiClient.delete<ApiResponse>(PRE + id),
};
