import type { DeviceControlPayload, ActionRecord } from '../types';
import { DeviceActionEnum, DeviceStatusEnum } from '../constants/enums';
import { apiClient } from './client';

export interface DeviceDto {
  id: number;
  code: string;
  name: string;
  isOn: boolean;
}

const mockDevices: DeviceDto[] = [
  { id: 1, code: 'led_temp', name: 'LED 1 (LED_Temperature)', isOn: false },
  { id: 2, code: 'led_lux', name: 'LED 2 (LED_Luminosity)', isOn: false },
  { id: 3, code: 'led_humidity', name: 'LED 3 (LED_Humidity)', isOn: false }
];

export async function fetchDevicesApi(): Promise<DeviceDto[]> {
  try {
    const data = await apiClient<DeviceDto[]>('/api/devices');
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (err) {
    console.warn('Sử dụng dữ liệu thiết bị fallback:', err);
  }
  return [...mockDevices];
}

export async function sendDeviceControlCommand(
  payload: DeviceControlPayload
): Promise<{ success: boolean; actionLog: ActionRecord }> {
  const { deviceId, deviceName, action } = payload;

  try {
    // Gọi route chuẩn DOCX Mục 3.4.2: POST /api/devices/{deviceId}/commands
    await apiClient(`/api/devices/${deviceId}/commands`, {
      method: 'POST',
      body: JSON.stringify({ action: action.toUpperCase() }),
    });
  } catch (err) {
    console.warn('Lỗi gửi lệnh điều khiển tới BE, dùng fallback local:', err);
  }

  const dev = mockDevices.find((d) => d.id === deviceId);
  if (dev) {
    dev.isOn = action === DeviceActionEnum.ON;
  }

  const now = new Date();
  const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const actionLog: ActionRecord = {
    id: `#H${Date.now().toString().slice(-4)}`,
    time: timeFormatted,
    device: deviceName,
    deviceId,
    action,
    status: DeviceStatusEnum.SUCCESS,
    operator: 'Nguyễn Văn An',
    source: 'MQTT / Web'
  };

  return {
    success: true,
    actionLog
  };
}
