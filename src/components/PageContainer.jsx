// components/PageContainer.jsx
import { motion } from 'framer-motion';

export default function PageContainer({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`min-h-screen bg-gradient-to-b from-white to-[#F5FEF7] px-5 py-8 max-w-lg mx-auto ${className}`}
    >
      {children}
    </motion.div>
  );
}