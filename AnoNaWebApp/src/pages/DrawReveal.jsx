// pages/DrawReveal.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getDeviceId, saveVoteRecord } from '../lib/voteUtils';
import { Loader2, AlertCircle, Gift, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import FloatingBackButton from '../components/FloatingBackButton';
import Illustration from '../components/Illustration';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DrawReveal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantsList, setParticipantsList] = useState([]);
  const [selectedName, setSelectedName] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [recipient, setRecipient] = useState('');
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
    if (!offline) fetchEvent();
    else setLoading(false);

    const subscription = supabase
      .channel(`draw-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'draw_assignments', filter: `event_id=eq.${id}` }, payload => {
        if (payload.new && payload.new.participant === selectedName) {
          setRecipient(payload.new.recipient);
          setRevealed(payload.new.revealed);
        }
      })
      .subscribe();
    return () => subscription.unsubscribe();
  }, [id, selectedName, offline]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase.from('draw_events').select('*').eq('id', id).single();
      if (error || !data) {
        setError('Link not found');
        setLoading(false);
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError('This event has expired');
        setLoading(false);
        return;
      }
      setEvent(data);
      setParticipantsList(data.participants);

      const savedName = localStorage.getItem(`drawna_${id}_participant`);
      if (savedName && data.participants.includes(savedName)) {
        const { data: revealData } = await supabase
          .from('draw_assignments')
          .select('recipient, revealed')
          .eq('event_id', id)
          .eq('participant', savedName)
          .single();
        if (revealData?.revealed) {
          setSelectedName(savedName);
          setRecipient(revealData.recipient);
          setRevealed(true);
        }
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async () => {
    if (offline) {
      toast.error('You are offline. Please connect to the internet.');
      return;
    }
    if (!selectedName) return toast.error('Select your name');
    if (revealed) return;

    const deviceId = getDeviceId();

    const { data: existing } = await supabase
      .from('draw_assignments')
      .select('revealed')
      .eq('event_id', id)
      .eq('participant', selectedName)
      .single();

    if (existing?.revealed) {
      toast.error('You already revealed your recipient');
      setRevealed(true);
      const { data: assign } = await supabase
        .from('draw_assignments')
        .select('recipient')
        .eq('event_id', id)
        .eq('participant', selectedName)
        .single();
      setRecipient(assign?.recipient || '');
      return;
    }

    const { error: updateErr } = await supabase
      .from('draw_assignments')
      .update({ revealed: true, revealed_at: new Date().toISOString() })
      .eq('event_id', id)
      .eq('participant', selectedName);

    if (updateErr) {
      toast.error('Could not reveal. Try again.');
      return;
    }

    try {
      await supabase.rpc('increment_draw_reveal_count', { event_id: id });
    } catch (rpcErr) {
      console.warn('RPC function not found – reveal count not incremented');
    }

    localStorage.setItem(`drawna_${id}_participant`, selectedName);
    saveVoteRecord(`draw_${id}_${selectedName}`, deviceId);

    const { data: assignment } = await supabase
      .from('draw_assignments')
      .select('recipient')
      .eq('event_id', id)
      .eq('participant', selectedName)
      .single();

    setRecipient(assignment?.recipient || '');
    setRevealed(true);
    toast.success(`You are assigned to: ${assignment?.recipient}`);
  };

  if (offline) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📡</span>
        </div>
        <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">No Internet Connection</h2>
        <p className="text-[#84A98C] text-sm">Please connect to the internet to reveal your assignment.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#52B788] text-white rounded-xl">Retry</button>
      </div>
    );
  }

      if (loading) return <LoadingSpinner text="Loading..." />;

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

  if (!event) return null;

  const assignmentLabel = event.category === 'pairing' ? 'Your partner is:' : 'Your recipient is:';

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="px-5 py-12 max-w-lg mx-auto pb-32">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-[#E9F5E8] rounded-full text-xs font-medium text-[#2D6A4F] mb-3">
            {event.name}
          </div>
          <h1 className="text-xl font-bold text-[#1B4D3E]">{event.description || 'Random Draw Event'}</h1>
        </div>

        {!revealed ? (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-md border border-[#D8F3DC]">
              <label className="block text-sm font-semibold text-[#52796F] mb-3">Select your name</label>
              <div className="grid grid-cols-2 gap-2">
                {participantsList.map(name => (
                  <button
                    key={name}
                    onClick={() => setSelectedName(name)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all ${selectedName === name ? 'bg-[#52B788] text-white' : 'bg-[#E9F5E8] text-[#1B4D3E] hover:bg-[#D8F3DC]'}`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleReveal}
              disabled={!selectedName}
              className="w-full py-4 bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Eye size={18} /> Reveal my assignment
            </button>
          </div>
        ) : (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 shadow-xl border border-[#52B788] text-center">
            <div className="w-20 h-20 mx-auto bg-[#E9F5E8] rounded-full flex items-center justify-center mb-4">
              <Gift size={40} className="text-[#52B788]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B4D3E] mb-2">{assignmentLabel}</h2>
            <p className="text-3xl font-extrabold text-[#52B788] mb-4">{recipient}</p>
            <p className="text-sm text-[#84A98C]">Keep it secret! 🎁</p>
            <Illustration type="socialInteraction" size="sm" className="mt-6 mx-auto" />
          </motion.div>
        )}
      </div>
      <FloatingBackButton onClick={() => navigate('/')} label="Back to Home" />
    </div>
  );
}