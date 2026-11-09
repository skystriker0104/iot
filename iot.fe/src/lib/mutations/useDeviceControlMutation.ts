import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { queryKeys } from '../queries/keys';
import { sendDeviceControlCommand, type ControlDeviceResponse, type DeviceDto } from '../api/devices';
import { DeviceActionEnum } from '../constants/enums';
import type { DeviceControlPayload } from '../types';

interface MutationContext {
  previousDevices?: DeviceDto[];
}

/**
 * Gửi lệnh bật/tắt LED. UI đổi trạng thái ngay (optimistic), rollback nếu BE trả lỗi (409/503/504...).
 */
export function useDeviceControlMutation(
  options?: UseMutationOptions<ControlDeviceResponse, Error, DeviceControlPayload, MutationContext>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendDeviceControlCommand,
    ...options,
    onMutate: async ({ deviceId, action }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.devices.list() });
      const previousDevices = queryClient.getQueryData<DeviceDto[]>(queryKeys.devices.list());

      queryClient.setQueryData<DeviceDto[]>(queryKeys.devices.list(), (old = []) =>
        old.map((d) => (d.id === deviceId ? { ...d, isOn: action === DeviceActionEnum.ON } : d))
      );

      return { previousDevices };
    },
    onError: (...args) => {
      const [, , context] = args;
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.devices.list(), context.previousDevices);
      }
      (options?.onError as any)?.(...args);
    },
    onSuccess: (...args) => {
      const [res] = args;
      // Trạng thái thật do ESP báo về
      queryClient.setQueryData<DeviceDto[]>(queryKeys.devices.list(), (old = []) =>
        old.map((d) => (d.id === res.deviceId ? { ...d, isOn: res.state.toUpperCase() === 'ON' } : d))
      );
      (options?.onSuccess as any)?.(...args);
    },
    onSettled: (...args) => {
      // Lịch sử có bản ghi mới (Success hoặc Failed)
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
      (options?.onSettled as any)?.(...args);
    },
  });
}
