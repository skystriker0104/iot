import type { ActionRecord, ActionQueryParams, PagedResponse } from '../types';
import { DeviceActionEnum, DeviceStatusEnum } from '../constants/enums';
import { INITIAL_ACTION_RECORDS } from '../constants/mockData';
import { apiClient } from './client';

let mockHistoryCache: ActionRecord[] = [...INITIAL_ACTION_RECORDS];

export function appendMockHistory(record: ActionRecord): void {
  mockHistoryCache = [record, ...mockHistoryCache];
}

// Route chuẩn DOCX Mục 3.4.2: GET /api/device-activity
export async function fetchActionHistoryApi(params: ActionQueryParams): Promise<PagedResponse<ActionRecord>> {
  const { page = 1, pageSize = 10, device = 'all', action = 'all', status = 'all', search = '' } = params;

  try {
    const queryParams = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (device && device !== 'all') queryParams.append('device', device);
    if (action && action !== 'all') queryParams.append('action', action);
    if (status && status !== 'all') queryParams.append('status', status);
    if (search) queryParams.append('search', search);

    const res = await apiClient<any>(`/api/device-activity?${queryParams.toString()}`);
    if (res?.items && Array.isArray(res.items)) {
      const items: ActionRecord[] = res.items.map((r: any) => ({
        id: `#H${r.id}`,
        time: r.createdAt ? new Date(r.createdAt).toLocaleTimeString('vi-VN') : '',
        device: r.deviceName || `Thiết bị #${r.deviceId}`,
        deviceId: r.deviceId,
        action: r.action === 'ON' ? DeviceActionEnum.ON : DeviceActionEnum.OFF,
        status: r.status === 'Success' ? DeviceStatusEnum.SUCCESS :
                r.status === 'Failed' ? DeviceStatusEnum.FAIL : DeviceStatusEnum.LOADING,
        operator: r.userName || 'Hệ thống',
        source: 'MQTT / Web'
      }));

      return {
        items,
        total: res.total || items.length,
        page: res.page || page,
        pageSize: res.pageSize || pageSize,
        totalPages: res.totalPages || Math.ceil((res.total || items.length) / pageSize)
      };
    }
  } catch (err) {
    console.warn('Lỗi lấy /api/device-activity từ BE, dùng fallback:', err);
  }

  let filtered = [...mockHistoryCache];

  if (device !== 'all') {
    filtered = filtered.filter((r) => r.device.toLowerCase().includes(device.toLowerCase()));
  }

  if (action !== 'all') {
    filtered = filtered.filter((r) => r.action === action);
  }

  if (status !== 'all') {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((r) =>
      r.id.toLowerCase().includes(q) ||
      r.time.toLowerCase().includes(q) ||
      r.device.toLowerCase().includes(q) ||
      r.action.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.operator.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages
  };
}
