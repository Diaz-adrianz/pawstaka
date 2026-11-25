import { apiClient } from '@/lib/axios/api.client';
import type {
  ApiPaginatedResponse,
  ApiParams,
  ApiResponse,
} from '@/lib/axios/api.type';
import type { Category } from '../types/category.type';
import type { CategoryValues } from '../schemas/category.schema';

const PRE = '/library/categories/';

export const CategoryApi = {
  findMany: (params: ApiParams) =>
    apiClient.get<ApiPaginatedResponse<Category>>(PRE, { params }),
  findOne: (id: string) => apiClient.get<ApiResponse<Category>>(PRE + id),
  create: (values: CategoryValues) =>
    apiClient.post<ApiResponse>(PRE, values),
  update: (id: string, values: CategoryValues) =>
    apiClient.patch<ApiResponse>(PRE + id, values),
  archive: (id: string) => apiClient.patch<ApiResponse>(PRE + id + '/archive'),
  restore: (id: string) => apiClient.patch<ApiResponse>(PRE + id + '/restore'),
  delete: (id: string) => apiClient.delete<ApiResponse>(PRE + id),
};
