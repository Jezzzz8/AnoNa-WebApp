// pages/Waiting.jsx - Updated to show added choices
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Users, Award, TrendingUp, PlusCircle } from 'lucide-react';
import Icon from '../components/Icon';
import FloatingBackButton from '../components/FloatingBackButton';

export default function Waiting() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [progress, setProgress] = useState(100);
  const [allOptions, setAllOptions] = useState([]);
  const [allVotes, setAllVotes] = useState([]);

  useEffect(() => {
    fetchPoll();
    const subscription = supabase
      .channel(`poll-${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'polls', 
        filter: `id=eq.${id}` 
      }, payload => {
        if (payload.new) {
          setPoll(payload.new);
          updateCombinedOptions(payload.new);
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [id]);

  const updateCombinedOptions = (pollData) => {
    const combinedOptions = [...pollData.options];
    const combinedVotes = [...pollData.votes];
    const additionalOptions = pollData.additional_options || [];
    
    additionalOptions.forEach(opt => {
      combinedOptions.push(opt.text);
      combinedVotes.push(opt.votes);
    });
    
    setAllOptions(combinedOptions);
    setAllVotes(combinedVotes);
  };

  const fetchPoll = async () => {
    const { data } = await supabase.from('polls').select('*').eq('id', id).single();
    if (!data) navigate('/');
    setPoll(data);
    updateCombinedOptions(data);
  };

  useEffect(() => {
    if (!poll) return;
    
    const interval = setInterval(() => {
      const remaining = new Date(poll.expires_at) - new Date();
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        navigate(`/result/${id}`);
      } else {
        const seconds = Math.floor(remaining / 1000);
        setTimeLeft(seconds);
        
        const totalDuration = new Date(poll.expires_at).getTime() - new Date(poll.created_at).getTime();
        const elapsed = totalDuration - remaining;
        setProgress((elapsed / totalDuration) * 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [poll, id, navigate]);

  useEffect(() => {
    if (!poll) return;
    const total = poll.total_votes;
    const maxVotes = Math.max(...allVotes);
    if (total === 0) setStatusMsg('Waiting for first vote');
    else if (maxVotes > total / 2) setStatusMsg('Leading strong');
    else if (maxVotes > total * 0.4) setStatusMsg('Close vote');
    else setStatusMsg('Waiting for final votes');
  }, [poll, allVotes]);

  if (!poll) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#52B788] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalVotes = poll.total_votes;
  const maxVotes = Math.max(...allVotes);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const hasAdditionalOptions = (poll.additional_options?.length || 0) > 0;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="px-5 py-12 max-w-lg mx-auto pb-32">
        {/* SolbNa Header with Medal Icon */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center mb-3">
            <Icon name="medal" isActive={true} size={48} />
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.03, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-6xl font-black bg-gradient-to-r from-[#1B4D3E] to-[#52B788] bg-clip-text text-transparent">
              SolbNa
            </span>
          </motion.div>
          <p className="text-[#84A98C] text-xs mt-1">making decisions together</p>
        </motion.div>

        {/* Timer Card with Clock Icon */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 mb-6 shadow-md border border-[#D8F3DC]"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Icon name="clock" isActive={timeLeft < 10} size={28} />
            <div className="text-4xl font-mono font-bold text-[#1B4D3E]">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
          
          <div className="h-2 bg-[#E9F5E8] rounded-full overflow-hidden mb-3">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#52B788] to-[#2D6A4F] rounded-full"
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-[#84A98C]">{statusMsg}</span>
            <div className="flex items-center gap-1">
              <Users size={12} className="text-[#52B788]" />
              <span className="text-[#1B4D3E] font-medium">{totalVotes} voted</span>
            </div>
          </div>
        </motion.div>

        {/* Results Chart */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#52796F]">Live results</span>
            {maxVotes > 0 && (
              <div className="flex items-center gap-1 text-xs text-[#52B788]">
                <TrendingUp size={10} />
                <span>Leading: {maxVotes} votes</span>
              </div>
            )}
          </div>
          
          {allOptions.map((opt, idx) => {
            const percent = totalVotes === 0 ? 0 : (allVotes[idx] / totalVotes) * 100;
            const isLeading = allVotes[idx] === maxVotes && maxVotes > 0;
            const isAdditional = idx >= poll.options.length;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`truncate ${isLeading ? 'text-[#1B4D3E] font-semibold' : 'text-[#52796F]'}`}>
                      {opt}
                    </span>
                    {isAdditional && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#E9F5E8] rounded-full text-[#52B788] flex-shrink-0">
                        suggested
                      </span>
                    )}
                    {isLeading && <Award size={12} className="text-[#52B788] flex-shrink-0" />}
                  </div>
                  <span className={`text-xs ${isLeading ? 'text-[#1B4D3E] font-semibold' : 'text-[#84A98C]'}`}>
                    {allVotes[idx]}
                  </span>
                </div>
                <div className="h-2 bg-[#E9F5E8] rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLeading 
                        ? 'bg-gradient-to-r from-[#52B788] to-[#2D6A4F]' 
                        : 'bg-[#95D5B2]'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  />
                </div>
              </motion.div>
            );
          })}
          
          {hasAdditionalOptions && (
            <div className="flex items-center justify-center gap-1 mt-3 pt-2 text-xs text-[#84A98C] border-t border-[#D8F3DC]">
              <PlusCircle size={12} />
              <span>Voters suggested {poll.additional_options.length} new choices</span>
            </div>
          )}
        </motion.div>
      </div>
      <FloatingBackButton onClick={() => navigate('/')} label="Back to Home" />
    </div>
  );
}