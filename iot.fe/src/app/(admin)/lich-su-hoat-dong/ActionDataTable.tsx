import React, { useMemo } from 'react';
import { Table, Tag, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ActionRecord } from '../../../lib/types';
import { DeviceActionEnum, DeviceStatusEnum } from '../../../lib/constants/enums';
import { MONO } from '../../../lib/theme/theme';
import { normalizeToAppDateTime } from '../../../lib/utils/dateTime';

interface ActionDataTableProps {
  records: ActionRecord[];
  loading?: boolean;
}

export const ActionDataTable: React.FC<ActionDataTableProps> = ({ records, loading = false }) => {
  const columns: ColumnsType<ActionRecord> = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 130,
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
        title: 'THIẾT BỊ NGOẠI VI',
        dataIndex: 'device',
        key: 'device',
        width: 170,
        render: (device: string) => (
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{device}</span>
        ),
      },
      {
        title: 'LỆNH GỬI',
        dataIndex: 'action',
        key: 'action',
        width: 120,
        render: (action: string) => {
          const isOn = action === DeviceActionEnum.ON;
          return (
            <Tag
              color={isOn ? 'success' : 'default'}
              style={{ fontWeight: 600, ...MONO }}
            >
              {action}
            </Tag>
          );
        },
      },
      {
        title: 'TRẠNG THÁI THỰC THI',
        dataIndex: 'status',
        key: 'status',
        width: 170,
        render: (status: ActionRecord['status']) => {
          let badgeStatus: 'success' | 'processing' | 'error' | 'default' = 'default';
          let tagColor = 'default';

          if (status === DeviceStatusEnum.SUCCESS) {
            badgeStatus = 'success';
            tagColor = 'success';
          } else if (status === DeviceStatusEnum.LOADING) {
            badgeStatus = 'processing';
            tagColor = 'warning';
          } else if (status === DeviceStatusEnum.FAIL) {
            badgeStatus = 'error';
            tagColor = 'error';
          }

          return (
            <Badge
              status={badgeStatus}
              text={
                <Tag color={tagColor} style={{ margin: 0, fontWeight: 500 }}>
                  {status}
                </Tag>
              }
            />
          );
        },
      },
      {
        title: 'NGƯỜI THỰC HIỆN',
        dataIndex: 'operator',
        key: 'operator',
        width: 160,
        render: (op: string) => (
          <span style={{ fontWeight: 500, color: '#334155' }}>{op}</span>
        ),
      },
      {
        title: 'NGUỒN THAO TÁC',
        dataIndex: 'source',
        key: 'source',
        render: (src: string) => (
          <span style={{ color: '#64748b', ...MONO }}>{src}</span>
        ),
      },
    ],
    []
  );

  return (
    <Table<ActionRecord>
      rowKey="id"
      loading={loading}
      columns={columns}
      dataSource={records}
      pagination={false}
      scroll={{ x: 800 }}
      locale={{ emptyText: 'Không tìm thấy lịch sử điều khiển nào phù hợp.' }}
    />
  );
};

export default ActionDataTable;
