import { HubConnectionBuilder, HubConnection, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { API_BASE, getValidAccessToken } from '../api/client';

const HUB_URL = `${API_BASE}/hubs/iot`;
const RETRY_START_MS = 5000;

export interface RealtimeSensorData {
  temp: number;
  humidity: number;
  light: number;
  recordedAt: string; // ISO UTC
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

function emit<T>(callbacks: Set<(arg: T) => void>, arg: T, name: string) {
  callbacks.forEach((cb) => {
    try {
      cb(arg);
    } catch (err) {
      console.error(`Lỗi callback ${name}:`, err);
    }
  });
}

class SignalRService {
  private connection: HubConnection | null = null;
  private sensorCallbacks = new Set<SensorDataCallback>();
  private recordCallbacks = new Set<NewSensorRecordsCallback>();
  private deviceCallbacks = new Set<DeviceStatusCallback>();
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  /** Gọi sau khi đã đăng nhập. Gọi nhiều lần không sao. */
  public init() {
    if (this.connection) return;

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        // Hub yêu cầu JWT; token sắp hết hạn sẽ được refresh trước khi (re)connect
        accessTokenFactory: async () => (await getValidAccessToken()) ?? '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on('ReceiveSensorData', (data: RealtimeSensorData) => emit(this.sensorCallbacks, data, 'ReceiveSensorData'));
    connection.on('ReceiveNewSensorRecords', (records: BackendSensorRecordDto[]) =>
      emit(this.recordCallbacks, records, 'ReceiveNewSensorRecords')
    );
    connection.on('ReceiveDeviceStatus', (status: RealtimeDeviceStatus) =>
      emit(this.deviceCallbacks, status, 'ReceiveDeviceStatus')
    );

    // Hết lượt auto-reconnect thì thử kết nối lại từ đầu
    connection.onclose(() => this.scheduleStart());

    this.connection = connection;
    void this.start();
  }

  public async stop() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;

    const connection = this.connection;
    this.connection = null; // đặt null trước để onclose không tự kết nối lại
    if (connection) {
      try {
        await connection.stop();
      } catch {
        /* ignore */
      }
    }
  }

  private async start() {
    const connection = this.connection;
    if (!connection || connection.state !== HubConnectionState.Disconnected) return;

    try {
      await connection.start();
    } catch {
      console.warn('SignalR chưa kết nối được, thử lại sau 5 giây.');
      this.scheduleStart();
    }
  }

  private scheduleStart() {
    if (!this.connection || this.retryTimer) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      void this.start();
    }, RETRY_START_MS);
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
