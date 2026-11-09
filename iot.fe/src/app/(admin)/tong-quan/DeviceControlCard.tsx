import React, { useEffect } from 'react';
import { Card, Switch, Tag, Typography, Flex, Row, Col, message } from 'antd';
import { Zap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { DEVICE_CONTROLS } from './const';
import { useDevicesQuery, queryKeys } from '../../../lib/queries';
import { useDeviceControlMutation } from '../../../lib/mutations';
import { signalRService } from '../../../lib/signalr/signalrService';
import { DeviceActionEnum } from '../../../lib/constants/enums';
import type { DeviceDto } from '../../../lib/api/devices';

const { Text } = Typography;

export const DeviceControlCard: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: devices = [], isError: devicesError } = useDevicesQuery();

  const controlMutation = useDeviceControlMutation({
    onError: (err) => {
      // 409 thiết bị bận, 503 mất broker, 504 ESP không phản hồi...
      message.error(err.message || 'Không thể gửi lệnh điều khiển thiết bị');
    },
  });

  useEffect(() => {
    signalRService.init();

    // ESP báo trạng thái thật (sau lệnh, khi ESP kết nối lại, hoặc retained lúc BE khởi động)
    const unsub = signalRService.onDeviceStatus((status) => {
      queryClient.setQueryData<DeviceDto[]>(queryKeys.devices.list(), (old = []) =>
        old.map((d) => (d.id === status.deviceId ? { ...d, isOn: status.state.toUpperCase() === 'ON' } : d))
      );
    });

    return () => {
      unsub();
    };
  }, [queryClient]);

  return (
    <Row gutter={[12, 12]}>
      {DEVICE_CONTROLS.map(({ key, id, name, label, color }) => {
        const foundDev = devices.find((d) => d.id === id);
        const active = foundDev?.isOn ?? false;
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
          <Col xs={24} md={8} key={key}>
            <Card
              styles={{
                body: {
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
              }}
              style={{
                borderRadius: 12,
                borderColor: active ? `${color || '#09353D'}55` : '#e2e8f0',
                backgroundColor: active ? `${color || '#09353D'}08` : '#ffffff',
                boxShadow: active
                  ? `0 0 0 1px ${color || '#09353D'}33`
                  : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? `${color || '#09353D'}18` : '#f8fafc',
                    border: active
                      ? `1px solid ${color || '#09353D'}44`
                      : '1px solid #e2e8f0',
                    color: active ? color || '#09353D' : '#94a3b8',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Zap size={18} fill={active ? (color || '#09353D') : 'none'} />
                </div>
                <div>
                  <Flex align="center" gap={8}>
                    <Text strong style={{ fontSize: 13, lineHeight: 1.2 }}>
                      {label}
                    </Text>
                    <Tag
                      bordered={false}
                      color={active ? 'success' : 'default'}
                      style={{
                        fontSize: 10,
                        padding: '0 6px',
                        lineHeight: '18px',
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {active ? 'BẬT' : 'TẮT'}
                    </Tag>
                  </Flex>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                    {name}
                  </Text>
                </div>
              </Flex>

              <Switch
                checked={active}
                loading={isPending}
                disabled={!foundDev || devicesError}
                onChange={handleToggle}
              />
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default DeviceControlCard;
