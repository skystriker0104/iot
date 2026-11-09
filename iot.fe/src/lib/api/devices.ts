import type { DeviceControlPayload } from '../types';
import { apiClient } from './client';

export interface DeviceDto {
  id: number;
  code: string;
  name: string;
  isOn: boolean;
}

export interface ControlDeviceResponse {
  deviceId: number;
  action: string;
  status: string;
  state: string;
}

// GET /api/devices
export function fetchDevicesApi(): Promise<DeviceDto[]> {
  return apiClient<DeviceDto[]>('/api/devices');
}

// Báo cáo mục 3.4.2: POST /api/devices/{deviceId}/commands
// BE chờ ESP phản hồi tối đa 5 giây: 409 thiết bị bận, 503 mất broker, 504 ESP không phản hồi
export function sendDeviceControlCommand({ deviceId, action }: DeviceControlPayload): Promise<ControlDeviceResponse> {
  return apiClient<ControlDeviceResponse>(`/api/devices/${deviceId}/commands`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}
