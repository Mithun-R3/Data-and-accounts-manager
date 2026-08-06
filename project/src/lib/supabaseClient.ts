import { mockAuth, mockDb } from './mockDb';

// Toggle this to switch between real Supabase and mock
const USE_MOCK = true;

let supabaseInstance: any;

if (USE_MOCK) {
  supabaseInstance = {
    auth: mockAuth,
    from: (table: string) => mockDb.from(table),
  };
} else {
  // Dynamic import for real Supabase when needed
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('Supabase client failed to initialize, using mock');
    supabaseInstance = {
      auth: mockAuth,
      from: (table: string) => mockDb.from(table),
    };
  }
}

export const supabase = supabaseInstance;
