// components/FloatingBackButton.jsx - Fixed to always be at viewport bottom
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function FloatingBackButton({ onClick, label = 'Back' }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pt-3 pointer-events-none">
      <div className="w-full max-w-[500px] px-4 pointer-events-auto">
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className="w-full py-4 bg-white/95 backdrop-blur-md border-2 border-[#D8F3DC] text-[#2D6A4F] rounded-2xl flex items-center justify-center gap-2 text-base font-semibold shadow-xl hover:bg-[#E9F5E8] hover:border-[#52B788] hover:shadow-2xl transition-all duration-300"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {label}
        </motion.button>
      </div>
    </div>
  );
}