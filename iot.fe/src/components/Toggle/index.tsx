import React, { useCallback } from 'react';
import type { ToggleProps } from './type';

export const Toggle: React.FC<ToggleProps> = ({
  on,
  onChange,
  color = '#10B981',
  disabled = false,
  className = ''
}) => {
  // ─── Function (useCallback) ────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (!disabled) {
      onChange(!on);
    }
  }, [disabled, onChange, on]);

  // ─── Render JSX ────────────────────────────────────────────────────────────
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      style={{ backgroundColor: on ? color : '#D6D3D1' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: on ? 'translateX(1.375rem)' : 'translateX(0.125rem)' }}
      />
    </button>
  );
};

export default Toggle;
