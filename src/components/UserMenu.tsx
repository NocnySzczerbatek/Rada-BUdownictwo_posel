'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase-browser';
import { LogOut } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  gracz: 'Gracz',
  budowniczy: 'Budowniczy',
  radny: 'Radny',
  posel: 'Poseł',
};

const ROLE_COLORS: Record<string, string> = {
  gracz: 'text-slate-400 bg-slate-700/50',
  budowniczy: 'text-emerald-400 bg-emerald-500/10',
  radny: 'text-sky-400 bg-sky-500/10',
  posel: 'text-violet-400 bg-violet-500/10',
};

interface UserMenuProps {
  nick: string;
  role: string;
}

export function UserMenu({ nick, role }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleLogout() {
    startTransition(async () => {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar + nick */}
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://mc-heads.net/avatar/${nick}/32`}
          alt={nick}
          className="w-8 h-8 rounded-full border border-slate-600"
        />
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-100 leading-none">{nick}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLORS[role] ?? ROLE_COLORS.gracz}`}>
            {ROLE_LABELS[role] ?? role}
          </span>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={isPending}
        title="Wyloguj"
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
