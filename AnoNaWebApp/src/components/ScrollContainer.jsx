// components/ScrollContainer.jsx - New component for consistent scrolling
import { motion } from 'framer-motion';

export default function ScrollContainer({ children, className = '' }) {
  return (
    <div className="h-screen overflow-y-auto overscroll-contain">
      <div className={`min-h-screen ${className}`}>
        {children}
      </div>
    </div>
  );
}