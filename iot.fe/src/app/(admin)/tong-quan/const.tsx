import type { ChartTabItem, DeviceControlConfig } from './type';

export const CHART_TABS: ChartTabItem[] = [
  { id: 'all', label: 'Tất cả (3 đường)' },
  { id: 'temp', label: 'Nhiệt độ' },
  { id: 'light', label: 'Ánh sáng' },
  { id: 'humidity', label: 'Độ ẩm' },
];

export const DEVICE_CONTROLS: DeviceControlConfig[] = [
  { key: 'led1', id: 1, name: 'Đèn cảnh báo nhiệt độ', label: 'Đèn LED 1', color: '#DC2626' },
  { key: 'led2', id: 2, name: 'Đèn chiếu sáng', label: 'Đèn LED 2', color: '#D97706' },
  { key: 'led3', id: 3, name: 'Đèn cảnh báo độ ẩm', label: 'Đèn LED 3', color: '#0284C7' },
];
