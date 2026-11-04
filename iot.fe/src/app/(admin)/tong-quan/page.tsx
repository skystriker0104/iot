import React, { useEffect, useMemo } from 'react';
import { Row, Col } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { Thermometer, Sun, Droplets } from 'lucide-react';
import { useAppStore } from '../../../stores/useAppStore';
import { SensorCard } from '../../../components/SensorCard';
import { SensorChartCard } from './SensorChartCard';
import { DeviceControlCard } from './DeviceControlCard';
import { useLatestSensorsQuery, useChartDataQuery, queryKeys } from '../../../lib/queries';
import { signalRService } from '../../../lib/signalr/signalrService';
import type { SensorDataPoint } from '../../../lib/types';
import type { SensorLatestDto } from '../../../lib/api/sensors';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { chartData: storeChartData, addLiveSensorPoint } = useAppStore();

  // 1. Sử dụng TanStack Query hooks từ src/lib/queries
  const { data: chartData = storeChartData } = useChartDataQuery({
    initialData: storeChartData,
  });

  const { data: latestSensors = [] } = useLatestSensorsQuery();

  // 2. SignalR: Lắng nghe sự kiện ReceiveSensorData trực tiếp thời gian thực từ ESP8266 qua Backend Hub
  useEffect(() => {
    signalRService.init();

    const unsubscribe = signalRService.onSensorData((realtime) => {
      // Cập nhật giá trị cảm biến tức thời vào cache TanStack Query
      queryClient.setQueryData<SensorLatestDto[]>(queryKeys.sensors.latest(), [
        { sensorId: 1, code: 'temp', name: 'Nhiệt độ', unit: '°C', value: realtime.temp, createdAt: new Date().toISOString() },
        { sensorId: 2, code: 'humidity', name: 'Độ ẩm', unit: '%', value: realtime.humidity, createdAt: new Date().toISOString() },
        { sensorId: 3, code: 'light', name: 'Ánh sáng', unit: 'Lux', value: realtime.light, createdAt: new Date().toISOString() },
      ]);

      // Bổ sung điểm đo mới vào chuỗi thời gian biểu đồ (giữ 20 điểm gần nhất)
      const timeStr = realtime.time || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newPoint: SensorDataPoint = {
        time: timeStr,
        temp: realtime.temp,
        light: realtime.light,
        humidity: realtime.humidity,
      };

      queryClient.setQueryData<SensorDataPoint[]>(queryKeys.sensors.chart(), (old = []) => {
        const next = [...old, newPoint];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });

      // Đồng bộ vào Store toàn cục
      addLiveSensorPoint(newPoint);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient, addLiveSensorPoint]);

  // Trích xuất số liệu mới nhất hiển thị trên 3 Thẻ Cảm biến
  const tempSensor = latestSensors.find((s) => s.code === 'temp');
  const lightSensor = latestSensors.find((s) => s.code === 'light');
  const humidSensor = latestSensors.find((s) => s.code === 'humidity');

  const latestPoint = useMemo(() => {
    const lastFromChart = chartData[chartData.length - 1] || { temp: 27.5, light: 420, humidity: 65 };
    return {
      temp: tempSensor?.value ?? lastFromChart.temp,
      light: lightSensor?.value ?? lastFromChart.light,
      humidity: humidSensor?.value ?? lastFromChart.humidity,
    };
  }, [chartData, tempSensor, lightSensor, humidSensor]);

  const tempData = useMemo(() => chartData.map((d) => d.temp), [chartData]);
  const lightData = useMemo(() => chartData.map((d) => d.light), [chartData]);
  const humidData = useMemo(() => chartData.map((d) => d.humidity), [chartData]);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 16,
        gap: 12,
        overflow: 'hidden',
        maxWidth: 1400,
        margin: '0 auto',
      }}
    >
      {/* Top Row: 3 Real-time Sensor Metric Cards */}
      <Row gutter={[12, 12]} style={{ flexShrink: 0 }}>
        <Col xs={24} md={8}>
          <SensorCard
            label="Cảm biến Nhiệt độ"
            value={latestPoint.temp.toFixed(1)}
            unit="°C"
            color="#DC2626"
            Icon={Thermometer}
            trend={tempData}
            subtext="Chuẩn: 18 - 32 °C"
            thresholdWarning={latestPoint.temp > 30.5}
          />
        </Col>
        <Col xs={24} md={8}>
          <SensorCard
            label="Cảm biến Ánh sáng"
            value={Math.round(latestPoint.light)}
            unit="Lux"
            color="#D97706"
            Icon={Sun}
            trend={lightData}
            subtext="Chuẩn: 200 - 900 Lux"
            thresholdWarning={latestPoint.light > 1000}
          />
        </Col>
        <Col xs={24} md={8}>
          <SensorCard
            label="Cảm biến Độ ẩm"
            value={latestPoint.humidity.toFixed(1)}
            unit="%"
            color="#0284C7"
            Icon={Droplets}
            trend={humidData}
            subtext="Chuẩn: 40 - 80 %"
            thresholdWarning={latestPoint.humidity > 80}
          />
        </Col>
      </Row>

      {/* Main Row: Graph (Left 65%) + Device Controls (Right 35%) */}
      <Row gutter={[12, 12]} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Col xs={24} lg={16} style={{ height: '100%' }}>
          <SensorChartCard chartData={chartData} />
        </Col>
        <Col xs={24} lg={8} style={{ height: '100%' }}>
          <DeviceControlCard />
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
