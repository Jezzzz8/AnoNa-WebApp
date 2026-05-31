// components/BubbleMenu.jsx - Added enhanced hover animations for category cards
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Pizza, MapPin, Coins, Gamepad2, Trees, Type } from 'lucide-react';
import pizzaCalm from '../assets/icons/wired-outline-13-pizza-in-calm.svg';
import pizzaHover from '../assets/icons/wired-outline-13-pizza-hover-rotate.svg';
import joystickCalm from '../assets/icons/wired-outline-1461-joistick-alt-in-reveal.svg';
import joystickHover from '../assets/icons/wired-outline-1461-joistick-alt-hover-pinch.svg';
import locationCalm from '../assets/icons/wired-outline-18-location-pin-in-roll-calm.svg';
import locationHover from '../assets/icons/wired-outline-18-location-pin-hover-jump-roll.svg';
import coinsCalm from '../assets/icons/wired-outline-298-coins-in-reveal.svg';
import coinsHover from '../assets/icons/wired-outline-298-coins-hover-spending.svg';
import benchCalm from '../assets/icons/wired-outline-1935-park-bench-in-reveal.svg';
import benchHover from '../assets/icons/wired-outline-1935-park-bench-hover-pinch.svg';
import voteCalm from '../assets/icons/wired-outline-1933-vote-elections-in-reveal.svg';
import voteHover from '../assets/icons/wired-outline-1933-vote-elections-hover-pinch.svg';

const DEFAULT_ITEMS = [
  {
    label: 'Food',
    value: 'food',
    href: '#',
    ariaLabel: 'Food Poll',
    icon: Pizza,
    iconSvg: pizzaCalm,
    iconHoverSvg: pizzaHover,
    animation: 'rotate-icon',
    hoverStyles: { bgColor: '#2D6A4F', textColor: '#FFFFFF' }
  },
  {
    label: 'Place',
    value: 'place',
    href: '#',
    ariaLabel: 'Place Poll',
    icon: MapPin,
    iconSvg: locationCalm,
    iconHoverSvg: locationHover,
    animation: 'bounce-icon',
    hoverStyles: { bgColor: '#52B788', textColor: '#FFFFFF' }
  },
  {
    label: 'Bet',
    value: 'bet',
    href: '#',
    ariaLabel: 'Bet Poll',
    icon: Coins,
    iconSvg: coinsCalm,
    iconHoverSvg: coinsHover,
    animation: 'spin-icon',
    hoverStyles: { bgColor: '#74C69D', textColor: '#FFFFFF' }
  },
  {
    label: 'Game',
    value: 'game',
    href: '#',
    ariaLabel: 'Game Poll',
    icon: Gamepad2,
    iconSvg: joystickCalm,
    iconHoverSvg: joystickHover,
    animation: 'shake-icon',
    hoverStyles: { bgColor: '#95D5B2', textColor: '#1B4D3E' }
  },
  {
    label: 'Hangout',
    value: 'hangout',
    href: '#',
    ariaLabel: 'Hangout Poll',
    icon: Trees,
    iconSvg: benchCalm,
    iconHoverSvg: benchHover,
    animation: 'pulse-icon',
    hoverStyles: { bgColor: '#D8F3DC', textColor: '#1B4D3E' }
  },
  {
    label: 'Poll',
    value: 'other',
    href: '#',
    ariaLabel: 'Other Poll',
    icon: Type,
    iconSvg: voteCalm,
    iconHoverSvg: voteHover,
    animation: 'wobble-icon',
    hoverStyles: { bgColor: '#E9F5E8', textColor: '#1B4D3E' }
  }
];

