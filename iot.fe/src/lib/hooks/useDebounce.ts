import { useState, useEffect } from 'react';

/**
 * Custom hook hoãn cập nhật giá trị sau một khoảng thời gian delay nhất định (mặc định 500ms)
 * Giúp giảm tải tần suất gọi API khi người dùng gõ phím trong ô tìm kiếm
 *
 * @param value Giá trị đầu vào cần debounce
 * @param delay Thời gian hoãn tính theo mili-giây (mặc định 500ms)
 * @returns Giá trị sau khi được debounce
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

