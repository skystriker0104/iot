import React, { useEffect, useMemo } from 'react';
import { Row, Col } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { Thermometer, Sun, Droplets } from 'lucide-react';
import { SensorCard } from '../../../components/SensorCard';
import { SensorChartCard } from './SensorChartCard';
import { DeviceControlCard } from './DeviceControlCard';
import { useLatestSensorsQuery, useChartDataQuery, queryKeys } from '../../../lib/queries';
import { signalRService } from '../../../lib/signalr/signalrService';
import type { SensorDataPoint } from '../../../lib/types';
import type { SensorLatestDto } from '../../../lib/api/sensors';
import { formatTime } from '../../../lib/utils/date';

const round1 = (v: number) => Math.round(v * 10) / 10;

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: chartData = [] } = useChartDataQuery();
  const { data: latestSensors = [] } = useLatestSensorsQuery();

  useEffect(() => {
    signalRService.init();

    const unsubscribe = signalRService.onSensorData((realtime) => {
      const at = realtime.recordedAt || new Date().toISOString();
      const values: Record<string, number> = {
        temp: realtime.temp,
        humidity: realtime.humidity,
        light: realtime.light,
      };

      // Cập nhật giá trị tức thời của 3 thẻ cảm biến (giữ tên/đơn vị từ BE)
      queryClient.setQueryData<SensorLatestDto[]>(queryKeys.sensors.latest(), (old = []) =>
        old.map((s) => (s.code in values ? { ...s, value: values[s.code], createdAt: at } : s))
      );

      // Thêm điểm mới vào biểu đồ (giữ 20 điểm gần nhất)
      const newPoint: SensorDataPoint = {
        time: formatTime(new Date(at)),
        temp: round1(realtime.temp),
        light: round1(realtime.light),
        humidity: round1(realtime.humidity),
      };

      queryClient.setQueryData<SensorDataPoint[]>(queryKeys.sensors.chart(), (old = []) => {
        const next = [...old, newPoint];
        return next.length > 20 ? next.slice(next.length - 20) : next;
      });
    });

    return unsubscribe;
  }, [queryClient]);

  // Trích xuất số liệu mới nhất hiển thị trên 3 Thẻ Cảm biến
  const tempSensor = latestSensors.find((s) => s.code === 'temp');
  const lightSensor = latestSensors.find((s) => s.code === 'light');
  const humidSensor = latestSensors.find((s) => s.code === 'humidity');

  // null = chưa có dữ liệu (ESP chưa gửi lần nào) → hiển thị "--"
  const latestPoint = useMemo(() => {
    const lastFromChart = chartData[chartData.length - 1];
    return {
      temp: tempSensor?.value ?? lastFromChart?.temp ?? null,
      light: lightSensor?.value ?? lastFromChart?.light ?? null,
      humidity: humidSensor?.value ?? lastFromChart?.humidity ?? null,
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
            value={latestPoint.temp === null ? "--" : latestPoint.temp.toFixed(1)}
            unit="°C"
            color="#DC2626"
            Icon={Thermometer}
            trend={tempData}
            thresholdWarning={(latestPoint.temp ?? 0) > 30.5}
          />
        </Col>
        <Col xs={24} md={8}>
          <SensorCard
            label="Cảm biến Ánh sáng"
            value={latestPoint.light === null ? "--" : Math.round(latestPoint.light)}
            unit="Lux"
            color="#D97706"
            Icon={Sun}
            trend={lightData}
            thresholdWarning={(latestPoint.light ?? 0) > 1000}
          />
        </Col>
        <Col xs={24} md={8}>
          <SensorCard
            label="Cảm biến Độ ẩm"
            value={latestPoint.humidity === null ? "--" : latestPoint.humidity.toFixed(1)}
            unit="%"
            color="#0284C7"
            Icon={Droplets}
            trend={humidData}
            thresholdWarning={(latestPoint.humidity ?? 0) > 80}
          />
        </Col>
      </Row>

      {/* Middle Row: Full-width Sensor Chart Card */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <SensorChartCard chartData={chartData} />
      </div>

      {/* Bottom Row: 3 Peripheral Device Control Cards */}
      <div style={{ flexShrink: 0 }}>
        <DeviceControlCard />
      </div>
    </div>
  );
};

export default DashboardPage;
