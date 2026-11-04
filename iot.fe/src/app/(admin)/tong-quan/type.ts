import type { SensorDataPoint, DeviceStateMap } from '../../../lib/types';

export type ActiveChartParam = 'all' | 'temp' | 'light' | 'humidity';

export interface ChartTabItem {
  id: ActiveChartParam;
  label: string;
}

export interface DeviceControlConfig {
  key: keyof DeviceStateMap;
  id: number;
  name: string;
  label: string;
  color: string;
}
