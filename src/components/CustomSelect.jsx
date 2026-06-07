// components/CustomSelect.jsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';

export default function CustomSelect({ options, value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-[#D8F3DC] rounded-xl text-[#1B4D3E] focus:border-[#52B788] focus:ring-2 focus:ring-[#52B788]/20 transition-all"
      >
        <span className={value ? 'text-[#1B4D3E]' : 'text-[#84A98C]'}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-[#84A98C] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border border-[#D8F3DC] overflow-hidden"
          >
            <div className="p-2 border-b border-[#E9F5E8]">
              <div className="flex items-center gap-2 px-2 py-1 bg-[#F5FEF7] rounded-lg">
                <Search size={14} className="text-[#84A98C]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-[#1B4D3E] focus:outline-none placeholder:text-[#84A98C]"
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch('')}>
                    <X size={14} className="text-[#84A98C]" />
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-[#84A98C] text-center">
                  No matches
                </div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      opt === value
                        ? 'bg-[#52B788]/10 text-[#2D6A4F] font-medium'
                        : 'text-[#1B4D3E] hover:bg-[#E9F5E8]'
                    }`}
                  >
                    {opt}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}