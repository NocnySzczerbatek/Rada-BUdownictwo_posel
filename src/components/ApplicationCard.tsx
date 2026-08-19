'use client';

import { clsx } from 'clsx';
import { User, Calendar, Clock, CheckCircle2, XCircle, ThumbsUp } from 'lucide-react';
import type { Application, ApplicationStatus } from '@/types';

const statusConfig: Record<ApplicationStatus, { label: string; icon: React.ReactNode; badge: string; border: string }> = {
  Oczekuje: {
    label: 'Oczekuje',
    icon: <Clock className="w-3.5 h-3.5" />,
    badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    border: 'border-l-amber-500/70',
  },
  Zatwierdzony: {
    label: 'Zatwierdzony',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    badge: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    border: 'border-l-emerald-500/70',
  },
  Odrzucony: {
    label: 'Odrzucony',
    icon: <XCircle className="w-3.5 h-3.5" />,
    badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
    border: 'border-l-red-500/70',
  },
};

interface ApplicationCardProps {
  application: Application;
  onClick: () => void;
  onVote: (id: string) => void;
  hasVoted: boolean;
}

export function ApplicationCard({ application, onClick, onVote, hasVoted }: ApplicationCardProps) {
  const status = statusConfig[application.status];

  const formattedDate = new Date(application.created_at).toLocaleDateString('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  function handleVote(e: React.MouseEvent) {
    e.stopPropagation();
    if (hasVoted) return;
    onVote(application.id);
  }

  return (
    <button
      onClick={onClick}
      className={clsx(
        'group w-full text-left bg-slate-800/60 border border-slate-700/50 border-l-4 rounded-xl p-5',
        'hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/40',
        status.border
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://mc-heads.net/avatar/${application.nick}/32`}
            alt=""
            className="w-8 h-8 rounded-full bg-slate-700 shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-100 text-sm truncate">{application.nick}</p>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0', status.badge)}>
          {status.icon}
          {status.label}
        </span>
      </div>

      <p className="text-xs font-medium text-violet-400 mb-2">{application.application_type}</p>
      <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 mb-3">{application.content}</p>

      {application.decision_reason && (
        <div className="text-xs text-slate-500 bg-slate-900/40 border border-slate-700/30 rounded-lg px-3 py-2 mb-3">
          <span className="font-medium text-slate-400">Powód decyzji:</span> {application.decision_reason}
        </div>
      )}

      <div className="pt-2 border-t border-slate-700/40">
        <button
          onClick={handleVote}
          disabled={hasVoted}
          className={clsx(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
            hasVoted
              ? 'bg-violet-600/20 text-violet-400 border-violet-500/30 cursor-default'
              : 'bg-slate-700/50 hover:bg-violet-600/20 hover:text-violet-400 text-slate-400 border-slate-700/50 hover:border-violet-500/30'
          )}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Popieram</span>
          <span className="font-bold">{application.votes}</span>
        </button>
      </div>
    </button>
  );
}
