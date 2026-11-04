import { SensorTypeEnum, SensorStatusEnum } from '../constants/enums';

export interface SensorDataPoint {
  time: string;
  temp: number;
  light: number;
  humidity: number;
}

export interface SensorRecord {
  id: string;
  time: string;
  sensorType: SensorTypeEnum | string;
  value: number;
  unit: string;
  status: SensorStatusEnum | string;
  deviceId: string;
}

export interface SensorQueryParams {
  search?: string;
  sensorType?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}
