import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';
import { LogOut, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { appUser, signOut } = useAuth();
  const { toast } = useToast();
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast('Passwords do not match', 'error');
      return;
    }
    if (newPw.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      toast(error.message, 'error');
    } else {
      toast('Password updated successfully', 'success');
      setNewPw('');
      setConfirmPw('');
      setChangingPassword(false);
    }
    setLoading(false);
  }

  return (
    <div className="p-5 lg:p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-slate-400 text-sm mb-8">Manage your account and preferences</p>

      <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold text-sm mb-4">Account Information</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">Username</label>
            <input
              type="text"
              value={appUser?.username ?? ''}
              disabled
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 font-medium mb-1">Role</label>
            <input
              type="text"
              value={appUser?.role ?? ''}
              disabled
              className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm disabled:opacity-60 capitalize"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-white/10 rounded-xl p-6 mb-6">
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
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 font-medium mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                required
                className="w-full bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium transition-all disabled:opacity-60"
              >
                {loading ? 'Updating…' : 'Update'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <LogOut size={16} className="text-red-400" />
          Sign Out
        </h2>
        <button
          onClick={signOut}
          className="px-4 py-2.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-medium transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
