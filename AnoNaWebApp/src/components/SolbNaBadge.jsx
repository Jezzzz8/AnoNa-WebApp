// components/SolbNaBadge.jsx
import { motion } from 'framer-motion';

export default function SolbNaBadge({ status, subtext }) {
  const getStatusStyle = () => {
    switch(status) {
      case 'solbna':
        return 'bg-gradient-to-r from-[#1B4D3E] to-[#52B788] text-transparent bg-clip-text';
      case 'labanna':
        return 'text-[#52B788]';
      case 'walapa':
        return 'text-[#84A98C]';
      default:
        return 'bg-gradient-to-r from-[#1B4D3E] to-[#52B788] text-transparent bg-clip-text';
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'solbna':
        return 'SolbNa';
      case 'labanna':
        return 'LabanNa';
      case 'walapa':
        return 'WalaPa';
      default:
        return 'SolbNa';
    }
  };

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center mb-8"
    >
      <motion.div
        animate={{ 
          scale: status === 'solbna' ? [1, 1.05, 1] : 1,
          rotate: status === 'labanna' ? [0, -2, 2, 0] : 0
        }}
        transition={{ duration: 2, repeat: status === 'solbna' ? Infinity : 0 }}
      >
        <span className={`text-7xl font-black ${getStatusStyle()}`}>
          {getStatusText()}
        </span>
      </motion.div>
      {subtext && (
        <p className="text-[#52796F] text-sm mt-2">{subtext}</p>
      )}
    </motion.div>
  );
}