export default function BubbleMenu({
  logo,
  onSelectCategory,
  onMenuClick,
  className,
  style,
  menuAriaLabel = 'Toggle menu',
  menuBg = '#fff',
  menuContentColor = '#1B4D3E',
  useFixedPosition = false,
  items,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [animateIcon, setAnimateIcon] = useState({});

  const overlayRef = useRef(null);
  const bubblesRef = useRef([]);
  const labelRefs = useRef([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;

  const containerClassName = [
    'bubble-menu',
    'fixed inset-0',
    'flex flex-col items-center justify-center',
    'bg-gradient-to-b from-white to-[#F5FEF7]',
    'z-[1001]',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleSelect = (item, idx) => {
    if (onSelectCategory) {
      onSelectCategory(item);
    }
  };

  const handleItemHover = (idx, isHovering) => {
    if (isHovering) {
      setHoveredItem(idx);
      // Trigger icon animation
      setAnimateIcon(prev => ({ ...prev, [idx]: true }));
      // Reset animation after duration
      setTimeout(() => {
        setAnimateIcon(prev => ({ ...prev, [idx]: false }));
      }, 500);
    } else {
      setHoveredItem(null);
    }
  };

  useEffect(() => {
    const overlay = overlayRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);
    if (!overlay || !bubbles.length) return;

    if (isMenuOpen) {
      gsap.set(overlay, { display: 'flex' });
      gsap.killTweensOf([...bubbles, ...labels]);
      gsap.set(bubbles, { scale: 0, transformOrigin: '50% 50%' });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, i) => {
        const delay = i * staggerDelay + gsap.utils.random(-0.05, 0.05);
        const tl = gsap.timeline({ delay });
        tl.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase
        });
        if (labels[i]) {
          tl.to(
            labels[i],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: 'power3.out'
            },
            '-=' + animationDuration * 0.9
          );
        }
      });
    }
  }, [isMenuOpen, animationEase, animationDuration, staggerDelay]);

  // Get animation class for icon
  const getIconAnimationClass = (animationType, isAnimating) => {
    if (!isAnimating) return '';
    switch(animationType) {
      case 'rotate-icon':
        return 'animate-icon-rotate';
      case 'bounce-icon':
        return 'animate-icon-bounce';
      case 'spin-icon':
        return 'animate-icon-spin';
      case 'shake-icon':
        return 'animate-icon-shake';
      case 'pulse-icon':
        return 'animate-icon-pulse';
      case 'wobble-icon':
        return 'animate-icon-wobble';
      default:
        return 'animate-icon-pulse';
    }
  };

  return (
    <>
      <style>{`
        .bubble-menu .pill-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 20px;
          list-style: none;
        }
        .bubble-menu .pill-col {
          flex: 0 0 calc(33.333% - 24px);
          min-width: 160px;
        }
        .bubble-menu .pill-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          width: 100%;
          padding: 32px 16px;
          border-radius: 24px;
          background: white;
          border: 2px solid #D8F3DC;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          min-height: 160px;
          position: relative;
          overflow: hidden;
        }
        .bubble-menu .pill-link::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at center, var(--hover-bg) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .bubble-menu .pill-link:hover {
          transform: translateY(-8px);
          border-color: var(--hover-bg);
          background: var(--hover-bg);
          box-shadow: 0 12px 28px rgba(45, 106, 79, 0.2);
        }
        .bubble-menu .pill-link:hover::before {
          opacity: 0.1;
        }
        .bubble-menu .pill-link:hover .pill-label {
          color: var(--hover-color);
          transform: scale(1.02);
        }
        .bubble-menu .pill-link:hover .pill-icon {
          filter: brightness(0) invert(1);
        }
        .pill-icon {
          width: 56px;
          height: 56px;
          object-fit: contain;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .bubble-menu .pill-label {
          font-size: 1.25rem;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          color: #1B4D3E;
        }
        
        /* Icon Hover Animations */
        @keyframes iconRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes iconSpin {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        @keyframes iconShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes iconWobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-12deg); }
          75% { transform: rotate(12deg); }
        }
        
        .animate-icon-rotate {
          animation: iconRotate 0.6s ease-in-out;
        }
        .animate-icon-bounce {
          animation: iconBounce 0.5s ease-in-out;
        }
        .animate-icon-spin {
          animation: iconSpin 0.7s ease-in-out;
        }
        .animate-icon-shake {
          animation: iconShake 0.4s ease-in-out;
        }
        .animate-icon-pulse {
          animation: iconPulse 0.5s ease-in-out;
        }
        .animate-icon-wobble {
          animation: iconWobble 0.5s ease-in-out;
        }
        
        @media (max-width: 768px) {
          .bubble-menu .pill-col {
            flex: 0 0 calc(50% - 24px);
            min-width: 140px;
          }
          .bubble-menu .pill-link {
            padding: 24px 12px;
            min-height: 140px;
          }
          .bubble-menu .pill-label {
            font-size: 1rem;
          }
          .pill-icon {
            width: 44px;
            height: 44px;
          }
        }
        @media (max-width: 480px) {
          .bubble-menu .pill-list {
            gap: 16px;
            padding: 20px 16px;
          }
          .bubble-menu .pill-col {
            flex: 0 0 calc(50% - 16px);
            min-width: 120px;
          }
          .bubble-menu .pill-link {
            padding: 20px 12px;
            min-height: 120px;
          }
          .pill-icon {
            width: 36px;
            height: 36px;
          }
          .bubble-menu .pill-label {
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className={containerClassName} style={style}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1B4D3E] mb-2">What's this about?</h1>
          <p className="text-[#84A98C]">Choose a category for your poll</p>
        </div>

        <div ref={overlayRef} className="w-full flex items-center justify-center">
          <ul className="pill-list" role="menu">
            {menuItems.map((item, idx) => (
              <li 
                key={idx} 
                role="none" 
                className="pill-col"
                onMouseEnter={() => handleItemHover(idx, true)}
                onMouseLeave={() => handleItemHover(idx, false)}
              >
                <div
                  role="menuitem"
                  className="pill-link"
                  onClick={() => handleSelect(item, idx)}
                  style={{
                    ['--hover-bg']: item.hoverStyles?.bgColor || '#D8F3DC',
                    ['--hover-color']: item.hoverStyles?.textColor || '#FFFFFF'
                  }}
                  ref={el => {
                    if (el) bubblesRef.current[idx] = el;
                  }}
                >
                  <img 
                    src={hoveredItem === idx ? item.iconHoverSvg : item.iconSvg}
                    alt={item.label}
                    className={`pill-icon ${animateIcon[idx] ? getIconAnimationClass(item.animation, true) : ''}`}
                  />
                  <span
                    className="pill-label"
                    ref={el => {
                      if (el) labelRefs.current[idx] = el;
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}