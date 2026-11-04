import { create } from 'zustand';
import type { SensorDataPoint, SensorRecord, ActionRecord, DeviceStateMap } from '../lib/types';
import { DeviceActionEnum } from '../lib/constants/enums';
import { sendDeviceControlCommand } from '../lib/api/devices';
import { fetchSensorHistoryApi, generateNewSensorTriad } from '../lib/api/sensors';
import { fetchActionHistoryApi, appendMockHistory } from '../lib/api/history';
import { INITIAL_CHART_DATA, INITIAL_SENSOR_RECORDS, INITIAL_ACTION_RECORDS } from '../lib/constants/mockData';
import { signalRService } from '../lib/signalr/signalrService';

interface AppState {
  chartData: SensorDataPoint[];
  sensorRecords: SensorRecord[];
  historyRows: ActionRecord[];
  ledStates: DeviceStateMap;
  loadingLed: string | null;
  isLiveStreaming: boolean;
  currentPageSlug: string;

  // Actions
  setChartData: (data: SensorDataPoint[] | ((prev: SensorDataPoint[]) => SensorDataPoint[])) => void;
  addLiveSensorPoint: (point: SensorDataPoint) => void;
  setSensorRecords: (records: SensorRecord[] | ((prev: SensorRecord[]) => SensorRecord[])) => void;
  resetSensorRecords: () => void;
  setHistoryRows: (rows: ActionRecord[] | ((prev: ActionRecord[]) => ActionRecord[])) => void;
  toggleLed: (ledKey: keyof DeviceStateMap, deviceId: number, deviceName: string) => Promise<void>;
  setIsLiveStreaming: (live: boolean | ((prev: boolean) => boolean)) => void;
  setCurrentPageSlug: (slug: string) => void;
  syncFromBackend: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  refreshSensorData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  chartData: INITIAL_CHART_DATA,
  sensorRecords: INITIAL_SENSOR_RECORDS,
  historyRows: INITIAL_ACTION_RECORDS,
  ledStates: { led1: true, led2: false, led3: true },
  loadingLed: null,
  isLiveStreaming: true,
  currentPageSlug: 'home',

  setChartData: (data) =>
    set((state) => ({
      chartData: typeof data === 'function' ? data(state.chartData) : data
    })),

  addLiveSensorPoint: (point) =>
    set((state) => {
      const next = [...state.chartData, point];
      return {
        chartData: next.length > 20 ? next.slice(next.length - 20) : next
      };
    }),

  setSensorRecords: (records) =>
    set((state) => ({
      sensorRecords: typeof records === 'function' ? records(state.sensorRecords) : records
    })),

  resetSensorRecords: () => {
    set({ sensorRecords: [...INITIAL_SENSOR_RECORDS] });
  },

  setHistoryRows: (rows) =>
    set((state) => ({
      historyRows: typeof rows === 'function' ? rows(state.historyRows) : rows
    })),

  toggleLed: async (ledKey, deviceId, deviceName) => {
    const state = get();
    if (state.loadingLed) return;

    const currentVal = state.ledStates[ledKey];
    const targetAction = currentVal ? DeviceActionEnum.OFF : DeviceActionEnum.ON;

    set({ loadingLed: ledKey });

    try {
      const res = await sendDeviceControlCommand({
        deviceId,
        deviceKey: ledKey,
        deviceName,
        action: targetAction
      });

      if (res.success) {
        appendMockHistory(res.actionLog);
        set((s) => ({
          ledStates: { ...s.ledStates, [ledKey]: !currentVal },
          loadingLed: null,
          historyRows: [res.actionLog, ...s.historyRows]
        }));
      } else {
        set({ loadingLed: null });
      }
    } catch (err: any) {
      console.error('Failed to control device:', err);
      set({ loadingLed: null });
    }
  },

  setIsLiveStreaming: (live) =>
    set((state) => ({
      isLiveStreaming: typeof live === 'function' ? live(state.isLiveStreaming) : live
    })),

  setCurrentPageSlug: (slug) => set({ currentPageSlug: slug }),

  // Cập nhật dữ liệu cảm biến mới nhất và sinh số đo theo thời gian thực (Mock)
  syncFromBackend: async () => {
    const state = get();
    if (!state.isLiveStreaming) return;

    const lastPoint = state.chartData[state.chartData.length - 1] || { temp: 27.5, light: 420, humidity: 65 };
    
    const deltaTemp = (Math.random() - 0.48) * 0.4;
    const deltaLight = Math.round((Math.random() - 0.5) * 16);
    const deltaHumid = (Math.random() - 0.5) * 0.6;

    const nextTemp = Number(Math.min(33, Math.max(22, lastPoint.temp + deltaTemp)).toFixed(1));
    const nextLight = Math.min(950, Math.max(250, lastPoint.light + deltaLight));
    const nextHumid = Number(Math.min(85, Math.max(45, lastPoint.humidity + deltaHumid)).toFixed(1));

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newPoint = {
      time: timeStr,
      temp: nextTemp,
      light: nextLight,
      humidity: nextHumid
    };

    get().addLiveSensorPoint(newPoint);
    signalRService.emitMockSensorData(newPoint);

    // Định kỳ sinh 3 bản ghi cảm biến mới vào bảng lịch sử cảm biến
    if (Math.random() > 0.4) {
      const triad = generateNewSensorTriad();
      set((s) => ({
        sensorRecords: [...triad, ...s.sensorRecords].slice(0, 150)
      }));

      // Bắn sự kiện tới TanStack Query hook để giao diện cập nhật ngay lập tức
      signalRService.emitMockNewRecords(
        triad.map((t, idx) => ({
          id: Date.now() + idx,
          sensorId: idx + 1,
          sensorCode: t.sensorType,
          sensorName: t.sensorType,
          sensorUnit: t.unit,
          value: t.value,
          createdAt: new Date().toISOString()
        }))
      );
    }
  },

  refreshHistory: async () => {
    try {
      const res = await fetchActionHistoryApi({ page: 1, pageSize: 50 });
      set({ historyRows: res.items });
    } catch (err) {
      console.error('Refresh history failed:', err);
    }
  },

  refreshSensorData: async () => {
    try {
      const res = await fetchSensorHistoryApi({ page: 1, pageSize: 50 });
      set({ sensorRecords: res.items });
    } catch (err) {
      console.error('Refresh sensor data failed:', err);
    }
  }
}));
