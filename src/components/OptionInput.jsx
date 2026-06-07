// components/OptionInput.jsx
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

export default function OptionInput({ 
  letter, 
  value, 
  onChange, 
  onRemove, 
  showRemove,
  placeholder,
  autoFocus = false
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-2"
    >
      <div className="flex-1 relative">
        <div className="flex items-center gap-3 bg-white border border-[#D8F3DC] rounded-xl px-4 py-3 hover:border-[#52B788] transition-all focus-within:border-[#52B788] focus-within:ring-2 focus-within:ring-[#52B788]/20">
          <span className="text-[#52B788] font-bold w-6 text-lg">{letter}.</span>
          <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="bg-transparent flex-1 text-[#1B4D3E] text-base focus:outline-none placeholder:text-[#84A98C] placeholder:text-sm"
            autoFocus={autoFocus}
          />
        </div>
      </div>
      {showRemove && (
        <button
          onClick={onRemove}
          className="p-2 text-[#84A98C] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 flex-shrink-0"
          aria-label="Remove option"
        >
          <Trash2 size={18} />
        </button>
      )}
    </motion.div>
  );
}