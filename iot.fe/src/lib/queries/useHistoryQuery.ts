import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { fetchActionHistoryApi } from '../api/history';
import type { ActionRecord, ActionQueryParams, PagedResponse } from '../types';

/**
 * Hook truy vấn phân trang và tìm kiếm lịch sử hành động điều khiển thiết bị
 */
export function useActionHistoryQuery(
  params: ActionQueryParams,
  options?: Partial<UseQueryOptions<PagedResponse<ActionRecord>, Error>>
) {
  return useQuery<PagedResponse<ActionRecord>, Error>({
    queryKey: queryKeys.history.list(params),
    queryFn: () => fetchActionHistoryApi(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

