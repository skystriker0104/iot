export interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
  color?: string;
  disabled?: boolean;
  className?: string;
}
