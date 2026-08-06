import { useState, useEffect, useCallback } from 'react';
import { LogOut, Lock, ChevronLeft, ChevronRight, Check, AlertCircle, Loader2, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Person, MonthlyPayment } from '../lib/types';
import { MONTHS, formatDate, isMonthDisabled, getYearsRange, formatCurrency } from '../lib/utils';
import { CardSkeleton } from '../components/Skeleton';

export default function UserDashboardPage() {
  const { appUser, signOut, user } = useAuth();
  const { toast } = useToast();
  const [person, setPerson] = useState<Person | null>(null);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!appUser?.person_id) return;
    const [personRes, paymentsRes] = await Promise.all([
      supabase.from('persons').select('*').eq('id', appUser.person_id).single(),
      supabase.from('monthly_payments').select('*').eq('person_id', appUser.person_id).eq('year', year),
    ]);
    if (!personRes.error) setPerson(personRes.data);
    if (!paymentsRes.error) setPayments(paymentsRes.data ?? []);
    setLoading(false);
  }, [appUser?.person_id, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const years = person ? getYearsRange(person.booking_date) : [];

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) { toast('Passwords do not match', 'error'); return; }
    if (newPw.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }

    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) toast(error.message, 'error');
    else {
      toast('Password updated', 'success');
      setNewPw('');
      setConfirmPw('');
      setChangingPassword(false);
    }
    setPwLoading(false);
  }

  async function handlePayNow(month: number) {
    if (!person) return;

    setProcessingPayment(`${month}`);

    // Create Razorpay order via simple fetch to /functions/v1/create-razorpay-order
    // For now, we'll just show a placeholder - in production, integrate with Razorpay API
    try {
      const amount = 10000; // ₹100 in paise (example)

      // Initialize Razorpay
      const scriptId = 'razorpay-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        document.head.appendChild(script);
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount,
        currency: 'INR',
        name: 'RealEstate Referral',
        description: `Payment for ${MONTHS[month - 1]} ${year}`,
        notes: {
          person_id: person.id,
          year: year.toString(),
          month: month.toString(),
        },
        handler: async (response: any) => {
          // Payment successful - webhook will handle DB update
          toast('Payment successful! Status will update shortly.', 'success');
          setTimeout(() => fetchData(), 2000);
        },
        prefill: {
          name: person.name,
          contact: person.phone,
        },
      };

      const razorpay = (window as any).Razorpay;
      if (!razorpay) {
        toast('Razorpay not loaded. Please try again.', 'error');
        setProcessingPayment(null);
        return;
      }

      new razorpay(options).open();
    } catch (err) {
      toast('Payment initiation failed', 'error');
    }
    setProcessingPayment(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-5 lg:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5">
        <div className="text-center">
          <p className="text-slate-400 font-medium">Profile not found</p>
        </div>
      </div>
    );
  }

  const getPayment = (month: number) => payments.find(p => p.month === month);

  return (
    <div className="min-h-screen bg-slate-950 p-5 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Welcome, {person.name}</p>
          </div>
          <button
            onClick={signOut}
            className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition-all"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold text-sm mb-4">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-500 text-xs">Full Name</p>
              <p className="text-white text-sm font-medium mt-1">{person.name}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Phone Number</p>
              <p className="text-white text-sm font-medium mt-1">{person.phone}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Number of Plots</p>
              <p className="text-white text-sm font-medium mt-1">{person.number_of_plots}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Booking Date</p>
              <p className="text-white text-sm font-medium mt-1">{formatDate(person.booking_date)}</p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-sm">Payment History</h2>
            <div className="flex items-center gap-1 bg-slate-900/60 rounded-xl px-1 py-1 border border-white/10">
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
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {MONTHS.map((label, idx) => {
              const month = idx + 1;
              const disabled = isMonthDisabled(year, month, person.booking_date);
              const payment = getPayment(month);
              const isPaid = payment?.is_paid ?? false;

              return (
                <div key={month} className={`rounded-xl p-3 flex flex-col items-start gap-1.5 border transition-all relative group ${
                  disabled
                    ? 'bg-slate-900/30 border-white/5 opacity-40 cursor-not-allowed'
                    : isPaid
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-900/50 border-white/10'
                }`}>
                  <span className="text-xs font-medium text-slate-400">{label}</span>
                  {isPaid ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      {payment?.amount_paid && (
                        <span className="text-xs text-emerald-400 font-medium">{formatCurrency(payment.amount_paid)}</span>
                      )}
                    </>
                  ) : disabled ? null : (
                    <>
                      <AlertCircle size={14} className="text-red-400" />
                      <button
                        onClick={() => handlePayNow(month)}
                        disabled={processingPayment === `${month}`}
                        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 bg-black/60 flex items-center justify-center transition-all group-hover:opacity-100"
                      >
                        {processingPayment === `${month}` ? (
                          <Loader2 size={14} className="text-white animate-spin" />
                        ) : (
                          <Zap size={14} className="text-amber-400" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-3">Hover over unpaid months to pay now</p>
        </div>

        {/* Settings */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6">
          <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Lock size={16} />
            Security
          </h2>

          {!changingPassword ? (
            <button
              onClick={() => setChangingPassword(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-medium transition-all"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">New Password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-medium mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setChangingPassword(false);
                    setNewPw('');
                    setConfirmPw('');
                  }}
                  className="flex-1 py-2 rounded-lg border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium transition-all disabled:opacity-60"
                >
                  {pwLoading ? 'Updating…' : 'Update'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
