import React from 'react';
import { Card, Input, Select, Row, Col, Typography, Space } from 'antd';
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
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {/* Top Search */}
        <div>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Tìm kiếm lịch sử thao tác
          </Text>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix={<Search size={15} color="#94a3b8" />}
            placeholder="Tìm theo giờ (20:15, 20h), ngày (22/09), thiết bị, lệnh gửi, trạng thái..."
          />
        </div>

        {/* Bottom Dropdown Filters with Ant Design Select */}
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
              Thiết bị
            </Text>
            <Select
              value={deviceFilter}
              onChange={onDeviceChange}
              options={DEVICE_FILTER_OPTIONS}
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
              Lệnh điều khiển
            </Text>
            <Select
              value={actionFilter}
              onChange={onActionChange}
              options={ACTION_FILTER_OPTIONS}
              style={{ width: '100%' }}
            />
          </Col>

          <Col xs={24} sm={8}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>
              Trạng thái thực thi
            </Text>
            <Select
              value={statusFilter}
              onChange={onStatusChange}
              options={STATUS_FILTER_OPTIONS}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default ActionFilterBar;
