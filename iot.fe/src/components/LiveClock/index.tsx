import React, { useState, useEffect } from 'react';
import { Flex, Typography } from 'antd';
import { Clock } from 'lucide-react';
import { MONO } from '../../lib/theme/theme';
import type { LiveClockProps } from './type';

const { Text } = Typography;

export const LiveClock: React.FC<LiveClockProps> = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        height: 36,
        padding: '0 12px',
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        lineHeight: 1,
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      <Clock size={15} color="#09353D" style={{ flexShrink: 0 }} />
      <Flex align="center" gap={8} style={{ lineHeight: 1 }}>
        <Text style={{ fontSize: 12, color: '#475569', fontWeight: 500, lineHeight: 1, ...MONO }}>
          {time.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </Text>
        <span style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1 }}>|</span>
        <Text strong style={{ fontSize: 13, color: '#0f172a', lineHeight: 1, ...MONO }}>
          {time.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          })}
        </Text>
      </Flex>
    </div>
  );
};

export default LiveClock;
