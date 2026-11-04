import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { fetchDevicesApi, type DeviceDto } from '../api/devices';

/**
 * Hook truy vấn danh sách & trạng thái hoạt động của các thiết bị ngoại vi
 */
export function useDevicesQuery(options?: Partial<UseQueryOptions<DeviceDto[], Error>>) {
  return useQuery<DeviceDto[], Error>({
    queryKey: queryKeys.devices.list(),
    queryFn: fetchDevicesApi,
    ...options,
  });
}

