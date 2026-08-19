'use server';

import { revalidatePath } from 'next/cache';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { TargetGroup } from '@/types';

export async function createReport(formData: FormData) {
  if (!isSupabaseConfigured) {
    return { error: 'Baza danych nie jest skonfigurowana. Uzupełnij .env.local kluczami Supabase.' };
  }

  const nick = formData.get('nick') as string;
  const target_group = formData.get('target_group') as TargetGroup;
  const report_type = formData.get('report_type') as string;
  const content = formData.get('content') as string;

  if (!nick || !target_group || !report_type || !content) {
    return { error: 'Wszystkie pola są wymagane.' };
  }

  const { error } = await supabase.from('reports').insert({
    nick: nick.trim(),
    target_group,
    report_type,
    content: content.trim(),
    status: 'Nowe',
  });

  if (error) {
    return { error: 'Błąd podczas zapisywania zgłoszenia. Spróbuj ponownie.' };
  }

  revalidatePath('/');
  return { success: true };
}

export async function updateReportStatus(id: string, status: string) {
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id);

  if (error) {
    return { error: 'Błąd podczas aktualizacji statusu.' };
  }

  revalidatePath('/');
  return { success: true };
}
