import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Person } from '../../lib/types';
import { Search } from 'lucide-react';

export default function NeighborsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('persons').select('*').then(({ data }) => {
      setPersons(data ?? []);
    });
  }, []);

  const personMap = new Map(persons.map(p => [p.id, p]));

  const filtered = search.trim()
    ? persons.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search))
    : persons;

  return (
    <div className="p-5 lg:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-white mb-2">Neighbors</h1>
      <p className="text-slate-400 text-sm mb-6">View parent and child members in the referral tree</p>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No members found</p>
          </div>
        ) : (
          filtered.map(person => (
            <div key={person.id} className="p-3 rounded-lg bg-slate-800/60 border border-white/10">
              <div className="text-white font-medium text-sm">{person.name}</div>
              <div className="text-slate-500 text-xs">{person.phone} • Level {person.level}</div>
              {person.referrer_id && (
                <div className="text-slate-600 text-xs mt-1">Referrer: {personMap.get(person.referrer_id)?.name}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
