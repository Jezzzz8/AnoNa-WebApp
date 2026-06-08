// pages/PollVote.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getDeviceId, hasVoted, saveVoteRecord } from '../lib/voteUtils';
import { Loader2, CheckCircle, AlertCircle, PlusCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PollCard from '../components/PollCard';
import FloatingBackButton from '../components/FloatingBackButton';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Vote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [error, setError] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [showAddChoice, setShowAddChoice] = useState(false);
  const [newChoice, setNewChoice] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [allOptions, setAllOptions] = useState([]);
  const [allVotes, setAllVotes] = useState([]);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!offline) fetchPoll();
    else setLoading(false);

    const subscription = supabase
      .channel(`poll-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls', filter: `id=eq.${id}` }, payload => {
        if (payload.new) {
          const updatedPoll = payload.new;
          setPoll(updatedPoll);
          const combinedOptions = [...updatedPoll.options];
          const additionalOptions = updatedPoll.additional_options || [];
          const combinedVotes = [...updatedPoll.votes];
          additionalOptions.forEach(opt => {
            combinedOptions.push(opt.text);
            combinedVotes.push(opt.votes);
          });
          setAllOptions(combinedOptions);
          setAllVotes(combinedVotes);
          
          // If poll just expired, redirect to results
          if (new Date(updatedPoll.expires_at) < new Date()) {
            toast.error('This poll has ended. Redirecting to results...');
            navigate(`/poll/result/${id}`);
          }
        }
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, [id, offline, navigate]);

  const fetchPoll = async () => {
    try {
      const { data, error } = await supabase.from('polls').select('*').eq('id', id).single();
      if (error || !data) {
        setError('Link not found');
        setLoading(false);
        return;
      }
      
      // Check if poll is expired
      if (new Date(data.expires_at) < new Date()) {
        toast.error('This poll has ended. Redirecting to results...');
        navigate(`/poll/result/${id}`);
        return;
      }
      
      setPoll(data);
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
    const isOriginalOption = optionIndex < poll.options.length;
    let newVotes;
    if (isOriginalOption) {
      newVotes = [...poll.votes];
      newVotes[optionIndex] += 1;
      const { error } = await supabase
        .from('polls')
        .update({ votes: newVotes, total_votes: poll.total_votes + 1 })
        .eq('id', id);
      if (!error) {
        saveVoteRecord(id, deviceId);
        setTimeout(() => navigate(`/poll/waiting/${id}`), 500);
      } else {
        toast.error('Failed to cast vote');
        setSelectedIdx(null);
      }
    } else {
      const additionalIdx = optionIndex - poll.options.length;
      const updatedAdditionalOptions = [...(poll.additional_options || [])];
      updatedAdditionalOptions[additionalIdx] = {
        ...updatedAdditionalOptions[additionalIdx],
        votes: updatedAdditionalOptions[additionalIdx].votes + 1
      };
      const { error } = await supabase
        .from('polls')
        .update({ additional_options: updatedAdditionalOptions, total_votes: poll.total_votes + 1 })
        .eq('id', id);
      if (!error) {
        saveVoteRecord(id, deviceId);
        setTimeout(() => navigate(`/poll/waiting/${id}`), 500);
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
      .update({ additional_options: newAdditionalOptions })
      .eq('id', id);
    if (!error) {
      toast.success('Choice added successfully!');
      setNewChoice('');
      setShowAddChoice(false);
      fetchPoll();
    } else {
      toast.error('Failed to add choice');
    }
    setIsAdding(false);
  };

  if (offline) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📡</span>
        </div>
        <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">No Internet Connection</h2>
        <p className="text-[#84A98C] text-sm">Please connect to the internet to view this poll.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#52B788] text-white rounded-xl">Retry</button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
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
        <button onClick={() => navigate(`/poll/waiting/${id}`)} className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }}>
          See live results →
        </button>
      </div>
    );
  }

  const canAddChoice = poll.allow_add_choice && (poll.additional_options?.length || 0) < poll.max_additional_options;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="px-5 py-8 max-w-lg mx-auto pb-28">
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-[#E9F5E8] rounded-full text-xs font-medium text-[#2D6A4F] mb-3">
            Vote Now
          </div>
          <h1 className="text-xl font-bold text-[#1B4D3E] leading-tight">{poll.question}</h1>
          {poll.allow_add_choice && (
            <p className="text-xs text-[#84A98C] mt-2 flex items-center gap-1">
              <PlusCircle size={12} /> Voters can suggest their own choices
            </p>
          )}
        </div>

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

          <AnimatePresence>
            {showAddChoice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-[#E9F5E8] rounded-xl p-4 mt-2">
                  <label className="text-sm font-semibold text-[#1B4D3E] mb-2 block">Suggest a new choice</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter New Choice..."
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