import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { queryKeys } from '../queries/keys';
import { sendDeviceControlCommand, type DeviceDto } from '../api/devices';
import { DeviceActionEnum } from '../constants/enums';
import type { DeviceControlPayload, ActionRecord } from '../types';

interface ControlMutationResult {
  success: boolean;
  actionLog: ActionRecord;
}

interface MutationContext {
  previousDevices?: DeviceDto[];
}

/**
 * Mutation hook gửi lệnh điều khiển thiết bị (LED/Relay) qua MQTT với Optimistic Updates
 */
export function useDeviceControlMutation(
  options?: UseMutationOptions<ControlMutationResult, Error, DeviceControlPayload, MutationContext>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DeviceControlPayload) => {
      return await sendDeviceControlCommand(payload);
    },
    ...options,
    onMutate: async ({ deviceId, action }) => {
      // 1. Hủy bỏ bất kỳ truy vấn nào đang chạy để tránh ghi đè dữ liệu lạc quan
      await queryClient.cancelQueries({ queryKey: queryKeys.devices.list() });

      // 2. Snapshot giá trị trước đó
      const previousDevices = queryClient.getQueryData<DeviceDto[]>(queryKeys.devices.list());

      // 3. Cập nhật lạc quan trạng thái trên UI ngay lập tức
      queryClient.setQueryData<DeviceDto[]>(queryKeys.devices.list(), (old = []) =>
        old.map((d) => (d.id === deviceId ? { ...d, isOn: action === DeviceActionEnum.ON } : d))
      );

      return { previousDevices };
    },
    onError: (...args) => {
      const [, , context] = args;
      // Rollback về trạng thái cũ nếu xảy ra lỗi
      if (context?.previousDevices) {
        queryClient.setQueryData(queryKeys.devices.list(), context.previousDevices);
      }
      (options?.onError as any)?.(...args);
    },
    onSuccess: (...args) => {
      // Invalidate lịch sử thao tác để hiển thị ngay hành động vừa thực hiện
      queryClient.invalidateQueries({ queryKey: queryKeys.history.all });
      (options?.onSuccess as any)?.(...args);
    },
    onSettled: (...args) => {
      // Đảm bảo đồng bộ với trạng thái mới nhất từ backend
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.list() });
      (options?.onSettled as any)?.(...args);
    },
  });
}
