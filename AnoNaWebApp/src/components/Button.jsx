// components/Button.jsx - Enhanced with better styling
import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  variant = 'primary', 
  iconLeft, 
  iconRight, 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  fullWidth = true
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] text-white shadow-md hover:shadow-lg active:shadow-sm',
    secondary: 'bg-[#E9F5E8] text-[#2D6A4F] hover:bg-[#D8F3DC] border border-[#D8F3DC]',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-md',
    outline: 'border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#E9F5E8]'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.01 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={`
        py-3 px-6 rounded-xl font-semibold text-base
        flex items-center justify-center gap-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : 'inline-flex'}
        ${variants[variant]}
        ${className}
      `}
    >
      {iconLeft && <span className="w-5 h-5 flex-shrink-0">{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span className="w-5 h-5 flex-shrink-0">{iconRight}</span>}
    </motion.button>
  );
}