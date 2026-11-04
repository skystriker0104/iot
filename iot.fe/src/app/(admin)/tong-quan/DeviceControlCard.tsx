import React, { useEffect } from 'react';
import { Card, Switch, Tag, Typography, Flex, Space, message } from 'antd';
import { Zap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../../stores/useAppStore';
import { DEVICE_CONTROLS } from './const';
import { useDevicesQuery, queryKeys } from '../../../lib/queries';
import { useDeviceControlMutation } from '../../../lib/mutations';
import { signalRService } from '../../../lib/signalr/signalrService';
import { DeviceActionEnum } from '../../../lib/constants/enums';
import type { DeviceDto } from '../../../lib/api/devices';

const { Title, Text } = Typography;

export const DeviceControlCard: React.FC = () => {
  const queryClient = useQueryClient();
  const { ledStates, setHistoryRows } = useAppStore();

  // 1. TanStack Query Hook từ src/lib/queries
  const { data: devices = [] } = useDevicesQuery();

  // 2. TanStack Mutation Hook từ src/lib/mutations
  const controlMutation = useDeviceControlMutation({
    onSuccess: (res) => {
      if (res?.actionLog) {
        setHistoryRows((prev) => [res.actionLog, ...prev]);
      }
    },
    onError: () => {
      message.error('Không thể gửi lệnh điều khiển thiết bị');
    },
  });

  // 3. SignalR: Lắng nghe trạng thái thiết bị phản hồi thời gian thực từ ESP8266
  useEffect(() => {
    signalRService.init();

    const unsub = signalRService.onDeviceStatus((status) => {
      queryClient.setQueryData<DeviceDto[]>(queryKeys.devices.list(), (old = []) => {
        return old.map((d) => {
          if (d.id === status.deviceId || d.name.toLowerCase().includes(status.deviceName?.toLowerCase() || '')) {
            const isTurnedOn = (status.state || status.action || '').toUpperCase() === 'ON';
            return { ...d, isOn: isTurnedOn };
          }
          return d;
        });
      });
    });

    return () => {
      unsub();
    };
  }, [queryClient]);

  const onlineCount = devices.length > 0 ? devices.length : 3;

  return (
    <Card
      styles={{
        body: {
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          height: '100%',
          overflow: 'hidden',
        },
      }}
      style={{
        borderRadius: 12,
        height: '100%',
        borderColor: '#e2e8f0',
      }}
    >
      <Flex justify="space-between" align="center" style={{ paddingBottom: 12, borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <Title level={5} style={{ margin: 0, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Điều khiển ngoại vi
          </Title>
          
        </div>
        <Tag color="success" style={{ margin: 0, fontWeight: 600 }}>
          {onlineCount} Online
        </Tag>
      </Flex>

      <Space direction="vertical" size={10} style={{ width: '100%' }}>
        {DEVICE_CONTROLS.map(({ key, id, name, label }) => {
          const foundDev = devices.find((d) => d.id === id);
          const active = foundDev !== undefined ? foundDev.isOn : Boolean(ledStates[key]);
          const isPending =
            controlMutation.isPending &&
            controlMutation.variables?.deviceId === id;

          const handleToggle = () => {
            const nextAction = active ? DeviceActionEnum.OFF : DeviceActionEnum.ON;
            controlMutation.mutate({
              deviceId: id,
              deviceKey: key,
              deviceName: name,
              action: nextAction,
            });
          };

          return (
            <div
              key={key}
              style={{
                borderRadius: 8,
                border: active ? '1px solid #fde68a' : '1px solid #e2e8f0',
                backgroundColor: active ? '#fffbeb' : '#f8fafc',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
              }}
            >
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? '#fef3c7' : '#ffffff',
                    border: active ? '1px solid #fcd34d' : '1px solid #e2e8f0',
                    color: active ? '#b45309' : '#94a3b8',
                  }}
                >
                  <Zap size={16} fill={active ? 'rgba(245, 158, 11, 0.4)' : 'none'} />
                </div>
                <div>
                  <Text strong style={{ fontSize: 12, display: 'block', lineHeight: 1.2 }}>
                    {label}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {name}
                  </Text>
                </div>
              </Flex>

              <Switch
                checked={active}
                loading={isPending}
                onChange={handleToggle}
              />
            </div>
          );
        })}
      </Space>
    </Card>
  );
};

export default DeviceControlCard;
