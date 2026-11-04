import type { SensorDataPoint, SensorRecord, SensorQueryParams, PagedResponse } from '../types';
import { SensorTypeEnum, SensorStatusEnum } from '../constants/enums';
import { INITIAL_CHART_DATA, INITIAL_SENSOR_RECORDS } from '../constants/mockData';

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
  unit: string;
  value: number;
  createdAt: string;
}

let mockSensorsCache = [...INITIAL_SENSOR_RECORDS];
let mockChartCache: SensorDataPoint[] = [...INITIAL_CHART_DATA];

/**
 * Lấy dữ liệu cảm biến mới nhất cho 3 thẻ chỉ số (Chế độ Mock hoàn toàn)
 */
export async function fetchLatestSensorsApi(): Promise<SensorLatestDto[]> {
  const latestChart = mockChartCache[mockChartCache.length - 1] || { temp: 27.5, light: 420, humidity: 65 };
  return [
    { sensorId: 1, code: 'temp', name: 'Nhiệt độ', unit: '°C', value: latestChart.temp, createdAt: new Date().toISOString() },
    { sensorId: 2, code: 'humidity', name: 'Độ ẩm', unit: '%', value: latestChart.humidity, createdAt: new Date().toISOString() },
    { sensorId: 3, code: 'light', name: 'Ánh sáng', unit: 'Lux', value: latestChart.light, createdAt: new Date().toISOString() }
  ];
}

/**
 * Lấy danh sách điểm dữ liệu vẽ biểu đồ biến thiên (Chế độ Mock hoàn toàn)
 */
export async function fetchChartDataApi(): Promise<SensorDataPoint[]> {
  return [...mockChartCache];
}

/**
 * Truy vấn phân trang, tìm kiếm & lọc dữ liệu lịch sử cảm biến (Chế độ Mock hoàn toàn)
 */
export async function fetchSensorHistoryApi(params: SensorQueryParams): Promise<PagedResponse<SensorRecord>> {
  const { page = 1, pageSize = 10, sensorType = 'all', sortOrder = 'desc', search = '' } = params;

  let filtered = [...mockSensorsCache];

  if (sensorType && sensorType !== 'all') {
    filtered = filtered.filter((s) => s.sensorType === sensorType);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((r) =>
      r.id.toLowerCase().includes(q) ||
      r.time.toLowerCase().includes(q) ||
      r.sensorType.toLowerCase().includes(q) ||
      String(r.value).toLowerCase().includes(q) ||
      r.unit.toLowerCase().includes(q) ||
      r.deviceId.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    return sortOrder === 'asc' ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time);
  });

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

export function createSensorRecordsFromRealtime(realtime: { temp: number; humidity: number; light: number; time?: string }): SensorRecord[] {
  const now = new Date();
  const timeFormatted = realtime.time && realtime.time.includes('/')
    ? realtime.time
    : `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const idBase = Date.now().toString().slice(-4);

  const triad: SensorRecord[] = [
    {
      id: `#S${idBase}1`,
      time: timeFormatted,
      sensorType: SensorTypeEnum.TEMPERATURE,
      value: Number(realtime.temp.toFixed(1)),
      unit: '°C',
      status: realtime.temp > 30.5 ? SensorStatusEnum.WARNING : SensorStatusEnum.NORMAL,
      deviceId: 'ESP8266_01'
    },
    {
      id: `#S${idBase}2`,
      time: timeFormatted,
      sensorType: SensorTypeEnum.LIGHT,
      value: Math.round(realtime.light),
      unit: 'Lux',
      status: realtime.light > 1000 ? SensorStatusEnum.WARNING : SensorStatusEnum.NORMAL,
      deviceId: 'ESP8266_01'
    },
    {
      id: `#S${idBase}3`,
      time: timeFormatted,
      sensorType: SensorTypeEnum.HUMIDITY,
      value: Number(realtime.humidity.toFixed(1)),
      unit: '%',
      status: realtime.humidity > 80 ? SensorStatusEnum.WARNING : SensorStatusEnum.NORMAL,
      deviceId: 'ESP8266_01'
    }
  ];

  mockSensorsCache = [...triad, ...mockSensorsCache].slice(0, 150);
  return triad;
}

export function generateNewSensorTriad(): SensorRecord[] {
  const now = new Date();
  const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  
  const temp = Number((26.5 + Math.random() * 2.5).toFixed(1));
  const light = Math.round(380 + Math.random() * 80);
  const humidity = Number((62.0 + Math.random() * 5.0).toFixed(1));

  const idBase = Date.now().toString().slice(-3);

  const triad: SensorRecord[] = [
    {
      id: `#S${idBase}1`,
      time: timeFormatted,
      sensorType: SensorTypeEnum.TEMPERATURE,
      value: temp,
      unit: '°C',
      status: temp > 31.0 ? SensorStatusEnum.WARNING : SensorStatusEnum.NORMAL,
      deviceId: 'ESP8266_01'
    },
    {
      id: `#S${idBase}2`,
      time: timeFormatted,
      sensorType: SensorTypeEnum.LIGHT,
      value: light,
      unit: 'Lux',
      status: light > 1000 ? SensorStatusEnum.WARNING : SensorStatusEnum.NORMAL,
      deviceId: 'ESP8266_01'
    },
    {
      id: `#S${idBase}3`,
      time: timeFormatted,
      sensorType: SensorTypeEnum.HUMIDITY,
      value: humidity,
      unit: '%',
      status: humidity > 80 ? SensorStatusEnum.WARNING : SensorStatusEnum.NORMAL,
      deviceId: 'ESP8266_01'
    }
  ];

  mockSensorsCache = [...triad, ...mockSensorsCache].slice(0, 100);
  return triad;
}
