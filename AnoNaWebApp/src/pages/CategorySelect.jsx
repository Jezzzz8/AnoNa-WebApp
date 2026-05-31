// pages/CategorySelect.jsx - Updated with proper padding
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import BubbleMenu from '../components/BubbleMenu';
import FloatingBackButton from '../components/FloatingBackButton';

export default function CategorySelect() {
  const navigate = useNavigate();

  const handleSelectCategory = (category) => {
    navigate(`/create?category=${category.value.toLowerCase()}&label=${encodeURIComponent(category.label)}`);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="pb-32">
        <BubbleMenu 
          onSelectCategory={handleSelectCategory}
          menuBg="#FFFFFF"
          menuContentColor="#1B4D3E"
        />
      </div>
      <FloatingBackButton onClick={() => navigate('/')} label="Back to Home" />
    </div>
  );
}