import { HubConnectionBuilder, HubConnection, HubConnectionState, LogLevel } from '@microsoft/signalr';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5171';
const HUB_URL = `${API_BASE}/hubs/iot`;

export interface RealtimeSensorData {
  temp: number;
  humidity: number;
  light: number;
  time: string;
}

export interface BackendSensorRecordDto {
  id: number;
  sensorId: number;
  sensorCode: string;
  sensorName: string;
  sensorUnit: string;
  value: number;
  createdAt: string;
}

export interface RealtimeDeviceStatus {
  deviceId: number;
  deviceName: string;
  action: string;
  status: string;
  state: string;
}

type SensorDataCallback = (data: RealtimeSensorData) => void;
type NewSensorRecordsCallback = (records: BackendSensorRecordDto[]) => void;
type DeviceStatusCallback = (status: RealtimeDeviceStatus) => void;

class SignalRService {
  private connection: HubConnection | null = null;
  private sensorCallbacks: Set<SensorDataCallback> = new Set();
  private recordCallbacks: Set<NewSensorRecordsCallback> = new Set();
  private deviceCallbacks: Set<DeviceStatusCallback> = new Set();
  private isStarting = false;

  public init() {
    if (this.connection) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(HUB_URL)
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    // 1. Lắng nghe gói tin số đo tức thời (Dashboard)
    this.connection.on('ReceiveSensorData', (data: RealtimeSensorData) => {
      this.sensorCallbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error('Lỗi sensor callback:', err);
        }
      });
    });

    // 2. Lắng nghe các bản ghi cảm biến mới vừa ghi vào Database (Sensor Data Page)
    this.connection.on('ReceiveNewSensorRecords', (records: BackendSensorRecordDto[]) => {
      this.recordCallbacks.forEach((cb) => {
        try {
          cb(records);
        } catch (err) {
          console.error('Lỗi new sensor records callback:', err);
        }
      });
    });

    // 3. Lắng nghe phản hồi trạng thái thiết bị ngoại vi
    this.connection.on('ReceiveDeviceStatus', (status: RealtimeDeviceStatus) => {
      this.deviceCallbacks.forEach((cb) => {
        try {
          cb(status);
        } catch (err) {
          console.error('Lỗi device callback:', err);
        }
      });
    });

    this.startConnection();
  }

  private async startConnection() {
    if (!this.connection || this.isStarting || this.connection.state === HubConnectionState.Connected) {
      return;
    }

    this.isStarting = true;
    try {
      await this.connection.start();
      console.log('SignalR đã kết nối thành công tới /hubs/iot');
    } catch (err) {
      console.warn('SignalR chưa thể kết nối (Backend có thể chưa chạy), sẽ tự động thử lại khi có mạng.');
    } finally {
      this.isStarting = false;
    }
  }

  public onSensorData(cb: SensorDataCallback) {
    this.sensorCallbacks.add(cb);
    return () => {
      this.sensorCallbacks.delete(cb);
    };
  }

  public onNewSensorRecords(cb: NewSensorRecordsCallback) {
    this.recordCallbacks.add(cb);
    return () => {
      this.recordCallbacks.delete(cb);
    };
  }

  public onDeviceStatus(cb: DeviceStatusCallback) {
    this.deviceCallbacks.add(cb);
    return () => {
      this.deviceCallbacks.delete(cb);
    };
  }

  public isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }
}

export const signalRService = new SignalRService();
