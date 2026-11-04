import { DeviceActionEnum, DeviceStatusEnum } from '../constants/enums';

export interface DeviceItem {
  key: 'led1' | 'led2' | 'led3';
  id: number;
  name: string;
  label: string;
  color: string;
}

export interface DeviceStateMap {
  led1: boolean;
  led2: boolean;
  led3: boolean;
}

export interface DeviceControlPayload {
  deviceId: number;
  deviceKey: 'led1' | 'led2' | 'led3';
  deviceName: string;
  action: DeviceActionEnum;
}
