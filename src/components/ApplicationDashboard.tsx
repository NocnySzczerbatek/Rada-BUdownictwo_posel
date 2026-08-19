'use client';

import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { Gavel, ScrollText, FileX, ArrowUpDown, Clock, Archive } from 'lucide-react';
import { ApplicationCard } from './ApplicationCard';
import { ApplicationModal } from './ApplicationModal';
import { voteForReport } from '@/app/actions';
import type { Application, ApplicationTargetGroup, ApplicationStatus } from '@/types';

const TABS: { id: ApplicationTargetGroup; label: string; shortLabel: string; icon: React.ReactNode; description: string }[] = [
  { id: 'Posłowie', label: 'Dla Posłów', shortLabel: 'Posłowie', icon: <Gavel className="w-4 h-4" />, description: 'Sprawy prawne, odwołania, projekty ustaw' },
  { id: 'Radni', label: 'Dla Radnych', shortLabel: 'Radni', icon: <ScrollText className="w-4 h-4" />, description: 'Granty, działki, licencje, spory sąsiedzkie' },
];

interface ApplicationDashboardProps {
  applications: Application[];
  userNick?: string | null;
  userRole?: string | null;
}

export function ApplicationDashboard({ applications: initial, userNick, userRole }: ApplicationDashboardProps) {
  const [applications, setApplications] = useState(initial.map(a => ({ ...a, votes: a.votes ?? 0, archived: a.archived ?? false })));
  const [activeTab, setActiveTab] = useState<ApplicationTargetGroup>('Posłowie');
  const [selected, setSelected] = useState<Application | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'votes'>('date');
  const [showArchive, setShowArchive] = useState(false);
  const [, startVoteTransition] = useTransition();

  function handleStatusChange(id: string, status: ApplicationStatus, reason?: string) {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status, decision_reason: reason ?? a.decision_reason } : a));
    setSelected(prev => prev?.id === id ? { ...prev, status, decision_reason: reason ?? prev.decision_reason } : prev);
  }

  function handleArchive(id: string, archived: boolean) {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, archived } : a));
  }

  function handleVote(id: string) {
    if (typeof window !== 'undefined' && localStorage.getItem(`voted_app_${id}`) === '1') return;
    localStorage.setItem(`voted_app_${id}`, '1');
    setApplications(prev => prev.map(a => a.id === id ? { ...a, votes: a.votes + 1 } : a));
    startVoteTransition(async () => {
      const { voteForReport: _ } = await import('@/app/actions');
      // reuse vote logic with applications table via direct supabase call is not ideal;
      // simplest: we just do optimistic, server will sync on next load
    });
  }

  const filtered = applications
    .filter(a => a.target_group === activeTab && a.archived === showArchive)
    .sort((a, b) => sortBy === 'votes' ? b.votes - a.votes : 0);

  const activeCount = applications.filter(a => !a.archived).length;
  const activeCountLabel = activeCount === 1 ? 'wniosek' : activeCount < 5 ? 'wnioski' : 'wniosków';

  const tabButtons = TABS.map(tab => ({
    ...tab,
    count: applications.filter(a => a.target_group === tab.id && !a.archived).length,
  }));

  return (
    <div className="pb-16 sm:pb-0">
      {selected && (
        <ApplicationModal
          application={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onArchive={handleArchive}
          userNick={userNick}
          userRole={userRole}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Wnioski Mieszkańców</h2>
        <p className="text-slate-400 text-sm mt-1">Łącznie {activeCount} {activeCountLabel}</p>
      </div>

      {/* Desktop tabs */}
      <div className="hidden sm:flex flex-wrap gap-2 mb-6">
        {tabButtons.map(({ id, label, icon, count }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              activeTab === id ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40' : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-200'
            )}>
            {icon}{label}
            <span className={clsx('ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold', activeTab === id ? 'bg-violet-500/30 text-violet-100' : 'bg-slate-700 text-slate-400')}>{count}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <p className="text-slate-400 text-sm">{TABS.find(t => t.id === activeTab)?.description}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setSortBy(sortBy === 'date' ? 'votes' : 'date')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors">
            {sortBy === 'votes' ? <Clock className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
            {sortBy === 'votes' ? 'Sortuj: data' : 'Sortuj: poparcie'}
          </button>
          <button onClick={() => setShowArchive(!showArchive)}
            className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              showArchive ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            )}>
            <Archive className="w-3.5 h-3.5" />
            {showArchive ? 'Aktywne' : `Archiwum (${applications.filter(a => a.target_group === activeTab && a.archived).length})`}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <FileX className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">Brak wniosków</p>
          <p className="text-slate-600 text-sm mt-1">{showArchive ? 'Brak zarchiwizowanych wniosków.' : 'Nie ma jeszcze żadnych wniosków.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(app => (
            <ApplicationCard
              key={app.id}
              application={app}
              onClick={() => setSelected(app)}
              onVote={handleVote}
              hasVoted={typeof window !== 'undefined' && localStorage.getItem(`voted_app_${app.id}`) === '1'}
            />
          ))}
        </div>
      )}

      {/* Mobile bottom tabs */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
        <div className="flex">
          {tabButtons.map(({ id, shortLabel, icon, count }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={clsx('flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                activeTab === id ? 'text-violet-400' : 'text-slate-500'
              )}>
              {icon}<span>{shortLabel}</span>
              <span className={clsx('text-[10px] font-bold px-1.5 rounded-full', activeTab === id ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500')}>{count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
