// pages/CreateDrawEvent.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Gift, Sparkles, Send, Edit2, Trash2, X, Check, RefreshCw, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/voteUtils';
import FloatingBackButton from '../components/FloatingBackButton';
import Toggle from '../components/Toggle';

export default function CreateDrawEvent() {
  const navigate = useNavigate();

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [participants, setParticipants] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [allowRedraw, setAllowRedraw] = useState(false);     // default OFF
  const [requireParticipantName, setRequireParticipantName] = useState(false); // default OFF
  const [isCreating, setIsCreating] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  const inputRef = useRef(null);

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
    if (!editingId && inputRef.current) inputRef.current.focus();
  }, [editingId]);

  const addParticipant = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      toast.error('Please enter a name');
      return;
    }
    if (participants.includes(trimmed)) {
      toast.error('Participant already exists');
      return;
    }
    if (participants.length >= 20) {
      toast.error('Maximum 20 participants allowed');
      return;
    }
    setParticipants([...participants, trimmed]);
    setInputValue('');
    toast.success(`${trimmed} added`);
  };

  const deleteParticipant = (name) => {
    setParticipants(participants.filter(p => p !== name));
    toast.success(`${name} removed`);
  };

  const startEdit = (name) => {
    setEditingId(name);
    setEditValue(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = () => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      toast.error('Name cannot be empty');
      return;
    }
    if (trimmed !== editingId && participants.includes(trimmed)) {
      toast.error('A participant with that name already exists');
      return;
    }
    setParticipants(participants.map(p => p === editingId ? trimmed : p));
    setEditingId(null);
    setEditValue('');
    toast.success('Participant updated');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addParticipant();
  };

  // Standard Secret Santa (no self-assignment)
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
    if (participants.length < 2) return toast.error('Add at least 2 participants');

    setIsCreating(true);
    const eventId = crypto.randomUUID().slice(0, 8);
    const deviceId = getDeviceId();

    const shuffled = generateAssignments(participants);
    const assignments = participants.map((p, idx) => ({
      participant: p,
      recipient: shuffled[idx]
    }));

    const { error: eventError } = await supabase.from('draw_events').insert({
      id: eventId,
      name: eventName.trim(),
      description: description.trim() || null,
      created_by: deviceId,
      participants: participants,
      total_participants: participants.length,
      reveal_count: 0,
      allow_redraw: allowRedraw,
      require_name: requireParticipantName
    });

    if (eventError) {
      console.error('Event insertion error:', eventError);
      toast.error(`Failed to create event: ${eventError.message}`);
      setIsCreating(false);
      return;
    }

    const { error: assignError } = await supabase.from('draw_assignments').insert(
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
      await supabase.from('draw_events').delete().eq('id', eventId);
      setIsCreating(false);
      return;
    }

    toast.success('Event created successfully!');
    navigate(`/draw/share/${eventId}`);
    setIsCreating(false);
  };

  if (offline) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📡</span>
        </div>
        <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">No Internet Connection</h2>
        <p className="text-[#84A98C] text-sm">Please connect to the internet to create a DrawNa event.</p>
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
              <h1 className="text-2xl font-bold text-[#1B4D3E]">Create DrawNa Event</h1>
              <p className="text-sm text-[#84A98C] flex items-center gap-2">
                <Sparkles size={14} className="text-[#52B788]" />
                Random draw for any purpose (gift exchange, raffle, team assignment, etc.)
              </p>
            </div>
          </div>

          {/* Event Name */}
          <div>
            <label className="block text-sm font-semibold text-[#52796F] mb-2">Event name</label>
            <input
              type="text"
              placeholder="e.g., Secret Santa, Office Raffle, Team Building"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-5 py-4 bg-white border border-[#E2F0E6] rounded-xl focus:border-[#52B788] focus:ring-2 focus:ring-[#52B788]/20"
            />
          </div>

          {/* Description (optional) */}
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

          {/* Participants */}
          <div>
            <label className="block text-sm font-semibold text-[#52796F] mb-2">
              Participants <span className="text-xs font-normal">({participants.length}/20)</span>
            </label>
            <div className="flex gap-2 mb-4">
              <input
                ref={inputRef}
                type="text"
                placeholder="Enter a name"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-3 bg-white border border-[#D8F3DC] rounded-xl text-[#1B4D3E] placeholder:text-[#84A98C] focus:border-[#52B788] focus:ring-2 focus:ring-[#52B788]/20"
              />
              <button onClick={addParticipant} className="px-4 py-3 bg-[#52B788] text-black rounded-xl hover:bg-[#2D6A4F] transition-colors">
                <Plus size={20} />
              </button>
            </div>

            {participants.length === 0 ? (
              <div className="text-center py-8 bg-[#E9F5E8]/30 rounded-xl border border-dashed border-[#D8F3DC]">
                <Users size={32} className="mx-auto text-[#84A98C] mb-2" />
                <p className="text-sm text-[#84A98C]">No participants yet. Add the first one above.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {participants.map((name) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-xl border border-[#D8F3DC] p-3 flex items-center justify-between group hover:border-[#52B788] transition-all"
                    >
                      {editingId === name ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            autoFocus
                            className="flex-1 px-3 py-1 bg-white border border-[#D8F3DC] rounded-lg text-[#1B4D3E] focus:border-[#52B788] focus:ring-1 focus:ring-[#52B788]"
                          />
                          <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <Check size={18} />
                          </button>
                          <button onClick={cancelEdit} className="p-1 text-red-500 hover:bg-red-50 rounded">
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-[#1B4D3E] font-medium">{name}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(name)} className="p-1.5 text-[#84A98C] hover:text-[#52B788] rounded-lg hover:bg-[#E9F5E8]">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => deleteParticipant(name)} className="p-1.5 text-[#84A98C] hover:text-red-500 rounded-lg hover:bg-red-50">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Allow Redraw toggle */}
          <div className="bg-[#E9F5E8]/50 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <RefreshCw size={18} className="text-[#52B788]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1B4D3E]">Allow redraw</h3>
                  <p className="text-xs text-[#84A98C] mt-0.5">
                    Participants may reject their first draw and get one final redraw.
                  </p>
                </div>
              </div>
              <Toggle checked={allowRedraw} onChange={setAllowRedraw} size="sm" />
            </div>
          </div>

          {/* Require participant name toggle */}
          <div className="bg-[#E9F5E8]/50 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <UserCheck size={18} className="text-[#52B788]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1B4D3E]">Require participant name</h3>
                  <p className="text-xs text-[#84A98C] mt-0.5">
                    Participants must select their name from the list before drawing.
                  </p>
                </div>
              </div>
              <Toggle checked={requireParticipantName} onChange={setRequireParticipantName} size="sm" />
            </div>
          </div>

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full py-4 bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] text-black rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
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