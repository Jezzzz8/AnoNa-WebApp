import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getDeviceId } from '../lib/voteUtils';
import { Loader2, Users, Eye } from 'lucide-react';
import FloatingBackButton from '../components/FloatingBackButton';
import Illustration from '../components/Illustration';

export default function PullOrganizer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
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
    else {
      setLoading(false);
      setError('You are offline. Cannot load organizer dashboard.');
    }

    const subscription = supabase
      .channel(`pull-organizer-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pull_events', filter: `id=eq.${id}` }, payload => {
        if (payload.new) setEvent(payload.new);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pull_assignments', filter: `event_id=eq.${id}` }, () => {
        fetchRevealCount();
      })
      .subscribe();
    return () => subscription.unsubscribe();
  }, [id, offline]);

  const fetchEvent = async () => {
    const { data, error } = await supabase.from('pull_events').select('*').eq('id', id).single();
    if (error || !data) {
      navigate('/');
      return;
    }
    const deviceId = getDeviceId();
    if (data.created_by !== deviceId) {
      setUnauthorized(true);
      setLoading(false);
      return;
    }
    setEvent(data);
    await fetchRevealCount();
    setLoading(false);
  };

  const fetchRevealCount = async () => {
    const { count, error } = await supabase
      .from('pull_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('revealed', true);
    if (!error) setRevealedCount(count);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#52B788]" size={40} /></div>;
  if (offline) return (
    <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <span className="text-3xl">📡</span>
      </div>
      <h2 className="text-xl font-bold text-[#1B4D3E]">No Internet Connection</h2>
      <p className="text-[#84A98C] text-sm">Cannot load dashboard while offline.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-4 w-auto px-6 py-2">Go Home</button>
    </div>
  );
  if (unauthorized) return (
    <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
      <h2 className="text-xl font-bold text-red-500">Unauthorized</h2>
      <button onClick={() => navigate('/')} className="btn-primary mt-4">Go Home</button>
    </div>
  );
  if (!event) return null;

  const progress = (revealedCount / event.total_participants) * 100;

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-[#F5FEF7]">
      <div className="px-5 py-12 max-w-lg mx-auto pb-32">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#1B4D3E]">{event.name}</h1>
          <p className="text-sm text-[#84A98C] mt-1">Organizer Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md border border-[#D8F3DC] mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#52B788]" />
              <span className="font-semibold text-[#1B4D3E]">Participants</span>
            </div>
            <span className="text-2xl font-bold text-[#52B788]">{revealedCount} / {event.total_participants}</span>
          </div>
          <div className="h-2 bg-[#E9F5E8] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#52B788] to-[#2D6A4F] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 text-sm text-[#84A98C]">
            <Eye size={14} /> {revealedCount} have revealed their recipient
          </div>
        </div>

        <Illustration type="groupChat" size="sm" className="mx-auto" />

        <div className="mt-6 text-center text-xs text-[#84A98C]">
          Recipients are hidden for privacy. Participants see only their own assignment.
        </div>
      </div>
      <FloatingBackButton onClick={() => navigate('/')} label="Back to Home" />
    </div>
  );
}