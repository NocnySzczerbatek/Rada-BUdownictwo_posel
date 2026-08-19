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
  const coordinates = (formData.get('coordinates') as string)?.trim() || null;

  if (!nick || !target_group || !report_type || !content) {
    return { error: 'Wszystkie pola są wymagane.' };
  }

  const { error } = await supabase.from('reports').insert({
    nick: nick.trim(),
    target_group,
    report_type,
    content: content.trim(),
    ...(coordinates ? { coordinates } : {}),
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

export async function voteForReport(id: string) {
  if (!isSupabaseConfigured) return { error: 'Baza nie jest skonfigurowana.' };

  const { data } = await supabase.from('reports').select('votes').eq('id', id).single();
  const { error } = await supabase
    .from('reports')
    .update({ votes: (data?.votes ?? 0) + 1 })
    .eq('id', id);

  if (error) return { error: 'Błąd głosowania.' };
  return { success: true };
}

export async function addComment(reportId: string, nick: string, content: string) {
  if (!isSupabaseConfigured) return { error: 'Baza nie jest skonfigurowana.' };

  const { error } = await supabase.from('comments').insert({
    report_id: reportId,
    nick: nick.trim(),
    content: content.trim(),
  });

  if (error) return { error: 'Błąd podczas dodawania komentarza.' };
  return { success: true };
}

export async function getComments(reportId: string) {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function archiveReport(id: string) {
  if (!isSupabaseConfigured) return { error: 'Baza nie jest skonfigurowana.' };

  const { error } = await supabase
    .from('reports')
    .update({ archived: true })
    .eq('id', id);

  if (error) return { error: 'Błąd podczas archiwizacji.' };
  revalidatePath('/');
  return { success: true };
}

export async function unarchiveReport(id: string) {
  if (!isSupabaseConfigured) return { error: 'Baza nie jest skonfigurowana.' };

  const { error } = await supabase
    .from('reports')
    .update({ archived: false })
    .eq('id', id);

  if (error) return { error: 'Błąd podczas przywracania.' };
  revalidatePath('/');
  return { success: true };
}
