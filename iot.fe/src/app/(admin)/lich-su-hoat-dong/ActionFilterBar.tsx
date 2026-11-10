import React from 'react';
import { Card, Input, Select, Flex, Typography } from 'antd';
import { Search } from 'lucide-react';
import { DEVICE_FILTER_OPTIONS, ACTION_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from './const';

const { Text } = Typography;

interface ActionFilterBarProps {
  search: string;
  deviceFilter: string;
  actionFilter: string;
  statusFilter: string;
  onSearchChange: (val: string) => void;
  onDeviceChange: (val: string) => void;
  onActionChange: (val: string) => void;
  onStatusChange: (val: string) => void;
}

export const ActionFilterBar: React.FC<ActionFilterBarProps> = ({
  search,
  deviceFilter,
  actionFilter,
  statusFilter,
  onSearchChange,
  onDeviceChange,
  onActionChange,
  onStatusChange,
}) => {
  return (
    <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 12, borderColor: '#e2e8f0' }}>
      <Flex align="flex-end" gap={12} wrap="nowrap" style={{ width: '100%' }}>
        {/* Ô tìm kiếm từ khóa */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Tìm kiếm lịch sử thao tác
          </Text>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Search size={15} color="#94a3b8" />}
            placeholder="Tìm theo giờ (20:15, 20h), ngày (22/09), thiết bị, lệnh gửi, trạng thái..."
            allowClear
          />
        </div>

        {/* Lọc theo Thiết bị */}
        <div style={{ width: 170, flexShrink: 0 }}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Thiết bị
          </Text>
          <Select
            value={deviceFilter}
            onChange={onDeviceChange}
            options={DEVICE_FILTER_OPTIONS}
            style={{ width: '100%' }}
          />
        </div>

        {/* Lọc theo Lệnh điều khiển */}
        <div style={{ width: 170, flexShrink: 0 }}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Lệnh điều khiển
          </Text>
          <Select
            value={actionFilter}
            onChange={onActionChange}
            options={ACTION_FILTER_OPTIONS}
            style={{ width: '100%' }}
          />
        </div>

        {/* Lọc theo Trạng thái thực thi */}
        <div style={{ width: 170, flexShrink: 0 }}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Trạng thái thực thi
          </Text>
          <Select
            value={statusFilter}
            onChange={onStatusChange}
            options={STATUS_FILTER_OPTIONS}
            style={{ width: '100%' }}
          />
        </div>
      </Flex>
    </Card>
  );
};

export default ActionFilterBar;
