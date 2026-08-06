import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { AppUser } from '../lib/types';

interface Session {
  user: { id: string; email?: string };
  access_token: string;
}

interface User {
  id: string;
  email?: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  appUser: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchAppUser(uid: string) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    setAppUser(data ?? null);
  }

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session as Session | null);
      setUser(session?.user as User | null);
      if (session?.user) {
        await fetchAppUser(session.user.id);
        setLoading(false);
      } else {
        setLoading(false);
      }
    })();

    const subscription = supabase.auth.onAuthStateChange((event: any, newSession: any) => {
      setSession(newSession as Session | null);
      setUser(newSession?.user as User | null);
      if (newSession?.user) {
        (async () => {
          await fetchAppUser(newSession.user.id);
          setLoading(false);
        })();
      } else {
        setAppUser(null);
        setLoading(false);
      }
    });

    return () => subscription?.data?.subscription?.unsubscribe?.();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      appUser,
      loading,
      isAdmin: appUser?.role === 'admin',
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
