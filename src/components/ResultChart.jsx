// components/ResultChart.jsx
import { motion } from 'framer-motion';
import { Award, Crown } from 'lucide-react';
import Icon from './Icon';

export default function ResultChart({ options, votes, totalVotes, showWinner = true }) {
  const maxVotes = Math.max(...votes);
  const isTie = votes.filter(v => v === maxVotes).length > 1;
  const icons = ['pizza', 'joystick', 'location', 'coins', 'vote', 'bench', 'medal', 'clock'];

  return (
    <div className="space-y-4">
      {showWinner && maxVotes > 0 && !isTie && (
        <div className="flex items-center justify-center gap-2 mb-4 text-[#52B788]">
          <Crown size={18} />
          <span className="text-sm font-medium">Leading option</span>
        </div>
      )}
      
      {options.map((opt, idx) => {
        const percent = totalVotes === 0 ? 0 : (votes[idx] / totalVotes) * 100;
        const isLeading = votes[idx] === maxVotes && maxVotes > 0 && !isTie;
        return (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="flex justify-between text-sm mb-2">
              <div className="flex items-center gap-2 flex-1">
                <Icon name={icons[idx % icons.length]} size={20} />
                <span className={`font-medium ${isLeading ? 'text-[#1B4D3E] font-bold' : 'text-[#52796F]'}`}>
                  {opt}
                </span>
                {isLeading && <Award size={14} className="text-[#52B788]" />}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isLeading ? 'text-[#1B4D3E] font-bold' : 'text-[#84A98C]'}`}>
                  {votes[idx]}
                </span>
                <span className="text-xs text-[#84A98C]">({Math.round(percent)}%)</span>
              </div>
            </div>
            <div className="h-3 bg-[#E9F5E8] rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${
                  isLeading 
                    ? 'bg-gradient-to-r from-[#52B788] to-[#2D6A4F]' 
                    : 'bg-[#95D5B2]'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}