'use client';

import { useRef, useState, useTransition, useEffect } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, LogIn } from 'lucide-react';
import { createApplication } from '@/app/actions';
import Link from 'next/link';

const APPLICATION_TYPES: Record<string, string[]> = {
  Radni: [
    'Wniosek o przydział / Powiększenie działki',
    'Grant / Dotacja na rozwój hodowli',
    'Spór sąsiedzki / Granice terenu',
    'Pozwolenie na stoisko handlowe',
    'Licencja na hodowlę zwierząt',
    'Skarga na zaniedbane gospodarstwo',
    'Inne',
  ],
  Posłowie: [
    'Odwołanie od decyzji urzędowej',
    'Projekt ustawy / Zmiana prawa',
    'Regulacja podatków i opłat',
    'Ustalenie cen skupu produktów',
    'Wniosek o powołanie nowego urzędu',
    'Inne',
  ],
};

const TARGET_GROUPS = ['Radni', 'Posłowie'] as const;

interface ApplicationFormProps {
  onSuccess?: () => void;
  userNick?: string | null;
}

export function ApplicationForm({ onSuccess, userNick }: ApplicationFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [avatarNick, setAvatarNick] = useState(userNick ?? '');

  useEffect(() => {
    setAvatarNick(userNick ?? '');
  }, [userNick]);

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      setResult(null);
      const res = await createApplication(formData);
      if (res?.error) {
        setResult({ type: 'error', message: res.error });
      } else {
        setResult({ type: 'success', message: 'Wniosek został wysłany pomyślnie!' });
        formRef.current?.reset();
        setSelectedGroup(null);
        onSuccess?.();
      }
    });
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
      <h2 className="text-lg font-bold text-slate-100 mb-1">Nowy wniosek</h2>
      <p className="text-slate-500 text-xs mb-5">Sprawy urzędowe, granty, licencje, odwołania</p>

      {!userNick ? (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-700/60 flex items-center justify-center">
            <LogIn className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-slate-300 font-medium">Wymagane logowanie</p>
            <p className="text-slate-500 text-sm mt-1">Zaloguj się, aby złożyć wniosek</p>
          </div>
          <Link
            href="/auth"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Zaloguj się
          </Link>
        </div>
      ) : (
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {/* Nick (auto-filled, locked) */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nick z gry</label>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://mc-heads.net/avatar/${avatarNick}/40`} alt="" className="w-10 h-10 rounded-lg border border-slate-600 shrink-0" />
              <input
                name="nick"
                type="text"
                value={userNick}
                readOnly
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm opacity-70 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Target Group */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Skierowany do</label>
            <select
              name="target_group"
              required
              value={selectedGroup ?? ''}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="" disabled className="bg-slate-800 text-slate-500">Wybierz grupę...</option>
              {TARGET_GROUPS.map((g) => (
                <option key={g} value={g} className="bg-slate-800">{g}</option>
              ))}
            </select>
          </div>

          {/* Application Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Typ wniosku</label>
            <select
              name="application_type"
              required
              disabled={!selectedGroup}
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors appearance-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {!selectedGroup ? (
                <option value="">Najpierw wybierz grupę docelową</option>
              ) : (
                APPLICATION_TYPES[selectedGroup]?.map((t) => (
                  <option key={t} value={t} className="bg-slate-800">{t}</option>
                ))
              )}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Treść wniosku</label>
            <textarea
              name="content"
              required
              rows={5}
              placeholder="Opisz szczegółowo swój wniosek..."
              className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors resize-none"
            />
          </div>

          {result && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
              result.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {result.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {result.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {isPending ? 'Wysyłanie...' : 'Złóż wniosek'}
          </button>
        </form>
      )}
    </div>
  );
}
