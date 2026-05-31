// components/Illustration.jsx - Optimized with proper scaling
import { motion } from 'framer-motion';

import groupChat from '../assets/illustrations/Group Chat-rafiki.svg';
import socialInteraction from '../assets/illustrations/Social interaction-rafiki.svg';
import yesNo from '../assets/illustrations/Yes or no-bro.svg';

const illustrationMap = {
  groupChat: { src: groupChat, label: 'Group Chat', maxWidth: 260 },
  socialInteraction: { src: socialInteraction, label: 'Social Interaction', maxWidth: 240 },
  yesNo: { src: yesNo, label: 'Yes or No', maxWidth: 220 }
};

export default function Illustration({ type, className = '', animate = true, size = 'md' }) {
  const illustration = illustrationMap[type];
  
  if (!illustration) return null;

  const sizeClasses = {
    sm: 'max-w-[160px]',
    md: 'max-w-[220px]',
    lg: 'max-w-[280px]'
  };

  return (
    <motion.div
      animate={animate ? { y: [0, -6, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      className={`${className} ${sizeClasses[size]}`}
    >
      <img 
        src={illustration.src} 
        alt={illustration.label}
        className="w-full h-auto"
        loading="lazy"
        style={{ 
          maxWidth: illustration.maxWidth,
          margin: '0 auto',
          opacity: 0.85
        }}
      />
    </motion.div>
  );
}