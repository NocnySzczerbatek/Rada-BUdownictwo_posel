'use server';

import { createClient } from '@supabase/supabase-js';

export async function adminRegisterUser(nick: string, password: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Service role key – bypasses email confirmation
  const serviceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return { error: 'Brak konfiguracji serwera.' };
  }

  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const mcEmail = `${nick.toLowerCase().replace(/[^a-z0-9_]/g, '')}@mc.local`;

  const { data, error } = await adminClient.auth.admin.createUser({
    email: mcEmail,
    password,
    email_confirm: true,
    user_metadata: { mc_nickname: nick.trim() },
  });

  if (error) {
    if (error.message.includes('already been registered') || error.message.includes('already exists')) {
      return { error: 'Ten nick jest już zajęty.' };
    }
    return { error: error.message };
  }

  return { success: true, userId: data.user?.id };
}
