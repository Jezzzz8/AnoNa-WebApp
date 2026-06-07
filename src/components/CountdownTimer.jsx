// components/CountdownTimer.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';

export default function CountdownTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = new Date(expiresAt) - new Date();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setProgress(0);
        onExpire?.();
      } else {
        setTimeLeft(Math.floor(remaining / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  useEffect(() => {
    if (timeLeft > 0 && expiresAt) {
      const totalDuration = new Date(expiresAt).getTime() - new Date(Date.now() - timeLeft * 1000).getTime();
      const percent = (timeLeft / (totalDuration / 1000)) * 100;
      setProgress(Math.max(0, Math.min(100, percent)));
    }
  }, [timeLeft, expiresAt]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#D8F3DC]">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Icon name="clock" isActive={timeLeft < 10} size={28} />
        <div className="text-5xl font-mono font-bold text-[#1B4D3E]">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
      
      {/* Circular Progress Ring */}
      <div className="relative w-24 h-24 mx-auto mb-4">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="44"
            stroke="#E9F5E8"
            strokeWidth="6"
            fill="none"
          />
          <motion.circle
            cx="48"
            cy="48"
            r="44"
            stroke="url(#gradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDasharray: 276.46 }}
            animate={{ strokeDashoffset: 276.46 * (1 - progress / 100) }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#52B788" />
              <stop offset="100%" stopColor="#2D6A4F" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-sm font-bold text-[#1B4D3E]">{Math.floor(progress)}%</div>
        </div>
      </div>
    </div>
  );
}