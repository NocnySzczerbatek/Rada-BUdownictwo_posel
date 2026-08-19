import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { createServerSupabase } from '@/lib/supabase-server';
import { SectionPage } from '@/components/SectionPage';
import { UserMenu } from '@/components/UserMenu';
import type { Report, Application } from '@/types';
import { Shield, AlertTriangle, LogIn } from 'lucide-react';
import Link from 'next/link';

async function getReports(): Promise<Report[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('reports').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data as Report[]).map((r) => ({
    ...r,
    votes: r.votes ?? 0,
    archived: r.archived ?? false,
    coordinates: r.coordinates ?? null,
    progress: r.progress ?? 0,
  }));
}

async function getApplications(): Promise<Application[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data as Application[]).map((a) => ({
    ...a,
    votes: a.votes ?? 0,
    archived: a.archived ?? false,
    decision_reason: a.decision_reason ?? null,
  }));
}

interface Profile {
  id: string;
  mc_nickname: string;
  role: string;
}

async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const serverSupabase = await createServerSupabase();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return null;
    const { data } = await serverSupabase.from('profiles').select('id, mc_nickname, role').eq('id', user.id).single();
    return data as Profile | null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [reports, applications, profile] = await Promise.all([
    getReports(),
    getApplications(),
    getCurrentProfile(),
  ]);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="fixed inset-0 bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {!isSupabaseConfigured && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Brak konfiguracji Supabase – uzupełnij <code className="font-mono bg-amber-500/10 px-1 rounded">.env.local</code>.</span>
            </div>
          </div>
        )}

        <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600/20 border border-emerald-600/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 leading-none">Rada Budowniczych</h1>
                <p className="text-xs text-slate-500 mt-0.5">Panel Administracyjny</p>
              </div>
            </div>
            {profile ? (
              <UserMenu nick={profile.mc_nickname} role={profile.role} />
            ) : (
              <Link href="/auth" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-600/30 transition-colors">
                <LogIn className="w-4 h-4" />
                Zaloguj się
              </Link>
            )}
          </div>
        </header>

        <SectionPage
          reports={reports}
          applications={applications}
          userNick={profile?.mc_nickname ?? null}
          userRole={profile?.role ?? null}
        />

        <footer className="border-t border-slate-800/60 mt-16 py-6 text-center text-slate-600 text-xs">
          Rada Budowniczych &amp; Posłów – Serwer Roleplay Minecraft
        </footer>
      </div>
    </div>
  );
}

