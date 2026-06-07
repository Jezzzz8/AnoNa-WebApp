// pages/DrawReveal.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getDeviceId, saveVoteRecord } from '../lib/voteUtils';
import { Loader2, AlertCircle, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import FloatingBackButton from '../components/FloatingBackButton';
import Illustration from '../components/Illustration';
import LoadingSpinner from '../components/LoadingSpinner';
import CustomSelect from '../components/CustomSelect';

export default function DrawReveal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantName, setParticipantName] = useState('');
  const [step, setStep] = useState('input');
  const [recipient, setRecipient] = useState('');
  const [tempRecipient, setTempRecipient] = useState('');
  const [offline, setOffline] = useState(!navigator.onLine);
  const deviceId = getDeviceId();

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
  }, [id, offline]);

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('draw_events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

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

      // Safe Parse Defensive Check for participants array
      let parsedParticipants = data.participants;
      if (typeof parsedParticipants === 'string') {
        try {
          parsedParticipants = JSON.parse(parsedParticipants);
        } catch {
          parsedParticipants = [];
        }
      }
      const structuredEvent = { ...data, participants: parsedParticipants };
      setEvent(structuredEvent);

      const currentIdentity = data.require_name 
        ? localStorage.getItem(`drawna_${id}_participant`) 
        : deviceId;

      if (currentIdentity) {
        const { data: assignment, error: assignError } = await supabase
          .from('draw_assignments')
          .select('participant, recipient, revealed')
          .eq('event_id', id)
          .eq('participant', currentIdentity)
          .maybeSingle();

        if (!assignError && assignment?.revealed) {
          if (data.require_name) setParticipantName(currentIdentity);
          setRecipient(assignment.recipient);
          setStep('result');
          setLoading(false);
          return;
        }
      }

      if (!data.require_name) {
        await handleAnonymousMode(structuredEvent);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Fetch event error:', err);
      setError('Something went wrong');
      setLoading(false);
    }
  };

  const handleAnonymousMode = async (eventData) => {
    const { data: existing, error: existError } = await supabase
      .from('draw_assignments')
      .select('id, recipient, revealed')
      .eq('event_id', id)
      .eq('participant', deviceId)
      .maybeSingle();

    if (existError) {
      console.error('Error checking existing assignment:', existError);
      toast.error('Could not verify assignment. Please refresh.');
      setStep('input');
      setLoading(false);
      return;
    }

    if (existing) {
      if (existing.revealed) {
        setRecipient(existing.recipient);
        setStep('result');
        localStorage.setItem(`drawna_${id}_participant`, deviceId);
        setLoading(false);
        return;
      } else {
        if (eventData.allow_redraw) {
          setTempRecipient(existing.recipient);
          setStep('confirm');
          setLoading(false);
          return;
        } else {
          await acceptDraw(existing.recipient);
          setLoading(false);
          return;
        }
      }
    }

    // Fallback if no matching pre-assigned row exists for this deviceId
    await autoDrawForDevice(eventData, false);
  };

  const autoDrawForDevice = async (eventData, isRedraw = false) => {
    setStep('drawing');

    let participants = eventData.participants;
    if (!Array.isArray(participants) || participants.length === 0) {
      toast.error('Event setup is invalid. Please contact the organizer.');
      setStep('input');
      setLoading(false);
      return;
    }

    const { data: allAssignments, error: fetchError } = await supabase
      .from('draw_assignments')
      .select('participant, recipient, revealed')
      .eq('event_id', id);

    if (fetchError) {
      console.error(fetchError);
      toast.error('Could not check availability');
      setStep('input');
      setLoading(false);
      return;
    }

    // Only exclude recipients that have been permanently locked down by OTHERS
    const takenRecipients = new Set(
      allAssignments
        .filter(assign => assign.participant !== deviceId && assign.revealed)
        .map(assign => assign.recipient)
    );

    let availableRecipients = participants.filter(p => !takenRecipients.has(p));

    if (availableRecipients.length === 0) {
      toast.error('No available recipients left.');
      setStep('input');
      setLoading(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableRecipients.length);
    const chosenRecipient = availableRecipients[randomIndex];
    const final = !eventData.allow_redraw || isRedraw;

    // Use upsert to cleanly isolate and resolve changes to only the user's row assignment
    const { error: upsertError } = await supabase
      .from('draw_assignments')
      .upsert({
        event_id: id,
        participant: deviceId,
        recipient: chosenRecipient,
        revealed: final,
        revealed_at: final ? new Date().toISOString() : null,
      }, { onConflict: 'event_id,participant' });

    if (upsertError) {
      console.error(upsertError);
      toast.error('Could not save assignment. Try again.');
      setStep('input');
      setLoading(false);
      return;
    }

    if (final) {
      await supabase.rpc('increment_draw_reveal_count', { event_id: id });
      localStorage.setItem(`drawna_${id}_participant`, deviceId);
      saveVoteRecord(`draw_${id}_${deviceId}`, deviceId);
      setRecipient(chosenRecipient);
      setStep('result');
    } else {
      setTempRecipient(chosenRecipient);
      setStep('confirm');
    }
    setLoading(false);
  };

  const acceptDraw = async (chosenRecipient) => {
    const currentParticipant = event.require_name ? participantName : deviceId;
    const { error } = await supabase
      .from('draw_assignments')
      .update({ revealed: true, revealed_at: new Date().toISOString() })
      .eq('event_id', id)
      .eq('participant', currentParticipant)
      .eq('recipient', chosenRecipient);

    if (error) {
      toast.error('Could not confirm assignment. Try again.');
      return false;
    }
    await supabase.rpc('increment_draw_reveal_count', { event_id: id });
    localStorage.setItem(`drawna_${id}_participant`, currentParticipant);
    saveVoteRecord(`draw_${id}_${currentParticipant}`, deviceId);
    setRecipient(chosenRecipient);
    setStep('result');
    toast.success('Assignment confirmed!');
    return true;
  };

  const drawRecipient = async (isFinal = false) => {
    if (!participantName) return;
    setStep('drawing');

    const participants = event.participants;
    if (!participants.includes(participantName)) {
      toast.error('Your name is not on the list. Please select a valid name.');
      setStep('input');
      return;
    }

    const { data: existing, error: existError } = await supabase
      .from('draw_assignments')
      .select('id, recipient, revealed')
      .eq('event_id', id)
      .eq('participant', participantName)
      .maybeSingle();

    if (existError) {
      console.error(existError);
      toast.error('Could not verify assignment. Please refresh.');
      setStep('input');
      return;
    }

    // Since CreateDrawEvent builds these allocations ahead of time, route them immediately
    if (existing) {
      if (existing.revealed) {
        setRecipient(existing.recipient);
        setStep('result');
        return;
      } else {
        if (event.allow_redraw && !isFinal) {
          setTempRecipient(existing.recipient);
          setStep('confirm');
        } else {
          await acceptDraw(existing.recipient);
        }
        return;
      }
    }

    // Dynamic runtime fallback generation (if pre-allocation row was lost)
    const { data: allAssignments, error: fetchAssignmentsError } = await supabase
      .from('draw_assignments')
      .select('recipient, participant, revealed')
      .eq('event_id', id);

    if (fetchAssignmentsError) {
      toast.error('Could not fetch assignments.');
      setStep('input');
      return;
    }

    const takenRecipients = new Set(
      allAssignments
        .filter(assign => assign.participant !== participantName && assign.revealed)
        .map(assign => assign.recipient)
    );

    let available = participants.filter(
      (p) => p !== participantName && !takenRecipients.has(p)
    );

    if (available.length === 0) {
      toast.error('No available recipients left.');
      setStep('input');
      return;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const chosen = available[randomIndex];
    const final = !event.allow_redraw || isFinal;

    const { error: insertError } = await supabase
      .from('draw_assignments')
      .upsert({
        event_id: id,
        participant: participantName,
        recipient: chosen,
        revealed: final,
        revealed_at: final ? new Date().toISOString() : null,
      }, { onConflict: 'event_id,participant' });

    if (insertError) {
      console.error(insertError);
      toast.error('Could not perform draw. Try again.');
      setStep('input');
      return;
    }

    if (final) {
      await supabase.rpc('increment_draw_reveal_count', { event_id: id });
      localStorage.setItem(`drawna_${id}_participant`, participantName);
      saveVoteRecord(`draw_${id}_${participantName}`, deviceId);
      setRecipient(chosen);
      setStep('result');
      toast.success('Your final recipient has been assigned!');
    } else {
      setTempRecipient(chosen);
      setStep('confirm');
    }
  };

  const rejectDraw = async () => {
    const participants = event.participants;
    const currentParticipant = event.require_name ? participantName : deviceId;

    const { data: allAssignments, error: fetchError } = await supabase
      .from('draw_assignments')
      .select('recipient, participant, revealed')
      .eq('event_id', id);

    if (fetchError) {
      toast.error('Could not process redraw.');
      return;
    }

    // Filter rules setup: exclusively look out for finalized/revealed choices from other participants
    const takenRecipients = new Set(
      allAssignments
        .filter(assign => assign.participant !== currentParticipant && assign.revealed)
        .map(assign => assign.recipient)
    );

    let available = participants.filter(p => {
      if (event.require_name && p === currentParticipant) return false;
      if (takenRecipients.has(p)) return false;
      if (p === tempRecipient) return false;
      return true;
    });

    if (available.length === 0) {
      if (participants.length === 2) {
        toast.error('Only one other participant exists. Redraw not possible. Please accept the current assignment.');
      } else {
        toast.error(`No alternative recipients available.`);
      }
      return;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    const newRecipient = available[randomIndex];

    const { error: updateError } = await supabase
      .from('draw_assignments')
      .update({
        recipient: newRecipient,
        revealed: true,
        revealed_at: new Date().toISOString(),
      })
      .eq('event_id', id)
      .eq('participant', currentParticipant);

    if (updateError) {
      console.error(updateError);
      toast.error('Could not redraw. Try again.');
      return;
    }

    await supabase.rpc('increment_draw_reveal_count', { event_id: id });
    localStorage.setItem(`drawna_${id}_participant`, currentParticipant);
    saveVoteRecord(`draw_${id}_${currentParticipant}`, deviceId);
    setRecipient(newRecipient);
    setStep('result');
    toast.success('Redrawn successfully!');
  };

  if (offline) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <span className="text-3xl">📡</span>
        </div>
        <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">No Internet Connection</h2>
        <p className="text-[#84A98C] text-sm">Please connect to the internet to draw your recipient.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-[#52B788] text-white rounded-xl">Retry</button>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading..." />;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-white to-[#F5FEF7]">
      <AlertCircle size={48} className="text-[#84A98C] mb-4" />
      <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">{error}</h2>
      <button onClick={() => navigate('/')} className="btn-primary w-auto px-6 py-2">Go Home</button>
    </div>
  );
  if (!event) return null;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="px-5 py-12 max-w-lg mx-auto pb-32">
        <div className="text-center mb-6">
          <div className="inline-block px-3 py-1 bg-[#E9F5E8] rounded-full text-xs font-medium text-[#2D6A4F] mb-3">
            {event.name}
          </div>
          <h1 className="text-xl font-bold text-[#1B4D3E]">{event.description || 'Random Draw Event'}</h1>
        </div>

        {step === 'input' && event.require_name && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-md border border-[#D8F3DC]">
              <label className="block text-sm font-semibold text-[#52796F] mb-3">Select your name</label>
              <CustomSelect
                options={event.participants}
                value={participantName}
                onChange={setParticipantName}
                placeholder="-- Choose your name --"
              />
            </div>
            <button
              onClick={() => drawRecipient(false)}
              disabled={!participantName.trim()}
              className="w-full py-4 bg-gradient-to-r from-[#1B4D3E] to-[#2D6A4F] text-black rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Gift size={18} /> Draw my recipient
            </button>
          </div>
        )}

        {step === 'drawing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#52B788]" size={48} />
            <p className="mt-4 text-[#84A98C]">Picking someone special...</p>
          </div>
        )}

        {step === 'confirm' && (
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 shadow-xl border border-[#52B788] text-center">
            <div className="w-20 h-20 mx-auto bg-[#E9F5E8] rounded-full flex items-center justify-center mb-4">
              <Gift size={40} className="text-[#52B788]" />
            </div>
            <h2 className="text-xl font-bold text-[#1B4D3E] mb-2">Your draw result:</h2>
            <p className="text-3xl font-extrabold text-[#52B788] mb-4">{tempRecipient}</p>
            <p className="text-sm text-[#84A98C] mb-6">Do you want to keep this assignment?</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => acceptDraw(tempRecipient)} className="flex-1 py-3 bg-gradient-to-r from-[#52B788] to-[#2D6A4F] text-black rounded-xl font-semibold">
                Accept
              </button>
              <button onClick={rejectDraw} className="flex-1 py-3 bg-[#E9F5E8] text-[#2D6A4F] rounded-xl font-semibold hover:bg-[#D8F3DC]">
                Redraw
              </button>
            </div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-8 shadow-xl border border-[#52B788] text-center">
            <div className="w-20 h-20 mx-auto bg-[#E9F5E8] rounded-full flex items-center justify-center mb-4">
              <Gift size={40} className="text-[#52B788]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1B4D3E] mb-2">Your recipient is:</h2>
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