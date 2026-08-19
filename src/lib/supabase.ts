import { createClient } from '@supabase/supabase-js';
import type { Report } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
// Vercel integration sets SUPABASE_ANON_KEY; manual setup uses NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey !== 'placeholder-key';

export type { Report };
