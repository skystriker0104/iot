import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, Input, Select, Button, Flex, Typography } from 'antd';
import type { InputRef } from 'antd';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { SENSOR_TYPE_OPTIONS } from './const';
import { useDebounce } from '../../../lib/hooks';

const { Text } = Typography;

interface SensorFilterBarProps {
  appliedSearch: string;
  appliedSensorType: string;
  sortOrder: 'asc' | 'desc';
  isResetting: boolean;
  onSearch: (params: { keyword: string; sensorType: string }) => void;
  onToggleSortOrder: () => void;
  onReset: () => void;
}

export const SensorFilterBar: React.FC<SensorFilterBarProps> = ({
  appliedSearch,
  appliedSensorType,
  sortOrder,
  isResetting,
  onSearch,
  onToggleSortOrder,
  onReset,
}) => {
  const [keyword, setKeyword] = useState(appliedSearch);
  const [sensorType, setSensorType] = useState(appliedSensorType);
  const searchInputRef = useRef<InputRef>(null);

  // Debounce 500ms cho ô nhập từ khóa tìm kiếm
  const debouncedKeyword = useDebounce(keyword, 500);

  const handleKeywordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  const handleSensorTypeChange = useCallback((val: string) => {
    setSensorType(val);
    onSearch({ keyword: keyword.trim(), sensorType: val });
    if (val === 'time') {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [keyword, onSearch]);

  const handleSearchSubmit = useCallback(() => {
    onSearch({ keyword: keyword.trim(), sensorType });
  }, [keyword, sensorType, onSearch]);

  const handleResetClick = useCallback(() => {
    setKeyword('');
    setSensorType('all');
    onReset();
  }, [onReset]);

  useEffect(() => {
    if (debouncedKeyword.trim() !== appliedSearch.trim()) {
      onSearch({ keyword: debouncedKeyword.trim(), sensorType });
    }
  }, [debouncedKeyword, sensorType, appliedSearch, onSearch]);

  useEffect(() => {
    setKeyword(appliedSearch);
  }, [appliedSearch]);

  useEffect(() => {
    setSensorType(appliedSensorType);
  }, [appliedSensorType]);

  return (
    <Card styles={{ body: { padding: 16 } }} style={{ borderRadius: 12, borderColor: '#e2e8f0' }}>
      <Flex wrap="wrap" align="flex-end" gap={12}>
        {/* Search Keyword */}
        <div style={{ flex: '1 1 220px' }}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            {sensorType === 'time' ? 'Nhập thời gian tìm kiếm' : 'Từ khóa tìm kiếm'}
          </Text>
          <Input
            ref={searchInputRef}
            value={keyword}
            onChange={handleKeywordChange}
            onPressEnter={handleSearchSubmit}
            prefix={<Search size={15} color="#94a3b8" />}
            placeholder={
              sensorType === 'time'
                ? 'Nhập giờ (20:15:00, 20h), ngày tháng (22/09/2026, 22/09)...'
                : 'Nhập ID, giờ (20:15), ngày (22/09), giá trị...'
            }
          />
        </div>

        {/* Ant Design Select: Loại cảm biến */}
        <div style={{ width: 220 }}>
          <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
            Loại cảm biến
          </Text>
          <Select
            value={sensorType}
            onChange={handleSensorTypeChange}
            options={SENSOR_TYPE_OPTIONS}
            style={{ width: '100%' }}
          />
        </div>

        {/* Submit Search Button */}
        {/* <Button
          type="primary"
          icon={<Search size={14} />}
          onClick={handleSearchSubmit}
          style={{ height: 36 }}
        >
          Tìm kiếm
        </Button> */}

        {/* Sort Button */}
        <Button
          icon={
            <SlidersHorizontal
              size={14}
              style={{
                transform: sortOrder === 'asc' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
            />
          }
          onClick={onToggleSortOrder}
          style={{ height: 36 }}
        >
          Sắp xếp ({sortOrder.toUpperCase()})
        </Button>

        {/* Reset / Refresh Button */}
        <Button
          icon={<RefreshCw size={14} />}
          onClick={handleResetClick}
          loading={isResetting}
          style={{ height: 36 }}
        >
          Làm mới
        </Button>
      </Flex>
    </Card>
  );
};

export default SensorFilterBar;
