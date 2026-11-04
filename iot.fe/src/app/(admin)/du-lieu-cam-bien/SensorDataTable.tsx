import React, { useMemo } from 'react';
import { Table, Tag, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Thermometer, Sun, Droplets, Database } from 'lucide-react';
import type { SensorRecord } from '../../../lib/types';
import { SensorTypeEnum, SensorStatusEnum } from '../../../lib/constants/enums';
import { MONO } from '../../../lib/theme/theme';
import { normalizeToAppDateTime } from '../../../lib/utils/dateTime';

interface SensorDataTableProps {
  records: SensorRecord[];
  loading?: boolean;
}

export const SensorDataTable: React.FC<SensorDataTableProps> = ({ records, loading = false }) => {
  const columns: ColumnsType<SensorRecord> = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 140,
        render: (id: string) => (
          <span style={{ fontWeight: 600, color: '#475569', ...MONO }}>
            {id}
          </span>
        ),
      },
      {
        title: 'THỜI GIAN',
        dataIndex: 'time',
        key: 'time',
        width: 180,
        render: (time: string) => (
          <span style={{ color: '#475569', ...MONO }}>
            {normalizeToAppDateTime(time)}
          </span>
        ),
      },
      {
        title: 'LOẠI CẢM BIẾN',
        dataIndex: 'sensorType',
        key: 'sensorType',
        width: 180,
        render: (type: string) => {
          if (type === SensorTypeEnum.TEMPERATURE) {
            return (
              <Tag
                color="error"
                icon={<Thermometer size={13} style={{ verticalAlign: -1, marginRight: 4 }} />}
              >
                {type}
              </Tag>
            );
          }
          if (type === SensorTypeEnum.LIGHT) {
            return (
              <Tag
                color="warning"
                icon={<Sun size={13} style={{ verticalAlign: -1, marginRight: 4 }} />}
              >
                {type}
              </Tag>
            );
          }
          if (type === SensorTypeEnum.HUMIDITY) {
            return (
              <Tag
                color="processing"
                icon={<Droplets size={13} style={{ verticalAlign: -1, marginRight: 4 }} />}
              >
                {type}
              </Tag>
            );
          }
          return (
            <Tag
              color="default"
              icon={<Database size={13} style={{ verticalAlign: -1, marginRight: 4 }} />}
            >
              {type}
            </Tag>
          );
        },
      },
      {
        title: 'GIÁ TRỊ ĐO',
        key: 'value',
        width: 140,
        render: (_, record) => {
          let valColor = '#0f172a';
          if (record.sensorType === SensorTypeEnum.TEMPERATURE) valColor = '#dc2626';
          else if (record.sensorType === SensorTypeEnum.LIGHT) valColor = '#d97706';
          else if (record.sensorType === SensorTypeEnum.HUMIDITY) valColor = '#0284c7';

          return (
            <span style={{ fontWeight: 700, color: valColor, ...MONO }}>
              {record.value} {record.unit}
            </span>
          );
        },
      },
      {
        title: 'TRẠNG THÁI',
        dataIndex: 'status',
        key: 'status',
        width: 160,
        render: (status: string) => {
          const isWarning = status === SensorStatusEnum.WARNING;
          return (
            <Badge
              status={isWarning ? 'error' : 'success'}
              text={
                <Tag color={isWarning ? 'error' : 'success'} style={{ margin: 0, fontWeight: 500 }}>
                  {status}
                </Tag>
              }
            />
          );
        },
      },
      {
        title: 'MÃ THIẾT BỊ',
        dataIndex: 'deviceId',
        key: 'deviceId',
        render: (deviceId: string) => (
          <span style={{ color: '#64748b', ...MONO }}>{deviceId}</span>
        ),
      },
    ],
    []
  );

  return (
    <Table<SensorRecord>
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={records}
      pagination={false}
      scroll={{ x: 800 }}
      locale={{ emptyText: 'Không tìm thấy bản ghi dữ liệu cảm biến nào phù hợp với điều kiện lọc.' }}
    />
  );
};

export default SensorDataTable;
