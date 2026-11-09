import { useEffect } from 'react';
import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from './keys';
import {
  fetchLatestSensorsApi,
  fetchChartDataApi,
  fetchSensorHistoryApi,
  mapSensorRecord,
  matchesSensorType,
  type SensorLatestDto,
} from '../api/sensors';
import { signalRService } from '../signalr/signalrService';
import type { SensorDataPoint, SensorRecord, SensorQueryParams, PagedResponse } from '../types';

/**
 * Giá trị mới nhất của 3 cảm biến
 */
export function useLatestSensorsQuery(options?: Partial<UseQueryOptions<SensorLatestDto[], Error>>) {
  return useQuery<SensorLatestDto[], Error>({
    queryKey: queryKeys.sensors.latest(),
    queryFn: fetchLatestSensorsApi,
    ...options,
  });
}

/**
 * 20 lần đo gần nhất cho biểu đồ Dashboard
 */
export function useChartDataQuery(options?: Partial<UseQueryOptions<SensorDataPoint[], Error>>) {
  return useQuery<SensorDataPoint[], Error>({
    queryKey: queryKeys.sensors.chart(),
    queryFn: fetchChartDataApi,
    ...options,
  });
}

export interface UseSensorDataQueryOptions extends Partial<UseQueryOptions<PagedResponse<SensorRecord>, Error>> {
  enableRealtime?: boolean;
}

/**
 * Phân trang / tìm kiếm / lọc dữ liệu cảm biến, tự chèn bản ghi mới qua SignalR
 */
export function useSensorDataQuery(params: SensorQueryParams, options?: UseSensorDataQueryOptions) {
  const queryClient = useQueryClient();
  const { enableRealtime = true, ...queryOptions } = options ?? {};

  const query = useQuery<PagedResponse<SensorRecord>, Error>({
    queryKey: queryKeys.sensors.history(params),
    queryFn: () => fetchSensorHistoryApi(params),
    placeholderData: (previousData) => previousData,
    ...queryOptions,
  });

  useEffect(() => {
    if (!enableRealtime) return;

    signalRService.init();

    // BE vừa ghi bản ghi mới vào DB (có Id thật) → chèn lên đầu trang 1 khi đang sort mới nhất trước
    const unsubscribe = signalRService.onNewSensorRecords((dbRecords) => {
      if (!Array.isArray(dbRecords) || dbRecords.length === 0) return;

      const isFirstPage = !params.page || params.page === 1;
      const isDescOrder = !params.sortOrder || params.sortOrder === 'desc';
      const hasSearch = !!params.search?.trim();

      if (isFirstPage && isDescOrder && !hasSearch) {
        const incoming = dbRecords.map(mapSensorRecord).filter((r) => matchesSensorType(r, params.sensorType));

        queryClient.setQueryData<PagedResponse<SensorRecord>>(queryKeys.sensors.history(params), (old) => {
          if (!old || incoming.length === 0) return old;

          const existingIds = new Set(old.items.map((i) => i.id));
          const fresh = incoming.filter((i) => !existingIds.has(i.id));
          if (fresh.length === 0) return old;

          return {
            ...old,
            items: [...fresh, ...old.items].slice(0, params.pageSize || 10),
            total: old.total + fresh.length,
          };
        });
      }

      // Các trang/bộ lọc khác: đánh dấu cũ để lần mở sau tự tải lại
      queryClient.invalidateQueries({ queryKey: queryKeys.sensors.all, refetchType: 'none' });
    });

    return unsubscribe;
  }, [queryClient, params, enableRealtime]);

  return query;
}
