'use client';

import { useState, useTransition } from 'react';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Loader2, LogIn, UserPlus, Eye, EyeOff, Shield } from 'lucide-react';

type Mode = 'login' | 'register';

export function AuthForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [nick, setNick] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function mcEmail(n: string) {
    return `${n.toLowerCase().replace(/[^a-z0-9_]/g, '')}@mc.local`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nick.trim() || !password) return;
    setError('');

    startTransition(async () => {
      const supabase = createBrowserSupabase();

      if (mode === 'register') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: mcEmail(nick),
          password,
          options: { data: { mc_nickname: nick.trim() } },
        });
        if (signUpError) {
          setError(signUpError.message === 'User already registered'
            ? 'Ten nick jest już zajęty.'
            : signUpError.message);
          return;
        }
        router.refresh();
        router.push('/');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: mcEmail(nick),
          password,
        });
        if (signInError) {
          setError('Nieprawidłowy nick lub hasło.');
          return;
        }
        router.refresh();
        router.push('/');
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-600/20 border border-emerald-600/30 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Rada Budowniczych</h1>
            <p className="text-xs text-slate-500">Panel Zgłoszeń – Roleplay</p>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
          {/* Mode toggle */}
          <div className="flex gap-1 mb-6 bg-slate-900/60 rounded-lg p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Zaloguj się
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'register'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Zarejestruj się
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nick preview */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Nick z gry (Minecraft)
              </label>
              <div className="flex items-center gap-3">
                {nick.trim() && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://mc-heads.net/avatar/${nick.trim()}/40`}
                    alt=""
                    className="w-10 h-10 rounded-lg border border-slate-600 shrink-0"
                  />
                )}
                <input
                  type="text"
                  required
                  value={nick}
                  onChange={(e) => setNick(e.target.value)}
                  placeholder="NocnySzczerbatek"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Hasło</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 znaków"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2.5 pr-10 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'login' ? (
                <LogIn className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isPending ? 'Ładowanie...' : mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-slate-600 text-xs mt-4">
              Nie masz konta?{' '}
              <button onClick={() => setMode('register')} className="text-emerald-500 hover:text-emerald-400">
                Zarejestruj się
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
