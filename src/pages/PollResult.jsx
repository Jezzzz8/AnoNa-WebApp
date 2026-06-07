// pages/PollResult.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Share2, Trophy, Crown, Target, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Illustration from '../components/Illustration';
import FloatingBackButton from '../components/FloatingBackButton';

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [allOptions, setAllOptions] = useState([]);
  const [allVotes, setAllVotes] = useState([]);
  const [offline, setOffline] = useState(!navigator.onLine);

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
    if (!offline) fetchResult();
    else setPoll(null);
  }, [id, offline]);

  const fetchResult = async () => {
    const { data } = await supabase.from('polls').select('*').eq('id', id).single();
    if (!data) return navigate('/');
    setPoll(data);
    const combinedOptions = [...data.options];
    const combinedVotes = [...data.votes];
    const additionalOptions = data.additional_options || [];
    additionalOptions.forEach(opt => {
      combinedOptions.push(opt.text);
      combinedVotes.push(opt.votes);
    });
    setAllOptions(combinedOptions);
    setAllVotes(combinedVotes);
    if (navigator.onLine) {
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#1B4D3E', '#2D6A4F', '#52B788', '#95D5B2'] });
      setTimeout(() => {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7, x: 0.3 }, colors: ['#52B788', '#2D6A4F'] });
      }, 200);
    }
  };

  const shareResult = () => {
    const total = poll.total_votes;
    const maxVotes = Math.max(...allVotes);
    const winners = allOptions.filter((_, idx) => allVotes[idx] === maxVotes);
    const isTie = winners.length > 1;
    let text = '';
    if (total === 0) {
      text = 'AnoNa Result: WalaPa - No votes were cast.';
    } else if (isTie) {
      text = `AnoNa Result: LabanNa! ${winners.join(' vs ')} tied with ${maxVotes} votes each.`;
    } else {
      text = `AnoNa Result: SolbNa! ${winners[0]} wins with ${maxVotes} votes.`;
    }
    if (navigator.share) {
      navigator.share({ title: 'AnoNa Poll Result', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Result copied to clipboard');
    }
  };

  if (offline) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📡</span>
        </div>
        <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">No Internet Connection</h2>
        <p className="text-[#84A98C] text-sm">Please connect to the internet to see poll results.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#52B788] text-white rounded-xl">Retry</button>
      </div>
    );
  }

  if (!poll) return null;

  const total = poll.total_votes;
  const maxVotes = Math.max(...allVotes);
  const winners = allOptions.filter((_, idx) => allVotes[idx] === maxVotes);
  const isTie = winners.length > 1;
  const hasAdditionalOptions = (poll.additional_options?.length || 0) > 0;

  let status = '', subtext = '', icon = null;
  if (total === 0) {
    status = 'WalaPa';
    subtext = 'No votes were cast';
    icon = <Target size={32} className="text-[#84A98C]" />;
  } else if (isTie) {
    status = 'LabanNa';
    subtext = `${winners.join(' and ')} tied with ${maxVotes} votes each`;
    icon = <Trophy size={32} className="text-[#52B788]" />;
  } else {
    status = 'SolbNa';
    subtext = `${winners[0]} wins with ${maxVotes} votes`;
    icon = <Crown size={32} className="text-[#2D6A4F]" />;
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="px-5 py-12 max-w-lg mx-auto pb-32">
        {(total === 0 || isTie) && <Illustration type="yesNo" size="sm" className="mb-4" animate={false} />}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E9F5E8] mb-5">
            {icon}
          </motion.div>
          <motion.h1 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className={`text-5xl font-black mb-2 ${total === 0 ? 'text-[#84A98C]' : isTie ? 'text-[#52B788]' : 'bg-gradient-to-r from-[#1B4D3E] to-[#52B788] bg-clip-text text-transparent'}`}>
            {status}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-[#52796F] text-sm mb-6">
            {subtext}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 my-6 shadow-md border border-[#D8F3DC]">
            <div className="flex justify-between text-xs text-[#52796F] mb-3 pb-2 border-b border-[#D8F3DC]">
              <span>Choice</span>
              <span>Votes</span>
            </div>
            {allOptions.map((opt, idx) => {
              const percent = total === 0 ? 0 : (allVotes[idx] / total) * 100;
              const isWinner = allVotes[idx] === maxVotes && maxVotes > 0 && !isTie;
              const isAdditional = idx >= poll.options.length;
              return (
                <motion.div key={idx} className="mb-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className={`truncate ${isWinner ? 'text-[#1B4D3E] font-semibold' : 'text-[#52796F]'}`}>{opt}</span>
                      {isAdditional && <span className="text-[10px] px-1.5 py-0.5 bg-[#E9F5E8] rounded-full text-[#52B788] flex-shrink-0">suggested</span>}
                      {isWinner && <Crown size={10} className="text-[#52B788] flex-shrink-0" />}
                    </div>
                    <span className={`text-xs ${isWinner ? 'text-[#1B4D3E] font-semibold' : 'text-[#84A98C]'}`}>{allVotes[idx]}</span>
                  </div>
                  <div className="h-2 bg-[#E9F5E8] rounded-full overflow-hidden">
                    <motion.div className={`h-full rounded-full ${isWinner ? 'bg-gradient-to-r from-[#52B788] to-[#2D6A4F]' : 'bg-[#95D5B2]'}`} initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 0.5, delay: idx * 0.05 }} />
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
          <button onClick={shareResult} className="w-full py-3 bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] text-white rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all">
            <Share2 size={16} /> Share Result
          </button>
        </motion.div>
      </div>
      <FloatingBackButton onClick={() => navigate('/poll/create')} label="Create New Poll" />
    </div>
  );
}