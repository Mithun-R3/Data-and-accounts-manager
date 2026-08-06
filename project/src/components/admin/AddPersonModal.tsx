import { useState, useEffect } from 'react';
import { X, Search, Loader2, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import type { Person } from '../../lib/types';

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

export default function AddPersonModal({ onClose, onAdded }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plots, setPlots] = useState('1');
  const [bookingDate, setBookingDate] = useState('');
  const [referrerSearch, setReferrerSearch] = useState('');
  const [referrer, setReferrer] = useState<Person | null>(null);
  const [suggestions, setSuggestions] = useState<Person[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (referrerSearch.trim().length < 2) { setSuggestions([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('persons')
        .select('id, name, phone, level')
        .ilike('name', `%${referrerSearch}%`)
        .limit(8);
      setSuggestions(data ?? []);
      setShowSuggestions(true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [referrerSearch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !bookingDate) {
      toast('Please fill all required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const level = referrer ? referrer.level + 1 : 1;
      const { data: person, error: personError } = await supabase
        .from('persons')
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          number_of_plots: parseInt(plots) || 1,
          booking_date: bookingDate,
          referrer_id: referrer?.id ?? null,
          level,
        })
        .select()
        .single();

      if (personError) throw new Error(personError.message);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ person_id: person.id, name: name.trim(), phone: phone.trim() }),
        }
      );

      const result = await res.json();
      if (!result.success) {
        toast(`Person added but user account failed: ${result.error}`, 'info');
      } else {
        toast(`${name} added successfully`, 'success');
      }

      onAdded();
      onClose();
    } catch (err) {
      toast(String(err), 'error');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-800 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-amber-400" />
            <h2 className="text-white font-semibold">Add New Member</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Enter full name"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone Number</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                placeholder="10-digit phone"
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Plots</label>
              <input
                type="number"
                min="1"
                value={plots}
                onChange={e => setPlots(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Booking Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={e => setBookingDate(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Referred By (optional)</label>
            {referrer ? (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5">
                <span className="text-amber-300 text-sm flex-1">{referrer.name}</span>
                <button type="button" onClick={() => { setReferrer(null); setReferrerSearch(''); }} className="text-slate-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={referrerSearch}
                  onChange={e => setReferrerSearch(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Search by name…"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-8 pr-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                />
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && !referrer && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-10 max-h-48 overflow-y-auto">
                {suggestions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setReferrer(s); setShowSuggestions(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <span className="text-white text-sm">{s.name}</span>
                    <span className="text-slate-500 text-xs">Level {s.level}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : null}
              {loading ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
