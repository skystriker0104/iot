import React from 'react';
import { Card, Typography, Flex, Badge, Divider } from 'antd';
import { Sparkline } from '../Sparkline';
import { MONO } from '../../lib/theme/theme';
import type { SensorCardProps } from './type';

const { Text, Title } = Typography;

export const SensorCard: React.FC<SensorCardProps> = ({
  label,
  value,
  unit,
  color,
  Icon,
  trend,
  subtext,
  thresholdWarning = false,
}) => {
  return (
    <Card
      styles={{
        body: {
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        },
      }}
      style={{
        borderRadius: 12,
        borderColor: thresholdWarning ? '#fca5a5' : '#e2e8f0',
        boxShadow: thresholdWarning ? '0 0 0 1px #fca5a5' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        transition: 'all 0.2s',
      }}
    >
      <div>
        <Flex justify="space-between" align="center">
          <Text
            type="secondary"
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </Text>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: `${color}14`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={16} color={color} />
          </div>
        </Flex>

        <Flex justify="space-between" align="baseline" style={{ marginTop: 12 }}>
          <Flex align="baseline" gap={6}>
            <Title
              level={2}
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 700,
                color: '#0f172a',
                ...MONO,
              }}
            >
              {value}
            </Title>
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
              {unit}
            </Text>
          </Flex>
          <div style={{ width: 96, height: 28, flexShrink: 0 }}>
            <Sparkline data={trend} color={color} />
          </div>
        </Flex>
      </div>

      <div>
        <Divider style={{ margin: '12px 0 8px', borderColor: '#f1f5f9' }} />
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={6}>
            <Badge status="success" />
            <Text type="secondary" style={{ fontSize: 11, fontWeight: 500 }}>
              Trực tiếp
            </Text>
          </Flex>
          {subtext && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              {subtext}
            </Text>
          )}
        </Flex>
      </div>
    </Card>
  );
};

export default SensorCard;
