import type { ActionRecord, ActionQueryParams, PagedResponse } from '../types';
import { DeviceStatusEnum } from '../constants/enums';
import { formatAppDateTime } from '../utils/dateTime';
import { apiClient } from './client';

interface ActionHistoryDto {
  id: number;
  deviceId: number;
  deviceCode: string;
  deviceName: string;
  userId: number | null;
  username: string | null;
  action: string;
  status: 'Pending' | 'Success' | 'Failed';
  createdAt: string;
  respondedAt: string | null;
}

interface PagedResultDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Trạng thái FE ⇄ enum ActionStatus của BE
const STATUS_TO_BE: Record<string, string> = {
  [DeviceStatusEnum.SUCCESS]: 'Success',
  [DeviceStatusEnum.LOADING]: 'Pending',
  [DeviceStatusEnum.FAIL]: 'Failed',
};

const STATUS_FROM_BE: Record<string, DeviceStatusEnum> = {
  Success: DeviceStatusEnum.SUCCESS,
  Pending: DeviceStatusEnum.LOADING,
  Failed: DeviceStatusEnum.FAIL,
};

function mapActionRecord(r: ActionHistoryDto): ActionRecord {
  return {
    id: `#H${r.id}`,
    time: formatAppDateTime(new Date(r.createdAt)),
    device: r.deviceName,
    deviceId: r.deviceId,
    action: r.action,
    status: STATUS_FROM_BE[r.status] ?? r.status,
    operator: r.username === 'admin' ? 'Nguyễn Văn An' : (r.username ?? 'Nguyễn Văn An'),
    source: 'MQTT / Web',
  };
}

// Báo cáo mục 3.4.2: GET /api/device-activity
export async function fetchActionHistoryApi(params: ActionQueryParams): Promise<PagedResponse<ActionRecord>> {
  const { page = 1, pageSize = 10, device = 'all', action = 'all', status = 'all', search = '' } = params;

  const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (device !== 'all') query.append('deviceId', device);
  if (action !== 'all') query.append('action', action);
  if (status !== 'all' && STATUS_TO_BE[status]) query.append('status', STATUS_TO_BE[status]);
  if (search.trim()) query.append('search', search.trim());

  const res = await apiClient<PagedResultDto<ActionHistoryDto>>(`/api/device-activity?${query}`);

  return {
    items: res.items.map(mapActionRecord),
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
    totalPages: res.totalPages,
  };
}
