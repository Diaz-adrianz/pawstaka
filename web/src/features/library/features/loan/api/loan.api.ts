import { apiClient } from '@/lib/axios/api.client';
import type {
  ApiPaginatedResponse,
  ApiParams,
  ApiResponse,
} from '@/lib/axios/api.type';
import type { LoanValues } from '../schemas/loan.schema';
import type { Loan } from '../types/loan.type';

const PRE = '/library/loans/';

export const LoanApi = {
  findMany: (params: ApiParams) =>
    apiClient.get<ApiPaginatedResponse<Loan>>(PRE, { params }),
  findOne: (id: string) => apiClient.get<ApiResponse<Loan>>(PRE + id),
  borrow: (values: LoanValues) => apiClient.post<ApiResponse>(PRE, values),
  returnLoan: (id: string) =>
    apiClient.patch<ApiResponse>(PRE + id + '/return'),
};
