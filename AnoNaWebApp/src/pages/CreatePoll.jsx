// pages/CreatePoll.jsx - Using simple toggle component
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Clock, Send, Pizza, MapPin, Coins, Gamepad2, Trees, Type, Sparkles, Users, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import OptionInput from '../components/OptionInput';
import FloatingBackButton from '../components/FloatingBackButton';
import Toggle from '../components/Toggle';

const categoryIcons = {
  food: Pizza,
  place: MapPin,
  betting: Coins,
  fun: Gamepad2,
  hangout: Trees,
  other: Type
};

const categoryColors = {
  food: '#2D6A4F',
  place: '#52B788',
  betting: '#74C69D',
  fun: '#95D5B2',
  hangout: '#D8F3DC',
  other: '#E9F5E8'
};

const categoryGradients = {
  food: 'from-[#1B4D3E] to-[#2D6A4F]',
  place: 'from-[#2D6A4F] to-[#52B788]',
  betting: 'from-[#52B788] to-[#74C69D]',
  fun: 'from-[#74C69D] to-[#95D5B2]',
  hangout: 'from-[#95D5B2] to-[#D8F3DC]',
  other: 'from-[#D8F3DC] to-[#E9F5E8]'
};

export default function CreatePoll() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const categoryLabel = searchParams.get('label');
  
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [timer, setTimer] = useState(60);
  const [customMinutes, setCustomMinutes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [questionCharCount, setQuestionCharCount] = useState(0);
  const [allowAddChoice, setAllowAddChoice] = useState(false);
  const [maxAdditionalOptions, setMaxAdditionalOptions] = useState(3);

  useEffect(() => {
    if (!category) {
      navigate('/category');
    }
  }, [category, navigate]);

  const CategoryIcon = category ? categoryIcons[category] : null;
  const categoryColor = category ? categoryColors[category] : '#2D6A4F';
  const categoryGradient = category ? categoryGradients[category] : 'from-[#1B4D3E] to-[#2D6A4F]';

  const addOption = () => {
    if (options.length < 8) setOptions([...options, '']);
  };

  const removeOption = (idx) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx, val) => {
    const newOpts = [...options];
    newOpts[idx] = val;
    setOptions(newOpts);
  };

  const setPresetTimer = (sec) => {
    setTimer(sec);
    setCustomMinutes('');
  };

  const setCustomTimer = () => {
    const mins = parseInt(customMinutes);
    if (!isNaN(mins) && mins > 0 && mins <= 60) {
      setTimer(mins * 60);
      setCustomMinutes('');
      toast.success(`${mins}m timer set`);
    }
  };

  const generateLink = async () => {
    if (!question.trim()) return toast.error('Enter a question');
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) return toast.error('Add at least 2 choices');

    setIsCreating(true);
    const pollId = crypto.randomUUID().slice(0, 8);
    const expiresAt = new Date(Date.now() + timer * 1000).toISOString();

    const { error } = await supabase
      .from('polls')
      .insert([{
        id: pollId,
        question: question.trim(),
        options: validOptions,
        votes: validOptions.map(() => 0),
        expires_at: expiresAt,
        created_at: new Date().toISOString(),
        total_votes: 0,
        category: category,
        allow_add_choice: allowAddChoice,
        max_additional_options: maxAdditionalOptions,
        additional_options: []
      }]);

    if (error) {
      toast.error('Failed to create poll');
      console.error(error);
    } else {
      navigate(`/share/${pollId}`);
    }
    setIsCreating(false);
  };

  const timerPresets = [
    { sec: 30, label: '30s', icon: '⚡' },
    { sec: 60, label: '1m', icon: '🕐' },
    { sec: 180, label: '3m', icon: '⏰' },
    { sec: 300, label: '5m', icon: '⌛' }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#F5FEF7] to-white">
      <div className="px-5 py-8 max-w-lg mx-auto pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-4 mb-3">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
                  style={{ 
                    background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}05)`,
                  }}
                >
                  {CategoryIcon && <CategoryIcon size={32} style={{ color: categoryColor }} />}
                </div>
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="text-2xl font-bold text-[#1B4D3E]"
                >
                  Create a {categoryLabel || 'Poll'}
                </motion.h1>
                <p className="text-sm text-[#84A98C] mt-1 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#52B788]" />
                  Get quick decisions from your group
                </p>
              </div>
            </div>
          </motion.div>

          {/* Question Input */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <label className="block text-sm font-semibold text-[#52796F] mb-2">
              Question
            </label>
            <div className={`relative transition-all duration-300 ${focusedField === 'question' ? 'scale-[1.01]' : ''}`}>
              <textarea
                placeholder="What's the decision?"
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  setQuestionCharCount(e.target.value.length);
                }}
                onFocus={() => setFocusedField('question')}
                onBlur={() => setFocusedField(null)}
                rows={3}
                maxLength={200}
                className="w-full px-5 py-4 bg-white border border-[#E2F0E6] rounded-xl text-[#1B4D3E] text-base placeholder:text-[#84A98C] focus:border-[#52B788] focus:ring-2 focus:ring-[#52B788]/20 transition-all resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-[#84A98C]">
                {questionCharCount}/200
              </div>
            </div>
          </motion.div>

          {/* Options Grid */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-sm font-semibold text-[#52796F] mb-2">
              Choices
            </label>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {options.map((opt, idx) => (
                  <OptionInput
                    key={idx}
                    letter={String.fromCharCode(65 + idx)}
                    value={opt}
                    onChange={(val) => updateOption(idx, val)}
                    onRemove={() => removeOption(idx)}
                    showRemove={options.length > 2}
                    placeholder={`Option ${idx + 1}`}
                    autoFocus={idx === options.length - 1 && opt === ''}
                  />
                ))}
              </AnimatePresence>
              
              {options.length < 8 && (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={addOption}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 text-[#52B788] text-sm font-medium border border-dashed border-[#D8F3DC] rounded-xl hover:border-[#52B788] hover:bg-[#E9F5E8] transition-all"
                >
                  <Plus size={16} />
                  Add choice
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Allow Add Choice Toggle - Using simple Toggle */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.23 }}
          >
            <div className={`rounded-xl p-4 transition-all duration-300 ${
              allowAddChoice 
                ? 'bg-[#52B788]/5 border border-[#52B788]/30' 
                : 'bg-[#E9F5E8]/50 border border-[#D8F3DC]'
            }`}>
              {/* Flex row: icon + text on left, toggle on right */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-[#52B788]" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#1B4D3E]">Allow custom choices</h3>
                    <p className="text-xs text-[#84A98C]">Let voters add their own options</p>
                  </div>
                </div>
                <Toggle
                  checked={allowAddChoice}
                  onChange={setAllowAddChoice}
                  size="md"
                />
              </div>

              {/* Expanded settings (only when toggle is ON) */}
              <AnimatePresence>
                {allowAddChoice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-4 pt-4 border-t border-[#D8F3DC]"
                  >
                    <label className="text-xs font-medium text-[#52796F] block mb-2">
                      Maximum additional choices: {maxAdditionalOptions}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={maxAdditionalOptions}
                      onChange={(e) => setMaxAdditionalOptions(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#D8F3DC] rounded-lg appearance-none cursor-pointer accent-[#52B788]"
                    />
                    <div className="flex justify-between text-xs text-[#84A98C] mt-1">
                      <span>1</span>
                      <span>3</span>
                      <span>5</span>
                      <span>7</span>
                      <span>10</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Timer Section */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-[#52796F] mb-3">
              <Clock size={16} className="text-[#52B788]" />
              Poll duration
            </label>
            
            <div className="grid grid-cols-4 gap-2 mb-3">
              {timerPresets.map(({ sec, label, icon }) => (
                <motion.button
                  key={sec}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPresetTimer(sec)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    timer === sec 
                      ? 'bg-[#2D6A4F] text-white' 
                      : 'bg-white border border-[#D8F3DC] text-[#2D6A4F] hover:border-[#52B788]'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    <span>{icon}</span>
                    <span>{label}</span>
                  </span>
                </motion.button>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Custom minutes"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="flex-1 px-4 py-2 bg-white border border-[#D8F3DC] rounded-lg text-center text-[#1B4D3E] text-sm placeholder:text-[#84A98C] focus:border-[#52B788] focus:ring-2 focus:ring-[#52B788]/20 transition-all"
              />
              <button
                onClick={setCustomTimer}
                className="px-4 py-2 bg-[#E9F5E8] rounded-lg text-[#2D6A4F] text-sm font-medium hover:bg-[#D8F3DC] transition-all"
              >
                Apply
              </button>
            </div>
          </motion.div>

          {/* Create Button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button
              onClick={generateLink}
              disabled={isCreating}
              className={`w-full py-4 bg-gradient-to-r ${categoryGradient} text-white rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all ${
                isCreating ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98]'
              }`}
            >
              {isCreating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Create Poll
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      </div>
      <FloatingBackButton onClick={() => navigate('/category')} label="Back" />
    </div>
  );
}