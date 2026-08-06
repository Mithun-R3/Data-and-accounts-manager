import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Person, MonthlyPayment } from '../../lib/types';
import PersonCard from '../../components/admin/PersonCard';
import AddPersonModal from '../../components/admin/AddPersonModal';
import { CardSkeleton } from '../../components/Skeleton';

export default function MembersPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: personsData }, { data: paymentsData }] = await Promise.all([
      supabase.from('persons').select('*').order('level').order('created_at'),
      supabase.from('monthly_payments').select('*').eq('year', currentYear).eq('month', currentMonth),
    ]);
    setPersons(personsData ?? []);
    setPayments(paymentsData ?? []);
    setLoading(false);
  }, [currentYear, currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const personMap = new Map(persons.map(p => [p.id, p]));
  const paidSet = new Set(payments.filter(p => p.is_paid).map(p => p.person_id));

  const byLevel = persons.reduce<Map<number, Person[]>>((acc, p) => {
    if (!acc.has(p.level)) acc.set(p.level, []);
    acc.get(p.level)!.push(p);
    return acc;
  }, new Map());

  const levels = [...byLevel.keys()].sort((a, b) => a - b);
  const totalPaid = payments.filter(p => p.is_paid).length;

  return (
    <div className="p-5 lg:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Members</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {persons.length} members — {totalPaid}/{persons.length} paid this month
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-amber-500/20"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(l => (
            <div key={l}>
              <div className="h-4 w-24 bg-white/5 animate-pulse rounded mb-3" />
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
              </div>
            </div>
          ))}
        </div>
      ) : persons.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400">No members yet. Click "Add Member" to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {levels.map(level => (
            <div key={level}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 text-xs font-bold">{level}</span>
                </div>
                <span className="text-slate-400 text-sm font-medium">Level {level}</span>
                <span className="text-slate-600 text-xs">({byLevel.get(level)!.length} members)</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {byLevel.get(level)!.map(person => (
                  <PersonCard
                    key={person.id}
                    person={person}
                    referrerName={person.referrer_id ? personMap.get(person.referrer_id)?.name : undefined}
                    currentMonthPaid={paidSet.has(person.id)}
                    onRefresh={fetchData}
                    allPersons={persons}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowAdd(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-400 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/30 transition-all z-10"
      >
        <Plus size={24} className="text-white" />
      </button>

      {showAdd && <AddPersonModal onClose={() => setShowAdd(false)} onAdded={fetchData} />}
    </div>
  );
}
