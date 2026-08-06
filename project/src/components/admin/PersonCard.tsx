import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, CreditCard as Edit2, Trash2, History, Loader2, Phone, Calendar, MapPin, Link2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import type { Person } from '../../lib/types';
import { shortId, formatDate } from '../../lib/utils';
import ConfirmDialog from '../ConfirmDialog';
import PaymentHistoryPanel from './PaymentHistoryPanel';

interface Props {
  person: Person;
  referrerName?: string;
  currentMonthPaid?: boolean;
  onRefresh: () => void;
  allPersons: Person[];
}

interface EditState {
  name: string;
  phone: string;
  number_of_plots: string;
  booking_date: string;
  referrer_id: string;
}

export default function PersonCard({ person, referrerName, currentMonthPaid, onRefresh, allPersons }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    name: person.name,
    phone: person.phone,
    number_of_plots: String(person.number_of_plots),
    booking_date: person.booking_date,
    referrer_id: person.referrer_id ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  async function saveEdit() {
    setSaving(true);
    const { error } = await supabase
      .from('persons')
      .update({
        name: editState.name.trim(),
        phone: editState.phone.trim(),
        number_of_plots: parseInt(editState.number_of_plots) || 1,
        booking_date: editState.booking_date,
        referrer_id: editState.referrer_id || null,
      })
      .eq('id', person.id);

    if (error) toast(error.message, 'error');
    else { toast('Member updated', 'success'); setEditing(false); onRefresh(); }
    setSaving(false);
  }

  async function deletePerson() {
    setDeleting(true);
    const { data: children } = await supabase
      .from('persons')
      .select('id')
      .eq('referrer_id', person.id);

    if (children && children.length > 0) {
      toast(`Cannot delete: ${children.length} member(s) were referred by this person`, 'error');
      setShowDelete(false);
      setDeleting(false);
      return;
    }

    const { error } = await supabase.from('persons').delete().eq('id', person.id);
    if (error) toast(error.message, 'error');
    else { toast('Member deleted', 'success'); onRefresh(); }
    setDeleting(false);
    setShowDelete(false);
  }

  const paidIcon = currentMonthPaid
    ? <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check size={11} className="text-emerald-400" /></span>
    : <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center"><X size={11} className="text-red-400" /></span>;

  return (
    <>
      <div className={`bg-slate-800/60 border rounded-xl overflow-hidden transition-all duration-200 ${expanded ? 'border-amber-500/30' : 'border-white/5 hover:border-white/10'}`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
            <span className="text-amber-400 text-xs font-bold">{person.name[0].toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{person.name}</div>
            <div className="text-slate-500 text-xs font-mono">{shortId(person.id)}</div>
          </div>
          {paidIcon}
          {expanded ? <ChevronUp size={14} className="text-slate-500 shrink-0" /> : <ChevronDown size={14} className="text-slate-500 shrink-0" />}
        </button>

        {expanded && (
          <div className="border-t border-white/5 px-4 py-4">
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Name', key: 'name' as const, type: 'text' },
                    { label: 'Phone', key: 'phone' as const, type: 'text' },
                    { label: 'Plots', key: 'number_of_plots' as const, type: 'number' },
                    { label: 'Booking Date', key: 'booking_date' as const, type: 'date' },
                  ].map(field => (
                    <div key={field.key} className={field.key === 'name' ? 'col-span-2' : ''}>
                      <label className="block text-xs text-slate-500 mb-1">{field.label}</label>
                      <input
                        type={field.type}
                        value={editState[field.key]}
                        onChange={e => setEditState({ ...editState, [field.key]: e.target.value })}
                        className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 [color-scheme:dark]"
                      />
                    </div>
                  ))}
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 mb-1">Referrer</label>
                    <select
                      value={editState.referrer_id}
                      onChange={e => setEditState({ ...editState, referrer_id: e.target.value })}
                      className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-2.5 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="">No referrer</option>
                      {allPersons.filter(p => p.id !== person.id).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 text-xs hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow icon={<Phone size={12} />} label="Phone" value={person.phone} />
                  <InfoRow icon={<MapPin size={12} />} label="Plots" value={String(person.number_of_plots)} />
                  <InfoRow icon={<Calendar size={12} />} label="Booked" value={formatDate(person.booking_date)} />
                  {referrerName && <InfoRow icon={<Link2 size={12} />} label="Referrer" value={referrerName} />}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span>Current month:</span>
                    {currentMonthPaid
                      ? <span className="text-emerald-400 font-medium flex items-center gap-1"><Check size={11} /> Paid</span>
                      : <span className="text-red-400 font-medium flex items-center gap-1"><X size={11} /> Unpaid</span>
                    }
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-700/60 hover:bg-slate-700 border border-white/10 text-slate-300 rounded-lg text-xs font-medium transition-all"
                  >
                    <History size={12} />
                    Payment History
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 border border-white/10 rounded-lg transition-all"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setShowDelete(true)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 rounded-lg transition-all"
                    disabled={deleting}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showHistory && <PaymentHistoryPanel person={person} onClose={() => setShowHistory(false)} />}
      {showDelete && (
        <ConfirmDialog
          title="Delete Member"
          message={`Are you sure you want to delete ${person.name}? This action cannot be undone.`}
          onConfirm={deletePerson}
          onCancel={() => setShowDelete(false)}
          confirmLabel="Delete"
        />
      )}
    </>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-slate-500 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-white text-xs font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
