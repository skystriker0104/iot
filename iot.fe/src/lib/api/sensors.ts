import type { SensorDataPoint, SensorRecord, SensorQueryParams, PagedResponse } from '../types';
import { SensorTypeEnum, SensorStatusEnum } from '../constants/enums';
import { formatAppDateTime } from '../utils/dateTime';
import { formatTime } from '../utils/date';
import { apiClient } from './client';

export interface SensorLatestDto {
  sensorId: number;
  code: string;
  name: string;
  unit: string;
  value: number | null;
  createdAt: string | null;
}

export interface SensorDataDto {
  id: number;
  sensorId: number;
  sensorCode: string;
  sensorName: string;
  sensorUnit: string;
  value: number;
  createdAt: string;
}

interface PagedResultDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// Mã cảm biến của BE ⇄ nhãn hiển thị ở FE
export const SENSOR_CODE_TO_TYPE: Record<string, SensorTypeEnum> = {
  temp: SensorTypeEnum.TEMPERATURE,
  light: SensorTypeEnum.LIGHT,
  humidity: SensorTypeEnum.HUMIDITY,
};

const SENSOR_TYPE_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(SENSOR_CODE_TO_TYPE).map(([code, type]) => [type, code])
);

const WARNING_THRESHOLDS: Record<string, number> = { temp: 30.5, light: 1000, humidity: 80 };

export function isSensorWarning(code: string, value: number): boolean {
  const threshold = WARNING_THRESHOLDS[code];
  return threshold !== undefined && value > threshold;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export function mapSensorRecord(r: SensorDataDto): SensorRecord {
  return {
    id: `#S${r.id}`,
    time: formatAppDateTime(new Date(r.createdAt)),
    sensorType: SENSOR_CODE_TO_TYPE[r.sensorCode] ?? r.sensorName,
    value: round1(r.value),
    unit: r.sensorUnit,
    status: isSensorWarning(r.sensorCode, r.value) ? SensorStatusEnum.WARNING : SensorStatusEnum.NORMAL,
    deviceId: 'ESP8266_01',
  };
}

// GET /api/sensors/latest
export function fetchLatestSensorsApi(): Promise<SensorLatestDto[]> {
  return apiClient<SensorLatestDto[]>('/api/sensors/latest');
}

const CHART_POINTS = 20;

// Biểu đồ Dashboard: 20 lần đo gần nhất (mỗi lần đo = 3 dòng temp/humidity/light cùng thời điểm)
export async function fetchChartDataApi(): Promise<SensorDataPoint[]> {
  const res = await apiClient<PagedResultDto<SensorDataDto>>(
    `/api/sensor-data?page=1&pageSize=${CHART_POINTS * 3}&sortDesc=true`
  );

  const byTime = new Map<string, Partial<SensorDataPoint> & { at: number }>();
  for (const r of res.items) {
    const point = byTime.get(r.createdAt) ?? { at: new Date(r.createdAt).getTime() };
    if (r.sensorCode === 'temp' || r.sensorCode === 'light' || r.sensorCode === 'humidity') {
      point[r.sensorCode] = round1(r.value);
    }
    byTime.set(r.createdAt, point);
  }

  return [...byTime.values()]
    .filter((p) => p.temp !== undefined && p.light !== undefined && p.humidity !== undefined)
    .sort((a, b) => a.at - b.at)
    .slice(-CHART_POINTS)
    .map((p) => ({ time: formatTime(new Date(p.at)), temp: p.temp!, light: p.light!, humidity: p.humidity! }));
}

// Báo cáo mục 3.4.2: GET /api/sensor-data
export async function fetchSensorHistoryApi(params: SensorQueryParams): Promise<PagedResponse<SensorRecord>> {
  const { page = 1, pageSize = 10, sensorType = 'all', sortOrder = 'desc', search = '' } = params;

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortDesc: String(sortOrder !== 'asc'),
  });
  const sensorCode = SENSOR_TYPE_TO_CODE[sensorType];
  if (sensorCode) query.append('sensorCode', sensorCode);
  if (search.trim()) query.append('search', search.trim());

  const res = await apiClient<PagedResultDto<SensorDataDto>>(`/api/sensor-data?${query}`);

  return {
    items: res.items.map(mapSensorRecord),
    total: res.total,
    page: res.page,
    pageSize: res.pageSize,
    totalPages: res.totalPages,
  };
}

/** Lọc phía client cho bản ghi realtime theo bộ lọc loại cảm biến đang chọn. */
export function matchesSensorType(record: SensorRecord, sensorType?: string): boolean {
  return !sensorType || !SENSOR_TYPE_TO_CODE[sensorType] || record.sensorType === sensorType;
}
