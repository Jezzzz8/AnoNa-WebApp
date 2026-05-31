// components/PollCard.jsx - Enhanced with better animations
import { motion } from 'framer-motion';
import Icon from './Icon';
import { CheckCircle } from 'lucide-react';

export default function PollCard({ 
  option, 
  index, 
  iconName, 
  isSelected, 
  onSelect, 
  disabled = false 
}) {
  const icons = ['pizza', 'joystick', 'location', 'coins', 'vote', 'bench', 'medal', 'clock'];
  const icon = iconName || icons[index % icons.length];

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: disabled ? 1 : 1.01, x: disabled ? 0 : 4 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onSelect}
      disabled={disabled}
      className={`poll-card w-full p-4 rounded-xl flex items-center gap-3 transition-all text-left ${
        isSelected 
          ? 'poll-card-selected shadow-lg' 
          : 'bg-white border-2 border-[#E2F0E6] hover:border-[#52B788] hover:shadow-md'
        }
        ${disabled && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <Icon name={icon} isActive={isSelected} size={28} />
      <span className={`text-base font-medium flex-1 ${isSelected ? 'text-white' : 'text-[#1B4D3E]'}`}>
        {option}
      </span>
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0"
        >
          <CheckCircle size={20} className="text-white" />
        </motion.div>
      )}
    </motion.button>
  );
}