import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

interface Stats {
  totalMembers: number;
  totalLevels: number;
  thisMonthPaid: number;
  thisMonthUnpaid: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, totalLevels: 0, thisMonthPaid: 0, thisMonthUnpaid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    Promise.all([
      supabase.from('persons').select('id, level'),
      supabase.from('monthly_payments').select('is_paid').eq('year', now.getFullYear()).eq('month', now.getMonth() + 1),
    ]).then(([{ data: persons }, { data: payments }]) => {
      const allPersons = persons ?? [];
      const maxLevel = Math.max(...(allPersons.map(p => p.level) || [0]));
      const paid = (payments ?? []).filter(p => p.is_paid).length;

      setStats({
        totalMembers: allPersons.length,
        totalLevels: maxLevel,
        thisMonthPaid: paid,
        thisMonthUnpaid: (payments ?? []).length - paid,
      });
      setLoading(false);
    });
  }, []);

  const cards = [
    { icon: Users, label: 'Total Members', value: stats.totalMembers, color: 'amber' },
    { icon: TrendingUp, label: 'Tree Depth', value: stats.totalLevels, color: 'blue' },
    { icon: CheckCircle, label: 'Paid This Month', value: stats.thisMonthPaid, color: 'emerald' },
    { icon: AlertCircle, label: 'Unpaid This Month', value: stats.thisMonthUnpaid, color: 'red' },
  ];

  return (
    <div className="p-5 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          const colorMap = {
            amber: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
            blue: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
            emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
            red: 'bg-red-500/15 border-red-500/30 text-red-400',
          };

          return (
            <div key={i} className={`p-5 rounded-xl border transition-all ${colorMap[card.color as keyof typeof colorMap]} bg-slate-800/40 backdrop-blur`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs font-medium mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-white">{loading ? '—' : card.value}</p>
                </div>
                <Icon size={24} className="text-current opacity-50" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-6 bg-slate-800/40 border border-white/5 rounded-xl">
        <h2 className="text-white font-semibold mb-3">System Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Platform Version</p>
            <p className="text-white font-medium">1.0.0</p>
          </div>
          <div>
            <p className="text-slate-500">Database</p>
            <p className="text-white font-medium">Supabase PostgreSQL</p>
          </div>
          <div>
            <p className="text-slate-500">Authentication</p>
            <p className="text-white font-medium">Supabase Auth</p>
          </div>
          <div>
            <p className="text-slate-500">Payments</p>
            <p className="text-white font-medium">Razorpay Integration</p>
          </div>
        </div>
      </div>
    </div>
  );
}
