import { createClient } from '@supabase/supabase-js';
import type { Report } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// false when placeholder values are still in .env.local
export const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey !== 'placeholder-key';

export type { Report };
