// components/Toggle.jsx
import { useState } from 'react';

export default function Toggle({
  label,
  checked,
  onChange,
  defaultChecked = false,
  size = 'md',
  disabled = false,
  description = ''
}) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isChecked;
    if (checked === undefined) setInternalChecked(newValue);
    onChange?.(newValue);
  };

  // Exact pixel sizes for perfect sliding
  const sizes = {
    sm: { trackWidth: 32, trackHeight: 16, thumbSize: 12, translateOn: 16 },
    md: { trackWidth: 44, trackHeight: 24, thumbSize: 20, translateOn: 20 }
  };
  const s = sizes[size];

  return (
    <div className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        onClick={handleToggle}
        disabled={disabled}
        className="relative inline-flex rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:ring-offset-2"
        style={{
          width: s.trackWidth,
          height: s.trackHeight,
          backgroundColor: isChecked ? '#52B788' : '#CBD5E1',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <span
          className="absolute inline-block rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out"
          style={{
            width: s.thumbSize,
            height: s.thumbSize,
            top: '50%',
            left: '2px',
            transform: `translateY(-50%) translateX(${isChecked ? s.translateOn : 0}px)`,
          }}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-sm font-medium text-[#1B4D3E]">{label}</span>}
          {description && <span className="text-xs text-[#84A98C]">{description}</span>}
        </div>
      )}
    </div>
  );
}