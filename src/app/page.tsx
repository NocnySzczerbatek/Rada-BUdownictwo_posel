import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Dashboard } from '@/components/Dashboard';
import { ReportForm } from '@/components/ReportForm';
import type { Report } from '@/types';
import { Sword, Shield, AlertTriangle } from 'lucide-react';

async function getReports(): Promise<Report[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
  return (data as Report[]) ?? [];
}

export default async function Home() {
  const reports = await getReports();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* Supabase setup warning */}
        {!isSupabaseConfigured && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center gap-2 text-amber-400 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Brak konfiguracji Supabase – uzupełnij <code className="font-mono bg-amber-500/10 px-1 rounded">.env.local</code> kluczami z dashboardu Supabase, aby włączyć bazę danych.</span>
            </div>
          </div>
        )}
        {/* Header */}
        <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600/20 border border-emerald-600/30 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 leading-none">Rada Budowniczych</h1>
                <p className="text-xs text-slate-500 mt-0.5">Panel Zgłoszeń – Roleplay</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Sword className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Zalesie RP</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Dashboard (left) */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Katalog Zgłoszeń</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Łącznie {reports.length} {reports.length === 1 ? 'zgłoszenie' : reports.length < 5 ? 'zgłoszenia' : 'zgłoszeń'}
                </p>
              </div>
              <Dashboard reports={reports} />
            </section>

            {/* Form (right sidebar) */}
            <aside className="lg:sticky lg:top-24">
              <ReportForm />
            </aside>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/60 mt-16 py-6 text-center text-slate-600 text-xs">
          Rada Budowniczych &amp; Posłów – Serwer Roleplay Minecraft
        </footer>
      </div>
    </div>
  );
}
