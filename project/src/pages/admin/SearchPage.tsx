import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Person, MonthlyPayment } from '../../lib/types';
import { Search } from 'lucide-react';
import PersonCard from '../../components/admin/PersonCard';

type PaymentFilter = 'all' | 'paid' | 'unpaid';

export default function SearchPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');

  useEffect(() => {
    Promise.all([
      supabase.from('persons').select('*'),
      supabase.from('monthly_payments').select('*').eq('year', new Date().getFullYear()).eq('month', new Date().getMonth() + 1),
    ]).then(([{ data: p }, { data: pay }]) => {
      setPersons(p ?? []);
      setPayments(pay ?? []);
    });
  }, []);

  const personMap = new Map(persons.map(p => [p.id, p]));
  const paidSet = new Set(payments.filter(p => p.is_paid).map(p => p.person_id));

  let results = persons;

  if (search.trim()) {
    const term = search.toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(term) || p.phone.includes(term));
  }

  if (paymentFilter === 'paid') results = results.filter(p => paidSet.has(p.id));
  if (paymentFilter === 'unpaid') results = results.filter(p => !paidSet.has(p.id));

  return (
    <div className="p-5 lg:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-2">Search & Filter</h1>
      <p className="text-slate-400 text-sm mb-6">Find members by name, phone, or criteria</p>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div className="mb-6 flex gap-3">
        <select
          value={paymentFilter}
          onChange={e => setPaymentFilter(e.target.value as PaymentFilter)}
          className="bg-slate-800/60 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="all">All Payment Status</option>
          <option value="paid">Paid This Month</option>
          <option value="unpaid">Unpaid This Month</option>
        </select>
      </div>

      <div className="mb-4 text-sm text-slate-400">
        Found <span className="text-white font-semibold">{results.length}</span> member{results.length !== 1 ? 's' : ''}
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/30 rounded-xl border border-white/5 text-slate-400">
          <p>No members match your search criteria</p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              referrerName={person.referrer_id ? personMap.get(person.referrer_id)?.name : undefined}
              currentMonthPaid={paidSet.has(person.id)}
              onRefresh={() => {}}
              allPersons={persons}
            />
          ))}
        </div>
      )}
    </div>
  );
}
