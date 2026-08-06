import { useState } from 'react';
import { Building2, LayoutDashboard, Users, GitBranch, Network, Search, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Page = 'dashboard' | 'members' | 'tree' | 'neighbors' | 'search' | 'settings';

const NAV = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'members' as Page, label: 'Members', icon: Users },
  { id: 'tree' as Page, label: 'Tree View', icon: GitBranch },
  { id: 'neighbors' as Page, label: 'Neighbors', icon: Network },
  { id: 'search' as Page, label: 'Search & Filter', icon: Search },
  { id: 'settings' as Page, label: 'Settings', icon: Settings },
];

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export default function AdminLayout({ currentPage, onNavigate, children }: Props) {
  const { signOut, appUser } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-white/5 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-5 py-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-white font-semibold text-sm truncate">RealEstate Referral</div>
            <div className="text-slate-500 text-xs">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon size={17} className={active ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="px-3 py-2 mb-1">
            <div className="text-xs text-slate-500 truncate">{appUser?.username}</div>
            <div className="text-xs text-amber-500 font-medium">Administrator</div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-slate-900 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <span className="text-white font-semibold text-sm">RealEstate Referral</span>
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          )}
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
