import { apiClient } from '@/lib/axios/api.client';
import type {
  ApiPaginatedResponse,
  ApiParams,
  ApiResponse,
} from '@/lib/axios/api.type';
import type { MemberValues } from '../schemas/member.schema';
import type { Member } from '../types/member.type';

const PRE = '/library/members/';

export const MemberApi = {
  findMany: (params: ApiParams) =>
    apiClient.get<ApiPaginatedResponse<Member>>(PRE, { params }),
  findOne: (id: string) => apiClient.get<ApiResponse<Member>>(PRE + id),
  create: (values: MemberValues) => apiClient.post<ApiResponse>(PRE, values),
  update: (id: string, values: MemberValues) =>
    apiClient.patch<ApiResponse>(PRE + id, values),
  archive: (id: string) => apiClient.patch<ApiResponse>(PRE + id + '/archive'),
  restore: (id: string) => apiClient.patch<ApiResponse>(PRE + id + '/restore'),
  delete: (id: string) => apiClient.delete<ApiResponse>(PRE + id),
};
