import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Gift, Sparkles, Clock, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/voteUtils';
import OptionInput from '../components/OptionInput';
import FloatingBackButton from '../components/FloatingBackButton';
import Toggle from '../components/Toggle';

export default function CreatePullEvent() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState(['', '']);
  const [useTimer, setUseTimer] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState(60);
  const [isCreating, setIsCreating] = useState(false);
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

  const addParticipant = () => {
    if (participants.length < 20) setParticipants([...participants, '']);
  };

  const removeParticipant = (idx) => {
    if (participants.length > 2) setParticipants(participants.filter((_, i) => i !== idx));
  };

  const updateParticipant = (idx, val) => {
    const newList = [...participants];
    newList[idx] = val;
    setParticipants(newList);
  };

  const generateAssignments = (names) => {
    let recipients = [...names];
    let attempts = 0;
    const maxAttempts = 100;
    while (attempts < maxAttempts) {
      for (let i = recipients.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [recipients[i], recipients[j]] = [recipients[j], recipients[i]];
      }
      let valid = true;
      for (let i = 0; i < names.length; i++) {
        if (names[i] === recipients[i]) {
          valid = false;
          break;
        }
      }
      if (valid) return recipients;
      attempts++;
      recipients = [...names];
    }
    return names.map((_, idx) => names[(idx + 1) % names.length]);
  };

  const handleCreate = async () => {
    if (offline) {
      toast.error('You are offline. Please connect to the internet to create an event.');
      return;
    }
    if (!eventName.trim()) return toast.error('Event name required');
    const validParticipants = participants.filter(p => p.trim());
    if (validParticipants.length < 2) return toast.error('Add at least 2 participants');

    setIsCreating(true);
    const eventId = crypto.randomUUID().slice(0, 8);
    const deviceId = getDeviceId();
    const expiresAt = useTimer
      ? new Date(Date.now() + expiryMinutes * 60000).toISOString()
      : null;

    const shuffled = generateAssignments(validParticipants);
    const assignments = validParticipants.map((p, idx) => ({
      participant: p,
      recipient: shuffled[idx]
    }));

    // 1. Insert event
    const { error: eventError } = await supabase.from('pull_events').insert({
      id: eventId,
      name: eventName.trim(),
      description: description.trim() || null,
      created_by: deviceId,
      participants: validParticipants,
      expires_at: expiresAt,
      total_participants: validParticipants.length,
      reveal_count: 0
    });

    if (eventError) {
      console.error('Event insertion error:', eventError);
      toast.error(`Failed to create event: ${eventError.message}`);
      setIsCreating(false);
      return;
    }

    // 2. Insert assignments
    const { error: assignError } = await supabase.from('pull_assignments').insert(
      assignments.map(a => ({
        event_id: eventId,
        participant: a.participant,
        recipient: a.recipient,
        revealed: false
      }))
    );

    if (assignError) {
      console.error('Assignments insertion error:', assignError);
      toast.error(`Failed to save assignments: ${assignError.message}`);
      // Optionally delete the event to keep consistency
      await supabase.from('pull_events').delete().eq('id', eventId);
      setIsCreating(false);
      return;
    }

    toast.success('Event created successfully!');
    navigate(`/pull/share/${eventId}`);
    setIsCreating(false);
  };

  if (offline) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📡</span>
        </div>
        <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">No Internet Connection</h2>
        <p className="text-[#84A98C] text-sm">Please connect to the internet to create a PullNa event.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#52B788] text-white rounded-xl">Retry</button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#F5FEF7] to-white">
      <div className="px-5 py-8 max-w-lg mx-auto pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-[#52B788]/10 flex items-center justify-center">
              <Gift size={32} className="text-[#52B788]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B4D3E]">Create PullNa Event</h1>
              <p className="text-sm text-[#84A98C] flex items-center gap-2">
                <Sparkles size={14} className="text-[#52B788]" />
                Anonymous gift exchange
              </p>
            </div>
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-sm font-semibold text-[#52796F] mb-2">Event name</label>
            <input
              type="text"
              placeholder="e.g., Christmas Gift Exchange"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-5 py-4 bg-white border border-[#E2F0E6] rounded-xl focus:border-[#52B788] focus:ring-2 focus:ring-[#52B788]/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#52796F] mb-2">Description (optional)</label>
            <textarea
              placeholder="Any extra info for participants..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-5 py-4 bg-white border border-[#E2F0E6] rounded-xl resize-none"
            />
          </div>

          {/* Participants list */}
          <div>
            <label className="block text-sm font-semibold text-[#52796F] mb-2">Participants</label>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {participants.map((p, idx) => (
                  <OptionInput
                    key={idx}
                    letter={String.fromCharCode(65 + idx)}
                    value={p}
                    onChange={(val) => updateParticipant(idx, val)}
                    onRemove={() => removeParticipant(idx)}
                    showRemove={participants.length > 2}
                    placeholder={`Participant ${idx + 1}`}
                    autoFocus={idx === participants.length - 1 && p === ''}
                  />
                ))}
              </AnimatePresence>
              {participants.length < 20 && (
                <button
                  onClick={addParticipant}
                  className="flex items-center justify-center gap-2 w-full py-3 text-[#52B788] border border-dashed border-[#D8F3DC] rounded-xl hover:bg-[#E9F5E8]"
                >
                  <Plus size={16} /> Add participant
                </button>
              )}
            </div>
          </div>

          {/* Expiry toggle */}
          <div className="bg-[#E9F5E8]/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#52B788]" />
                <span className="text-sm font-medium text-[#1B4D3E]">Set expiration date</span>
              </div>
              <Toggle checked={useTimer} onChange={setUseTimer} size="sm" />
            </div>
            {useTimer && (
              <div className="mt-3">
                <label className="text-xs text-[#52796F]">Expires after (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="43200"
                  value={expiryMinutes}
                  onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 60)}
                  className="w-full mt-1 px-3 py-2 bg-white border border-[#D8F3DC] rounded-lg text-sm"
                />
              </div>
            )}
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full py-4 bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isCreating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
            {isCreating ? 'Creating...' : 'Create Event'}
          </button>
        </motion.div>
      </div>
      <FloatingBackButton onClick={() => navigate('/')} label="Back" />
    </div>
  );
}