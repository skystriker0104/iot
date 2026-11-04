import { useEffect } from 'react';
import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from './keys';
import {
  fetchLatestSensorsApi,
  fetchChartDataApi,
  fetchSensorHistoryApi,
  createSensorRecordsFromRealtime,
  type SensorLatestDto,
} from '../api/sensors';
import { signalRService, type BackendSensorRecordDto } from '../signalr/signalrService';
import { SensorStatusEnum } from '../constants/enums';
import type { SensorDataPoint, SensorRecord, SensorQueryParams, PagedResponse } from '../types';

/**
 * Hook truy vấn giá trị tức thời mới nhất của 3 cảm biến
 */
export function useLatestSensorsQuery(options?: Partial<UseQueryOptions<SensorLatestDto[], Error>>) {
  return useQuery<SensorLatestDto[], Error>({
    queryKey: queryKeys.sensors.latest(),
    queryFn: fetchLatestSensorsApi,
    ...options,
  });
}

/**
 * Hook truy vấn chuỗi dữ liệu vẽ biểu đồ biến thiên 20 điểm gần nhất
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
 * Hook truy vấn phân trang, tìm kiếm & lọc dữ liệu lịch sử cảm biến tích hợp SignalR thời gian thực từ Backend
 */
export function useSensorDataQuery(
  params: SensorQueryParams,
  options?: UseSensorDataQueryOptions
) {
  const queryClient = useQueryClient();
  const enableRealtime = options?.enableRealtime ?? true;

  const query = useQuery<PagedResponse<SensorRecord>, Error>({
    queryKey: queryKeys.sensors.history(params),
    queryFn: () => fetchSensorHistoryApi(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });

  // Tích hợp SignalR: Lắng nghe sự kiện ReceiveNewSensorRecords (từ DB) & ReceiveSensorData (tức thời)
  useEffect(() => {
    if (!enableRealtime) return;

    signalRService.init();

    // 1. Khi Backend lưu bản ghi cảm biến mới vào Database, broadcast ReceiveNewSensorRecords với ID thật
    const unsubDbRecords = signalRService.onNewSensorRecords((dbRecords: BackendSensorRecordDto[]) => {
      if (!Array.isArray(dbRecords) || dbRecords.length === 0) return;

      const formattedRecords: SensorRecord[] = dbRecords.map((r) => ({
        id: `#S${r.id}`,
        time: r.createdAt ? new Date(r.createdAt).toLocaleTimeString('vi-VN') : '',
        sensorType: r.sensorName || r.sensorCode,
        value: r.value,
        unit: r.sensorUnit,
        status: r.value > 30.5 ? SensorStatusEnum.WARNING : SensorStatusEnum.NORMAL,
        deviceId: 'ESP8266_01',
      }));

      const isFirstPage = !params.page || params.page === 1;
      const isDescOrder = !params.sortOrder || params.sortOrder === 'desc';

      if (isFirstPage && isDescOrder) {
        queryClient.setQueryData<PagedResponse<SensorRecord>>(
          queryKeys.sensors.history(params),
          (old) => {
            if (!old) return old;

            const filtered =
              params.sensorType && params.sensorType !== 'all'
                ? formattedRecords.filter((r) => r.sensorType === params.sensorType)
                : formattedRecords;

            if (filtered.length === 0) return old;

            // Loại bỏ các bản ghi trùng ID nếu đã có
            const existingIds = new Set(old.items.map((i) => i.id));
            const newUnique = filtered.filter((i) => !existingIds.has(i.id));
            if (newUnique.length === 0) return old;

            const nextItems = [...newUnique, ...old.items].slice(0, params.pageSize || 10);
            return {
              ...old,
              items: nextItems,
              total: old.total + newUnique.length,
            };
          }
        );
      }

      // Đánh dấu stale để tự động refetch khi chuyển trang
      queryClient.invalidateQueries({
        queryKey: queryKeys.sensors.all,
        exact: false,
        refetchType: 'none',
      });
    });

    // 2. Lắng nghe ReceiveSensorData phát tức thời khi nhận MQTT packet
    const unsubRealtime = signalRService.onSensorData((realtime) => {
      const newTriad = createSensorRecordsFromRealtime(realtime);
      const isFirstPage = !params.page || params.page === 1;
      const isDescOrder = !params.sortOrder || params.sortOrder === 'desc';

      if (isFirstPage && isDescOrder) {
        queryClient.setQueryData<PagedResponse<SensorRecord>>(
          queryKeys.sensors.history(params),
          (old) => {
            if (!old) return old;

            const filteredTriad =
              params.sensorType && params.sensorType !== 'all'
                ? newTriad.filter((r) => r.sensorType === params.sensorType)
                : newTriad;

            if (filteredTriad.length === 0) return old;

            const nextItems = [...filteredTriad, ...old.items].slice(0, params.pageSize || 10);
            return {
              ...old,
              items: nextItems,
              total: old.total + filteredTriad.length,
            };
          }
        );
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.sensors.all,
        exact: false,
        refetchType: 'none',
      });
    });

    return () => {
      unsubDbRecords();
      unsubRealtime();
    };
  }, [queryClient, params, enableRealtime]);

  return query;
}
