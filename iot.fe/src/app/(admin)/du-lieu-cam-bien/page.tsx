import React, { useState, useCallback } from 'react';
import { Card, Pagination, Typography, Space, Flex, Tag, Badge } from 'antd';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../../stores/useAppStore';
import { SensorFilterBar } from './SensorFilterBar';
import { SensorDataTable } from './SensorDataTable';
import { useSensorDataQuery, queryKeys } from '../../../lib/queries';

const { Title, Text } = Typography;

export const SensorDataPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { resetSensorRecords } = useAppStore();

  const [search, setSearch] = useState('');
  const [sensorTypeFilter, setSensorTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isResetting, setIsResetting] = useState(false);

  // 1. TanStack Query Hook kết hợp SignalR tự động cập nhật bản ghi mới tức thời
  const { data: pagedData, isLoading } = useSensorDataQuery({
    page: currentPage,
    pageSize: limit,
    sensorType: sensorTypeFilter,
    sortOrder,
    search,
  });

  const records = pagedData?.items || [];
  const total = pagedData?.total || 0;

  const handleReset = useCallback(() => {
    setIsResetting(true);
    setSearch('');
    setSensorTypeFilter('all');
    setCurrentPage(1);
    resetSensorRecords();

    // Invalidate query cache để nạp lại dữ liệu mới nhất
    queryClient.invalidateQueries({ queryKey: queryKeys.sensors.all });

    setTimeout(() => {
      setIsResetting(false);
    }, 400);
  }, [resetSensorRecords, queryClient]);

  const handleSearch = useCallback(({ keyword, sensorType }: { keyword: string; sensorType: string }) => {
    setSearch(keyword);
    setSensorTypeFilter(sensorType);
    setCurrentPage(1);
  }, []);

  const handleToggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
       
        {/* Filter Toolbar */}
        <SensorFilterBar
          appliedSearch={search}
          appliedSensorType={sensorTypeFilter}
          sortOrder={sortOrder}
          isResetting={isResetting}
          onSearch={handleSearch}
          onReset={handleReset}
          onToggleSortOrder={handleToggleSortOrder}
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
          <SensorDataTable records={records} loading={isLoading} />

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
              / Tổng số {total} bản ghi cảm biến
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

export default SensorDataPage;
