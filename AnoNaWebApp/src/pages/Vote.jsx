// pages/Vote.jsx - Updated with "Add Choice" feature
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getDeviceId, hasVoted, saveVoteRecord } from '../lib/voteUtils';
import { Loader2, CheckCircle, AlertCircle, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PollCard from '../components/PollCard';
import FloatingBackButton from '../components/FloatingBackButton';
import toast from 'react-hot-toast';

export default function Vote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [error, setError] = useState(null);
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [newChoice, setNewChoice] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [allOptions, setAllOptions] = useState([]);
  const [allVotes, setAllVotes] = useState([]);

  useEffect(() => {
    fetchPoll();
    const subscription = supabase
      .channel(`poll-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls', filter: `id=eq.${id}` }, payload => {
        if (payload.new) {
          setPoll(payload.new);
          // Update combined options
          const combinedOptions = [...payload.new.options];
          const additionalOptions = payload.new.additional_options || [];
          const combinedVotes = [...payload.new.votes];
          
          additionalOptions.forEach(opt => {
            combinedOptions.push(opt.text);
            combinedVotes.push(opt.votes);
          });
          
          setAllOptions(combinedOptions);
          setAllVotes(combinedVotes);
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [id]);

  const fetchPoll = async () => {
    try {
      const { data, error } = await supabase.from('polls').select('*').eq('id', id).single();
      if (error || !data) {
        setError('Poll not found');
        return;
      }
      if (new Date(data.expires_at) < new Date()) {
        setError('This poll has expired');
        return;
      }
      setPoll(data);
      
      // Combine original options with additional options
      const combinedOptions = [...data.options];
      const additionalOptions = data.additional_options || [];
      const combinedVotes = [...data.votes];
      
      additionalOptions.forEach(opt => {
        combinedOptions.push(opt.text);
        combinedVotes.push(opt.votes);
      });
      
      setAllOptions(combinedOptions);
      setAllVotes(combinedVotes);
      
      if (hasVoted(id)) setVoted(true);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const castVote = async (optionIndex) => {
    if (voted) return;
    setSelectedIdx(optionIndex);
    
    const deviceId = getDeviceId();
    
    // Determine if this is an original option or an added one
    const isOriginalOption = optionIndex < poll.options.length;
    let newVotes;
    
    if (isOriginalOption) {
      newVotes = [...poll.votes];
      newVotes[optionIndex] += 1;
      
      const { error } = await supabase
        .from('polls')
        .update({ 
          votes: newVotes, 
          total_votes: poll.total_votes + 1 
        })
        .eq('id', id);
        
      if (!error) {
        saveVoteRecord(id, deviceId);
        setTimeout(() => navigate(`/waiting/${id}`), 500);
      } else {
        toast.error('Failed to cast vote');
        setSelectedIdx(null);
      }
    } else {
      // Vote for an added option
      const additionalIdx = optionIndex - poll.options.length;
      const updatedAdditionalOptions = [...(poll.additional_options || [])];
      updatedAdditionalOptions[additionalIdx] = {
        ...updatedAdditionalOptions[additionalIdx],
        votes: updatedAdditionalOptions[additionalIdx].votes + 1
      };
      
      const { error } = await supabase
        .from('polls')
        .update({ 
          additional_options: updatedAdditionalOptions,
          total_votes: poll.total_votes + 1 
        })
        .eq('id', id);
        
      if (!error) {
        saveVoteRecord(id, deviceId);
        setTimeout(() => navigate(`/waiting/${id}`), 500);
      } else {
        toast.error('Failed to cast vote');
        setSelectedIdx(null);
      }
    }
  };

  const addNewChoice = async () => {
    if (!newChoice.trim()) {
      toast.error('Please enter a choice');
      return;
    }
    
    const additionalOptions = poll.additional_options || [];
    
    if (additionalOptions.length >= poll.max_additional_options) {
      toast.error(`Maximum ${poll.max_additional_options} additional choices allowed`);
      return;
    }
    
    setIsAdding(true);
    
    const newAdditionalOptions = [
      ...additionalOptions,
      {
        text: newChoice.trim(),
        votes: 0,
        added_by: getDeviceId(),
        added_at: new Date().toISOString()
      }
    ];
    
    const { error } = await supabase
      .from('polls')
      .update({ 
        additional_options: newAdditionalOptions
      })
      .eq('id', id);
      
    if (!error) {
      toast.success('Choice added successfully!');
      setNewChoice('');
      setShowAddChoice(false);
      // Refresh poll data
      fetchPoll();
    } else {
      toast.error('Failed to add choice');
    }
    
    setIsAdding(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#F5FEF7]">
        <Loader2 className="animate-spin text-[#52B788]" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white to-[#F5FEF7]">
        <AlertCircle size={48} className="text-[#84A98C] mb-4" />
        <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">{error}</h2>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
          Go Home
        </button>
      </div>
    );
  }

  if (voted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white to-[#F5FEF7]">
        <div className="w-16 h-16 bg-[#E9F5E8] rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-[#52B788]" />
        </div>
        <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">You already voted!</h2>
        <p className="text-[#84A98C] text-sm mb-6">Thanks for participating</p>
        <button 
          onClick={() => navigate(`/waiting/${id}`)} 
          className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}
        >
          See live results →
        </button>
      </div>
    );
  }

  const canAddChoice = poll.allow_add_choice && 
    (poll.additional_options?.length || 0) < poll.max_additional_options;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="px-5 py-8 max-w-lg mx-auto pb-28">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-[#E9F5E8] rounded-full text-xs font-medium text-[#2D6A4F] mb-3">
            Vote Now
          </div>
          <h1 className="text-xl font-bold text-[#1B4D3E] leading-tight">
            {poll.question}
          </h1>
          {poll.allow_add_choice && (
            <p className="text-xs text-[#84A98C] mt-2 flex items-center gap-1">
              <PlusCircle size={12} />
              Voters can suggest their own choices
            </p>
          )}
        </div>
        
        {/* Options Grid */}
        <div className="option-grid">
          {allOptions.map((opt, idx) => (
            <PollCard
              key={idx}
              option={opt}
              index={idx}
              isSelected={selectedIdx === idx}
              onSelect={() => castVote(idx)}
              disabled={selectedIdx !== null}
            />
          ))}
          
          {/* Add Choice Button */}
          {canAddChoice && !showAddChoice && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddChoice(true)}
              className="w-full py-4 px-4 rounded-xl flex items-center justify-center gap-2 text-[#52B788] text-sm font-medium border-2 border-dashed border-[#D8F3DC] hover:border-[#52B788] hover:bg-[#E9F5E8] transition-all group"
            >
              <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
              Add another choice
            </motion.button>
          )}
          
          {/* Add Choice Input Form */}
          <AnimatePresence>
            {showAddChoice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#E9F5E8] rounded-xl p-4 mt-2">
                  <label className="text-sm font-semibold text-[#1B4D3E] mb-2 block">
                    Suggest a new choice
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Mexican food"
                      value={newChoice}
                      onChange={(e) => setNewChoice(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white border-2 border-[#D8F3DC] rounded-xl text-[#1B4D3E] text-sm placeholder:text-[#84A98C] focus:border-[#52B788] focus:ring-2 focus:ring-[#52B788]/20 transition-all"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && addNewChoice()}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addNewChoice}
                      disabled={isAdding}
                      className="px-4 py-2 bg-gradient-to-r from-[#52B788] to-[#2D6A4F] text-white rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                      {isAdding ? '...' : 'Add'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setShowAddChoice(false);
                        setNewChoice('');
                      }}
                      className="p-2 text-[#84A98C] hover:text-[#1B4D3E] transition-colors"
                    >
                      <X size={20} />
                    </motion.button>
                  </div>
                  <p className="text-xs text-[#84A98C] mt-2">
                    {poll.additional_options?.length || 0} of {poll.max_additional_options} additional choices added
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <FloatingBackButton onClick={() => navigate('/')} label="Back to Home" />
    </div>
  );
}