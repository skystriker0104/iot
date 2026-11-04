import type { DeviceControlPayload, ActionRecord } from '../types';
import { DeviceActionEnum, DeviceStatusEnum } from '../constants/enums';

export interface DeviceDto {
  id: number;
  code: string;
  name: string;
  isOn: boolean;
}

const mockDevices: DeviceDto[] = [
  { id: 1, code: 'led_temp', name: 'LED 1 (LED_Temperature)', isOn: true },
  { id: 2, code: 'led_lux', name: 'LED 2 (LED_Luminosity)', isOn: false },
  { id: 3, code: 'led_humidity', name: 'LED 3 (LED_Humidity)', isOn: true }
];

/**
 * Lấy danh sách thiết bị ngoại vi (Chế độ Mock hoàn toàn, không gọi API)
 */
export async function fetchDevicesApi(): Promise<DeviceDto[]> {
  return [...mockDevices];
}

/**
 * Điều khiển bật / tắt thiết bị ngoại vi (Chế độ Mock hoàn toàn, không gọi API)
 */
export async function sendDeviceControlCommand(
  payload: DeviceControlPayload
): Promise<{ success: boolean; actionLog: ActionRecord }> {
  const { deviceId, deviceName, action } = payload;

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
