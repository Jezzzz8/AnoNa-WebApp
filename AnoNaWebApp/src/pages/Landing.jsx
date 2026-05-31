// pages/Landing.jsx - Remove green filter from logo
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Link2, Leaf, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Illustration from '../components/Illustration';
import anonaLogo from '../assets/icons/anona_logo.svg';

export default function Landing() {
  const navigate = useNavigate();
  const [pollLink, setPollLink] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [floatingLeaves, setFloatingLeaves] = useState([]);

  useEffect(() => {
    const leaves = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 8,
      size: 16 + Math.random() * 16,
      rotation: Math.random() * 360
    }));
    setFloatingLeaves(leaves);
  }, []);

  const handleOpenPoll = () => {
    if (pollLink.trim()) {
      const id = pollLink.trim().split('/').pop();
      navigate(`/poll/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F5FEF7] to-white flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Floating Leaves */}
      <div className="leaves-container">
        {floatingLeaves.map(leaf => (
          <motion.div
            key={leaf.id}
            className="leaf"
            style={{
              left: `${leaf.left}%`,
              top: '-10%',
              position: 'absolute',
              opacity: 0.06,
              pointerEvents: 'none'
            }}
            animate={{
              y: ['0vh', '120vh'],
              rotate: [leaf.rotation, leaf.rotation + 360],
              x: [0, Math.sin(leaf.id) * 30]
            }}
            transition={{
              duration: leaf.duration,
              delay: leaf.delay,
              repeat: Infinity,
              ease: 'linear'
            }}
          >
            <Leaf size={leaf.size} fill="#2D6A4F" color="#2D6A4F" />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Anona Logo and Title - Closer together */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Logo - Original colors */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-1"
          >
            <img 
              src={anonaLogo} 
              alt="AnoNa Logo" 
              className="w-16 h-16 md:w-20 md:h-20 object-contain"
            />
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-[#1B4D3E] to-[#52B788] bg-clip-text text-transparent"
          >
            AnoNa
          </motion.h1>
        </motion.div>

        {/* Social Interaction Illustration */}
        <Illustration type="socialInteraction" size="lg" className="my-6" />

        {/* Buttons Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="w-full max-w-xs space-y-3 mt-4"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/category')}
            className="btn-primary"
          >
            <PlusCircle size={22} className="inline-block mr-3 animate-pulse" />
            Create Poll
          </motion.button>

          <AnimatePresence mode="wait">
            {!showLinkInput ? (
              <motion.button
                key="openBtn"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: 20 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLinkInput(true)}
                className="btn-secondary"
              >
                <Link2 size={20} className="inline-block mr-2" />
                Open a Poll Link
              </motion.button>
            ) : (
              <motion.div
                key="inputGroup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Paste poll link..."
                  value={pollLink}
                  onChange={(e) => setPollLink(e.target.value)}
                  className="input-field text-center"
                  autoFocus
                />
                <button
                  onClick={handleOpenPoll}
                  className="btn-primary"
                >
                  Join Poll <ArrowRight size={18} className="inline-block ml-2" />
                </button>
                <button
                  onClick={() => setShowLinkInput(false)}
                  className="w-full py-2 text-[#84A98C] text-sm hover:text-[#52B788] transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Decorative Green Wave */}
      <div className="absolute bottom-0 left-0 right-0 opacity-10 pointer-events-none z-0">
        <svg viewBox="0 0 1440 80" fill="none">
          <path d="M0 40L60 44C120 48 240 56 360 52C480 48 600 32 720 28C840 24 960 32 1080 36C1200 40 1320 40 1380 40L1440 40V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V40Z" fill="#2D6A4F"/>
        </svg>
      </div>
    </div>
  );
}