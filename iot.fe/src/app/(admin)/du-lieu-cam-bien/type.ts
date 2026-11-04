import type { SensorRecord } from '../../../lib/types';

export interface SensorDataFilterState {
  search: string;
  sensorType: string;
  sortOrder: 'asc' | 'desc';
  limit: number;
  currentPage: number;
}

export interface SensorBadgeConfig {
  icon: React.ReactNode;
  cls: string;
  valCls: string;
}
