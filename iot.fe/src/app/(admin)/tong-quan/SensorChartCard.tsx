import React, { useState } from 'react';
import { Card, Typography, Flex, Tag, Segmented } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { SensorDataPoint } from '../../../lib/types';
import { MONO } from '../../../lib/theme/theme';
import { CHART_TABS } from './const';
import type { ActiveChartParam } from './type';

const { Title, Text } = Typography;

interface SensorChartCardProps {
  chartData: SensorDataPoint[];
}

export const SensorChartCard: React.FC<SensorChartCardProps> = ({ chartData }) => {
  const [activeParam, setActiveParam] = useState<ActiveChartParam>('all');

  const segmentedOptions = CHART_TABS.map((tab) => ({
    label: tab.label,
    value: tab.id,
  }));

  return (
    <Card
      styles={{
        body: {
          padding: 16,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        },
      }}
      style={{
        borderRadius: 12,
        height: '100%',
        borderColor: '#e2e8f0',
      }}
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap={12} style={{ paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <Flex align="center" gap={8}>
            <Title level={5} style={{ margin: 0, fontSize: 14 }}>
              Biểu đồ biến thiên dữ liệu cảm biến
            </Title>
          </Flex>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
            Nhiệt độ (°C) • Ánh sáng (Lux) • Độ ẩm (%)
          </Text>
        </div>

        {/* Ant Design Segmented Tabs */}
        <Segmented
          options={segmentedOptions}
          value={activeParam}
          onChange={(val) => setActiveParam(val as ActiveChartParam)}
          size="middle"
        />
      </Flex>

      {/* Chart Display Area */}
      <div style={{ flex: 1, width: '100%', minHeight: 280, paddingTop: 12 }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeParam === 'all' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={35} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#d97706' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} width={35} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 12,
                  ...MONO,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Line yAxisId="left" type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#dc2626" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="light" name="Ánh sáng (Lux)" stroke="#d97706" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} isAnimationActive={false} />
              <Line yAxisId="left" type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#0284c7" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} isAnimationActive={false} />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: 6,
                  color: '#f8fafc',
                  fontSize: 12,
                  ...MONO,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              {activeParam === 'temp' && (
                <Line type="monotone" dataKey="temp" name="Nhiệt độ (°C)" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 2.5, fill: '#dc2626' }} activeDot={{ r: 4.5 }} isAnimationActive={false} />
              )}
              {activeParam === 'light' && (
                <Line type="monotone" dataKey="light" name="Ánh sáng (Lux)" stroke="#d97706" strokeWidth={2.5} dot={{ r: 2.5, fill: '#d97706' }} activeDot={{ r: 4.5 }} isAnimationActive={false} />
              )}
              {activeParam === 'humidity' && (
                <Line type="monotone" dataKey="humidity" name="Độ ẩm (%)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 2.5, fill: '#0284c7' }} activeDot={{ r: 4.5 }} isAnimationActive={false} />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SensorChartCard;
