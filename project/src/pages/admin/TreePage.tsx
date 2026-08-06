import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { Person } from '../../lib/types';
import { shortId, formatDate } from '../../lib/utils';
import { ChevronRight, ChevronDown, Users, User, Link2, ArrowDownRight, Phone, MapPin } from 'lucide-react';

export default function TreePage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('persons').select('*').order('name').then(({ data }) => {
      setPersons(data ?? []);
      setLoading(false);
    });
  }, []);

  const childrenOf = useMemo(() => {
    const map = new Map<string, Person[]>();
    for (const p of persons) {
      if (p.referrer_id) {
        const arr = map.get(p.referrer_id) ?? [];
        arr.push(p);
        map.set(p.referrer_id, arr);
      }
    }
    return map;
  }, [persons]);

  const personMap = useMemo(() => new Map(persons.map(p => [p.id, p])), [persons]);

  const roots = useMemo(() => persons.filter(p => !p.referrer_id), [persons]);

  const filteredRoots = useMemo(() => {
    if (!search.trim()) return roots;
    const q = search.toLowerCase();
    const matchingIds = new Set<string>();
    for (const p of persons) {
      if (p.name.toLowerCase().includes(q) || p.phone.includes(q)) {
        matchingIds.add(p.id);
        if (p.referrer_id) matchingIds.add(p.referrer_id);
      }
    }
    return roots.filter(r => matchingIds.has(r.id) || childrenOf.get(r.id)?.some(c => matchingIds.has(c.id)));
  }, [roots, persons, search, childrenOf]);

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpanded(new Set(persons.map(p => p.id)));
  }

  function collapseAll() {
    setExpanded(new Set());
  }

  function renderNode(person: Person, depth: number): React.ReactNode {
    const children = childrenOf.get(person.id) ?? [];
    const isExpanded = expanded.has(person.id);
    const referrer = person.referrer_id ? personMap.get(person.referrer_id) : null;

    return (
      <div key={person.id} className="relative">
        <div
          className={`flex items-start gap-2 py-2.5 px-3 rounded-lg transition-colors ${
            depth === 0
              ? 'bg-slate-700/40 hover:bg-slate-700/60'
              : 'hover:bg-white/5'
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {children.length > 0 ? (
            <button
              onClick={() => toggle(person.id)}
              className="mt-0.5 p-1 rounded-md hover:bg-white/10 text-slate-400 transition-colors shrink-0"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <div className="w-6 flex justify-center shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <span className="text-amber-400 text-xs font-bold">{person.name[0].toUpperCase()}</span>
              </div>
              <span className="text-white text-sm font-medium">{person.name}</span>
              <span className="text-slate-600 text-xs font-mono">{shortId(person.id)}</span>
              {depth === 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">Root</span>
              )}
            </div>

            <div className="flex items-center gap-4 mt-1.5 ml-9 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Phone size={10} /> {person.phone}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={10} /> {person.number_of_plots} plot{person.number_of_plots > 1 ? 's' : ''}
              </span>
              {referrer && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Link2 size={10} /> referred by <span className="text-amber-400/80">{referrer.name}</span>
                </span>
              )}
            </div>

            {children.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 ml-9 text-xs text-slate-500">
                <ArrowDownRight size={11} className="text-emerald-400/60" />
                <span>{children.length} direct referral{children.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {isExpanded && children.length > 0 && (
          <div className="border-l border-white/5 ml-4 mt-0.5">
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-5 lg:p-6">
        <h1 className="text-xl font-bold text-white mb-2">Tree Structure</h1>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-white/5 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Tree Structure</h1>
          <p className="text-slate-400 text-sm">Hierarchical view of referral chains</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs hover:bg-white/5 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 rounded-lg border border-white/10 text-slate-300 text-xs hover:bg-white/5 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="mb-4 relative">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full bg-slate-900/60 border border-white/10 rounded-xl pl-4 pr-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
        />
      </div>

      <div className="bg-slate-800/40 border border-white/10 rounded-xl p-4">
        {filteredRoots.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">
              {search.trim() ? 'No matching members found' : 'No members yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredRoots.map(root => renderNode(root, 0))}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <User size={12} /> {persons.length} total members
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={12} /> {roots.length} root{roots.length !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <Link2 size={12} /> {persons.filter(p => p.referrer_id).length} referrals
        </span>
      </div>
    </div>
  );
}
