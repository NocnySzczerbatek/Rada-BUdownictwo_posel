'use server';

import { revalidatePath } from 'next/cache';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { TargetGroup, ApplicationTargetGroup, ApplicationStatus } from '@/types';

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

export async function voteForReport(id: string) {  if (!isSupabaseConfigured) return { error: 'Baza nie jest skonfigurowana.' };

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

// ── Applications ────────────────────────────────────────────

export async function createApplication(formData: FormData) {
  if (!isSupabaseConfigured) return { error: 'Baza danych nie jest skonfigurowana.' };

  const nick = formData.get('nick') as string;
  const target_group = formData.get('target_group') as ApplicationTargetGroup;
  const application_type = formData.get('application_type') as string;
  const content = formData.get('content') as string;

  if (!nick || !target_group || !application_type || !content) {
    return { error: 'Wszystkie pola są wymagane.' };
  }

  const { error } = await supabase.from('applications').insert({
    nick: nick.trim(),
    target_group,
    application_type,
    content: content.trim(),
    status: 'Oczekuje',
  });

  if (error) return { error: 'Błąd podczas zapisywania wniosku.' };
  revalidatePath('/');
  return { success: true };
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  decision_reason?: string
) {
  if (!isSupabaseConfigured) return { error: 'Baza nie jest skonfigurowana.' };

  const { error } = await supabase
    .from('applications')
    .update({ status, decision_reason: decision_reason ?? null })
    .eq('id', id);

  if (error) return { error: 'Błąd podczas aktualizacji statusu.' };
  revalidatePath('/');
  return { success: true };
}

export async function archiveApplication(id: string, archived: boolean) {
  if (!isSupabaseConfigured) return { error: 'Baza nie jest skonfigurowana.' };

  const { error } = await supabase.from('applications').update({ archived }).eq('id', id);
  if (error) return { error: 'Błąd podczas archiwizacji.' };
  revalidatePath('/');
  return { success: true };
}

export async function updateReportProgress(id: string, progress: number) {
  if (!isSupabaseConfigured) return { error: 'Baza nie jest skonfigurowana.' };

  const { error } = await supabase.from('reports').update({ progress }).eq('id', id);
  if (error) return { error: 'Błąd podczas aktualizacji postępu.' };
  revalidatePath('/');
  return { success: true };
}
