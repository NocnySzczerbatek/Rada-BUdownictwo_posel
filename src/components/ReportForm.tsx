'use client';

import { useRef, useState, useTransition } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createReport } from '@/app/actions';

const TARGET_GROUPS = ['Radni', 'Budowniczy', 'Posłowie'] as const;

const REPORT_TYPES: Record<string, string[]> = {
  Budowniczy: [
    'Budowa / Rozbudowa',
    'Renowacja terenu',
    'Prace ziemne',
    'Błąd infrastruktury',
    'Inne',
  ],
  Radni: [
    'Zarządzanie gruntami',
    'Wniosek o grant',
    'Skargi i spory',
    'Inicjatywa lokalna',
    'Kontrola lokalna',
    'Inne',
  ],
  Posłowie: [
    'Projekt ustawy',
    'Polityka gospodarcza',
    'Inwestycje państwowe',
    'Sprawa administracyjna',
    'Inne',
  ],
};

export function ReportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  function handleGroupChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedGroup(e.target.value);
  }

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setResult(null);
      const res = await createReport(formData);
      if (res?.error) {
        setResult({ type: 'error', message: res.error });
      } else {
        setResult({ type: 'success', message: 'Zgłoszenie zostało wysłane pomyślnie!' });
        formRef.current?.reset();
        setSelectedGroup(null);
      }
    });
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-slate-100 mb-5">Nowe zgłoszenie</h2>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        {/* Nick */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Nick z gry</label>
          <input
            name="nick"
            type="text"
            required
            placeholder="NocnySzczerbatek"
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors"
          />
        </div>

        {/* Target Group */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Grupa docelowa</label>
          <select
            name="target_group"
            required
            value={selectedGroup ?? ''}
            onChange={handleGroupChange}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled className="bg-slate-800 text-slate-500">Wybierz grupę...</option>
            {TARGET_GROUPS.map((g) => (
              <option key={g} value={g} className="bg-slate-800">
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Typ zgłoszenia</label>
          <select
            name="report_type"
            required
            disabled={!selectedGroup}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {!selectedGroup ? (
              <option value="" className="bg-slate-800 text-slate-500">Najpierw wybierz grupę docelową</option>
            ) : (
              REPORT_TYPES[selectedGroup]?.map((t) => (
                <option key={t} value={t} className="bg-slate-800">
                  {t}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Treść zgłoszenia</label>
          <textarea
            name="content"
            required
            rows={5}
            placeholder="Opisz szczegółowo co chcesz zmienić, zbudować lub naprawić..."
            className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-colors resize-none"
          />
        </div>

        {/* Feedback */}
        {result && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              result.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {result.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {result.message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {isPending ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
        </button>
      </form>
    </div>
  );
}
