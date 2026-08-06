import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle, Loader2, CreditCard as Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';
import type { Person, MonthlyPayment } from '../../lib/types';
import { MONTHS, formatCurrency, isMonthDisabled, getYearsRange } from '../../lib/utils';

interface Props {
  person: Person;
  onClose: () => void;
  readOnly?: boolean;
}

interface EditingCell {
  year: number;
  month: number;
  amount: string;
  isPaid: boolean;
}

export default function PaymentHistoryPanel({ person, onClose, readOnly = false }: Props) {
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const years = getYearsRange(person.booking_date);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('monthly_payments')
      .select('*')
      .eq('person_id', person.id)
      .eq('year', year);
    if (!error) setPayments(data ?? []);
    setLoading(false);
  }, [person.id, year]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  async function ensureMonthRow(month: number) {
    const existing = payments.find(p => p.month === month);
    if (existing) return existing;

    const { data, error } = await supabase
      .from('monthly_payments')
      .insert({ person_id: person.id, year, month, is_paid: false })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await ensureMonthRow(editing.month);
      const { error } = await supabase
        .from('monthly_payments')
        .update({
          is_paid: editing.isPaid,
          amount_paid: editing.amount ? parseFloat(editing.amount) : null,
          paid_at: editing.isPaid ? new Date().toISOString() : null,
        })
        .eq('person_id', person.id)
        .eq('year', year)
        .eq('month', editing.month);

      if (error) throw new Error(error.message);
      toast('Payment updated', 'success');
      setEditing(null);
      await fetchPayments();
    } catch (err) {
      toast(String(err), 'error');
    }
    setSaving(false);
  }

  function openEdit(month: number) {
    const p = payments.find(p => p.month === month);
    setEditing({
      year,
      month,
      amount: p?.amount_paid?.toString() ?? '',
      isPaid: p?.is_paid ?? false,
    });
  }

  const getPayment = (month: number) => payments.find(p => p.month === month);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-800 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-white font-semibold">{person.name}</h2>
            <p className="text-slate-400 text-xs mt-0.5">Payment History</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 rounded-xl px-1 py-1 border border-white/10">
            <button
              onClick={() => setYear(y => Math.max(years[0], y - 1))}
              disabled={year <= years[0]}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors rounded-lg hover:bg-white/5"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-white text-sm font-medium w-12 text-center">{year}</span>
            <button
              onClick={() => setYear(y => Math.min(years[years.length - 1], y + 1))}
              disabled={year >= years[years.length - 1]}
              className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition-colors rounded-lg hover:bg-white/5"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-20 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {MONTHS.map((label, idx) => {
                const month = idx + 1;
                const disabled = isMonthDisabled(year, month, person.booking_date);
                const payment = getPayment(month);
                const isPaid = payment?.is_paid ?? false;

                return (
                  <button
                    key={month}
                    disabled={disabled || readOnly}
                    onClick={() => !disabled && !readOnly && openEdit(month)}
                    className={`relative rounded-xl p-3 flex flex-col items-start gap-1.5 border transition-all group ${
                      disabled
                        ? 'bg-slate-900/30 border-white/5 opacity-40 cursor-not-allowed'
                        : isPaid
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/15 cursor-pointer'
                        : 'bg-slate-900/50 border-white/10 hover:bg-slate-700/50 cursor-pointer'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-400">{label}</span>
                    {isPaid ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        {payment?.amount_paid && (
                          <span className="text-xs text-emerald-400 font-medium truncate w-full">
                            {formatCurrency(payment.amount_paid)}
                          </span>
                        )}
                      </>
                    ) : disabled ? null : (
                      <AlertCircle size={14} className="text-red-400" />
                    )}
                    {!disabled && !readOnly && (
                      <Edit2 size={11} className="absolute top-2 right-2 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {editing && (
          <div className="border-t border-white/5 p-5 bg-slate-900/50 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium text-sm">
                Edit — {MONTHS[editing.month - 1]} {editing.year}
              </h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="number"
                placeholder="Amount (₹)"
                value={editing.amount}
                onChange={e => setEditing({ ...editing, amount: e.target.value })}
                className="flex-1 min-w-[120px] bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                onClick={() => setEditing({ ...editing, isPaid: !editing.isPaid })}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  editing.isPaid
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-800 border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                {editing.isPaid ? <Check size={14} /> : <AlertCircle size={14} />}
                {editing.isPaid ? 'Paid' : 'Unpaid'}
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
