import { SensorTypeEnum } from '../../../lib/constants/enums';

export const SENSOR_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: SensorTypeEnum.TEMPERATURE, label: 'Cảm biến Nhiệt độ (°C)' },
  { value: SensorTypeEnum.LIGHT, label: 'Cảm biến Ánh sáng (Lux)' },
  { value: SensorTypeEnum.HUMIDITY, label: 'Cảm biến Độ ẩm (%)' },
  { value: 'time', label: 'Thời gian' },
];

export const SENSOR_TABLE_COLUMNS = [
  'Mã ID',
  'Thời gian ghi nhận',
  'Loại cảm biến',
  'Giá trị đo',
  'Trạng thái',
  'Thiết bị thu thập'
];
