// Supabase Client - reads from config file with env variable fallback
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { supabaseConfig } from '@/config/supabase.config';

// Use config file values, fall back to environment variables
const SUPABASE_URL = 
  (supabaseConfig.supabaseUrl !== "YOUR_SUPABASE_URL_HERE" && supabaseConfig.supabaseUrl) 
    ? supabaseConfig.supabaseUrl 
    : import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY = 
  (supabaseConfig.supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY_HERE" && supabaseConfig.supabaseAnonKey) 
    ? supabaseConfig.supabaseAnonKey 
    : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Warn if credentials are missing
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.warn(
    '⚠️ Supabase credentials not configured.\n' +
    'Please add your credentials to: src/config/supabase.config.ts\n' +
    'Find them in Supabase Dashboard → Settings → API'
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL || '',
  SUPABASE_PUBLISHABLE_KEY || '',
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);