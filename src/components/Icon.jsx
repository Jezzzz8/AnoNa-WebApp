// components/Icon.jsx - Enhanced with loop animations for active state
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Optimized icon imports
import pizzaCalm from '../assets/icons/wired-outline-13-pizza-in-calm.svg';
import pizzaHover from '../assets/icons/wired-outline-13-pizza-hover-rotate.svg';
import joystickCalm from '../assets/icons/wired-outline-1461-joistick-alt-in-reveal.svg';
import joystickHover from '../assets/icons/wired-outline-1461-joistick-alt-hover-pinch.svg';
import medalCalm from '../assets/icons/wired-outline-1780-medal-first-place-in-reveal.svg';
import medalHover from '../assets/icons/wired-outline-1780-medal-first-place-hover-pinch.svg';
import locationCalm from '../assets/icons/wired-outline-18-location-pin-in-roll-calm.svg';
import locationHover from '../assets/icons/wired-outline-18-location-pin-hover-jump-roll.svg';
import voteCalm from '../assets/icons/wired-outline-1933-vote-elections-in-reveal.svg';
import voteHover from '../assets/icons/wired-outline-1933-vote-elections-hover-pinch.svg';
import benchCalm from '../assets/icons/wired-outline-1935-park-bench-in-reveal.svg';
import benchHover from '../assets/icons/wired-outline-1935-park-bench-hover-pinch.svg';
import arrowCalm from '../assets/icons/wired-outline-212-arrow-1-rounded-in-reveal.svg';
import arrowHover from '../assets/icons/wired-outline-212-arrow-1-rounded-loop-cycle.svg';
import shareCalm from '../assets/icons/wired-outline-259-share-arrow-in-reveal.svg';
import shareHover from '../assets/icons/wired-outline-259-share-arrow-hover-pointing.svg';
import coinsCalm from '../assets/icons/wired-outline-298-coins-in-reveal.svg';
import coinsHover from '../assets/icons/wired-outline-298-coins-hover-spending.svg';
import clockCalm from '../assets/icons/wired-outline-45-clock-time-in-reveal.svg';
import clockHover from '../assets/icons/wired-outline-45-clock-time-loop-oscillate.svg';

const iconMap = {
  pizza: { calm: pizzaCalm, hover: pizzaHover, label: 'Pizza' },
  joystick: { calm: joystickCalm, hover: joystickHover, label: 'Gaming' },
  medal: { calm: medalCalm, hover: medalHover, label: 'Achievement' },
  location: { calm: locationCalm, hover: locationHover, label: 'Location' },
  vote: { calm: voteCalm, hover: voteHover, label: 'Vote' },
  bench: { calm: benchCalm, hover: benchHover, label: 'Rest' },
  arrow: { calm: arrowCalm, hover: arrowHover, label: 'Arrow' },
  share: { calm: shareCalm, hover: shareHover, label: 'Share' },
  coins: { calm: coinsCalm, hover: coinsHover, label: 'Money' },
  clock: { calm: clockCalm, hover: clockHover, label: 'Time' }
};

export default function Icon({ name, isActive = false, size = 24, className = '', animateOnHover = true, loopAnimation = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIcon, setCurrentIcon] = useState(iconMap[name]?.calm);
  const [key, setKey] = useState(0);

  // Handle active state animation loop
  useEffect(() => {
    if (isActive && loopAnimation) {
      // Start animation loop
      const interval = setInterval(() => {
        setKey(prev => prev + 1);
      }, 1500); // Animation cycle duration
      
      return () => clearInterval(interval);
    }
  }, [isActive, loopAnimation]);

  useEffect(() => {
    if (isActive && iconMap[name]?.hover) {
      setCurrentIcon(iconMap[name].hover);
    } else if (isHovered && animateOnHover && iconMap[name]?.hover) {
      setCurrentIcon(iconMap[name].hover);
      setTimeout(() => {
        if (!isActive && !isHovered) {
          setCurrentIcon(iconMap[name].calm);
        }
      }, 300);
    } else {
      setCurrentIcon(iconMap[name]?.calm);
    }
  }, [isActive, isHovered, name, animateOnHover]);

  if (!iconMap[name]) return null;

  const handleHoverStart = () => {
    if (animateOnHover && !isActive) {
      setIsHovered(true);
    }
  };

  const handleHoverEnd = () => {
    if (animateOnHover && !isActive) {
      setIsHovered(false);
    }
  };

  return (
    <motion.div
      key={key}
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      animate={isActive && loopAnimation ? {
        scale: [1, 1.08, 1],
        rotate: [0, 5, -5, 0],
      } : isHovered ? {
        scale: [1, 1.1, 1],
        rotate: [0, 8, -8, 0],
      } : {}}
      transition={{ duration: 0.8, repeat: isActive && loopAnimation ? Infinity : 0, ease: "easeInOut" }}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <img 
        src={currentIcon} 
        alt={iconMap[name].label}
        className="w-full h-full object-contain transition-all duration-300"
        loading="lazy"
      />
    </motion.div>
  );
}