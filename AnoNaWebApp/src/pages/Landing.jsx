// pages/Landing.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Gift, Link2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Illustration from '../components/Illustration';
import anonaLogo from '../assets/icons/anona_logo.svg';

// Expandable link join card (works with PollNa and DrawNa links)
function LinkJoinCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState('');
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!link.trim()) return;
    const id = link.trim().split('/').pop();
    if (link.includes('/poll/')) navigate(`/poll/${id}`);
    else if (link.includes('/draw/')) navigate(`/draw/${id}`);
    else navigate(`/poll/${id}`);
  };

  return (
    <div className="mt-6 rounded-xl border border-[#D8F3DC] bg-white/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary w-full flex items-center justify-between !py-3"
      >
        <div className="flex items-center gap-2">
          <Link2 size={18} />
          <span className="text-sm font-medium">Open an existing link</span>
        </div>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-[#D8F3DC]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste poll or draw link..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="flex-1 px-4 py-2 bg-white border border-[#D8F3DC] rounded-xl text-sm focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788]"
                />
                <button
                  onClick={handleJoin}
                  className="px-4 py-2 bg-[#E9F5E8] text-[#2D6A4F] rounded-xl text-sm font-medium hover:bg-[#D8F3DC]"
                >
                  Join
                </button>
              </div>
              <p className="text-xs text-[#84A98C] mt-2">
                Works with PollNa (…/poll/xxx) and DrawNa (…/draw/xxx) links.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F5FEF7] to-white flex flex-col items-center justify-center px-5 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo & Title - tighter together */}
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src={anonaLogo}
              alt="AnoNa Logo"
              className="w-10 h-10 md:w-12 md:h-12 object-contain"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#1B4D3E] to-[#52B788] bg-clip-text text-transparent -mt-1">
            AnoNa
          </h1>
        </div>

        {/* Hero Illustration */}
        <div className="my-6 flex justify-center">
          <Illustration type="socialInteraction" size="lg" animate={false} />
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/poll/create')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <PlusCircle size={22} className="animate-pulse" />
            Create PollNa
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/draw/create')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Gift size={22} />
            Start DrawNa
          </motion.button>
        </div>

        {/* Expandable Link Section */}
        <LinkJoinCard />
      </div>
    </div>
  );
}