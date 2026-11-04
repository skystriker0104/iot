import type { ActionRecord } from '../../../lib/types';

export interface ActionHistoryFilterState {
  search: string;
  deviceFilter: string;
  actionFilter: string;
  statusFilter: string;
  limit: number;
  currentPage: number;
}
