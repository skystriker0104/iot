import { DeviceActionEnum, DeviceStatusEnum } from '../../../lib/constants/enums';

export const DEVICE_FILTER_OPTIONS = [
  { value: 'all', label: 'Device: All' },
  { value: 'LED 1', label: 'Device: LED 1' },
  { value: 'LED 2', label: 'Device: LED 2' },
  { value: 'LED 3', label: 'Device: LED 3' },
];

export const ACTION_FILTER_OPTIONS = [
  { value: 'all', label: 'Action: All' },
  { value: DeviceActionEnum.ON, label: 'Action: ON' },
  { value: DeviceActionEnum.OFF, label: 'Action: OFF' },
];

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Status: All' },
  { value: DeviceStatusEnum.SUCCESS, label: 'Status: Success' },
  { value: DeviceStatusEnum.LOADING, label: 'Status: Loading' },
  { value: DeviceStatusEnum.FAIL, label: 'Status: Fail' },
];

export const ACTION_TABLE_COLUMNS = [
  'Mã ID',
  'Thời gian thao tác',
  'Tên thiết bị ngoại vi',
  'Lệnh gửi',
  'Trạng thái thực thi',
  'Người thực hiện',
  'Phương thức'
];
