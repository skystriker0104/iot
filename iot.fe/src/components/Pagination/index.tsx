import React, { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from 'antd';
import { MONO } from '../../lib/theme/theme';
import type { AppPaginationProps } from './type';

export const AppPagination: React.FC<AppPaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
  itemLabel = 'bản ghi',
  className = ''
}) => {
  // ─── Biến & useMemo ────────────────────────────────────────────────────────
  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize) || 1, [totalItems, pageSize]);
  const startItem = useMemo(() => (totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0), [totalItems, currentPage, pageSize]);
  const endItem = useMemo(() => Math.min(currentPage * pageSize, totalItems), [currentPage, pageSize, totalItems]);
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5), [totalPages]);

  const selectOptions = useMemo(
    () => pageSizeOptions.map((opt) => ({ value: opt, label: `${opt} / trang` })),
    [pageSizeOptions]
  );

  // ─── Function (useCallback) ────────────────────────────────────────────────
  const handlePrev = useCallback(() => {
    onPageChange(Math.max(currentPage - 1, 1));
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    onPageChange(Math.min(currentPage + 1, totalPages));
  }, [currentPage, totalPages, onPageChange]);

  const handleSizeChange = useCallback(
    (val: number) => {
      onPageSizeChange(val);
      onPageChange(1);
    },
    [onPageSizeChange, onPageChange]
  );

  // ─── Render JSX ────────────────────────────────────────────────────────────
  return (
    <div className={`px-6 py-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs ${className}`}>
      <div className="flex flex-wrap items-center gap-4 text-slate-500">
        <div>
          Hiển thị <span className="font-bold text-slate-800" style={MONO}>{startItem}</span> -{' '}
          <span className="font-bold text-slate-800" style={MONO}>{endItem}</span> /{' '}
          <span className="font-bold text-slate-800" style={MONO}>{totalItems}</span> {itemLabel}
        </div>

        {/* Page Size Selector using Ant Design Select */}
        <div className="flex items-center gap-2 border-l border-slate-200 pl-3.5">
          <span className="text-slate-500 font-medium">Bản ghi:</span>
          <Select
            value={pageSize}
            onChange={handleSizeChange}
            options={selectOptions}
            size="small"
            className="w-28 text-xs font-mono font-semibold"
            popupClassName="text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft size={14} />
        </button>
        {pageNumbers.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentPage === p
                ? 'bg-[#09353D] text-white shadow-xs'
                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            style={MONO}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default AppPagination;
