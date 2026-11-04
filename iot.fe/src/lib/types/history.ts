import { DeviceActionEnum, DeviceStatusEnum } from '../constants/enums';

export interface ActionRecord {
  id: string;
  time: string;
  device: string;
  deviceId: number;
  action: DeviceActionEnum | string;
  status: DeviceStatusEnum | string;
  operator: string;
  source: string;
}

export interface ActionQueryParams {
  search?: string;
  device?: string;
  action?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}
