import type { ActionRecord, ActionQueryParams, PagedResponse } from '../types';
import { INITIAL_ACTION_RECORDS } from '../constants/mockData';

let mockHistoryCache: ActionRecord[] = [...INITIAL_ACTION_RECORDS];

export function appendMockHistory(record: ActionRecord): void {
  mockHistoryCache = [record, ...mockHistoryCache];
}

/**
 * Lấy lịch sử hoạt động thiết bị ngoại vi (Chế độ Mock hoàn toàn, không gọi API)
 */
export async function fetchActionHistoryApi(params: ActionQueryParams): Promise<PagedResponse<ActionRecord>> {
  const { page = 1, pageSize = 10, device = 'all', action = 'all', status = 'all', search = '' } = params;

  let filtered = [...mockHistoryCache];

  if (device && device !== 'all') {
    filtered = filtered.filter((r) => r.device.toLowerCase().includes(device.toLowerCase()));
  }

  if (action && action !== 'all') {
    filtered = filtered.filter((r) => r.action === action);
  }

  if (status && status !== 'all') {
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
