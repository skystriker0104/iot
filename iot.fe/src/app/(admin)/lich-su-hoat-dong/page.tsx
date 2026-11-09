import React, { useState, useCallback } from 'react';
import { Card, Pagination, Typography, Space, Flex } from 'antd';
import { ActionFilterBar } from './ActionFilterBar';
import { ActionDataTable } from './ActionDataTable';
import { useActionHistoryQuery } from '../../../lib/queries';
import { useDebounce } from '../../../lib/hooks';

const { Text } = Typography;

export const ActivityLogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);



  const { data: pagedData, isLoading } = useActionHistoryQuery({
    page: currentPage,
    pageSize: limit,
    device: deviceFilter,
    action: actionFilter,
    status: statusFilter,
    search: debouncedSearch,
  });

  const records = pagedData?.items || [];
  const total = pagedData?.total || 0;

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleDeviceChange = useCallback((val: string) => {
    setDeviceFilter(val);
    setCurrentPage(1);
  }, []);

  const handleActionChange = useCallback((val: string) => {
    setActionFilter(val);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Top Search & Filter Bar */}
        <ActionFilterBar
          search={search}
          deviceFilter={deviceFilter}
          actionFilter={actionFilter}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onDeviceChange={handleDeviceChange}
          onActionChange={handleActionChange}
          onStatusChange={handleStatusChange}
        />

        {/* Table Box with Ant Design Pagination */}
        <Card
          styles={{ body: { padding: 0 } }}
          style={{
            borderRadius: 12,
            borderColor: '#e2e8f0',
            overflow: 'hidden',
          }}
        >
          <ActionDataTable records={records} loading={isLoading} />
          <Flex
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={12}
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <Text type="secondary" style={{ fontSize: 12 }}>
              Hiển thị{' '}
              <Text strong style={{ color: '#09353D' }}>
                {records.length}
              </Text>{' '}
              / Tổng số {total} thao tác đã ghi nhận
            </Text>

            <Pagination
              size="small"
              current={currentPage}
              pageSize={limit}
              total={total}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              onChange={(page, pageSize) => {
                setCurrentPage(page);
                setLimit(pageSize);
              }}
            />
          </Flex>
        </Card>
      </Space>
    </div>
  );
};

export default ActivityLogPage;
