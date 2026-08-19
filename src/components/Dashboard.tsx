'use client';

import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { Gavel, HardHat, ScrollText, FileX, ArrowUpDown, Clock, Archive } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ReportModal } from './ReportModal';
import { voteForReport } from '@/app/actions';
import type { Report, TargetGroup, ReportStatus } from '@/types';

const TABS: { id: TargetGroup; label: string; shortLabel: string; icon: React.ReactNode; description: string }[] = [
  { id: 'Posłowie', label: 'Dla Posłów', shortLabel: 'Posłowie', icon: <Gavel className="w-4 h-4" />, description: 'Sprawy prawne i organizacja miasta' },
  { id: 'Budowniczy', label: 'Dla Budowniczych', shortLabel: 'Budowniczy', icon: <HardHat className="w-4 h-4" />, description: 'Projekty budowlane i infrastruktura' },
  { id: 'Radni', label: 'Dla Radnych', shortLabel: 'Radni', icon: <ScrollText className="w-4 h-4" />, description: 'Sprawy bieżące i zarządzanie gruntami' },
];

interface DashboardProps {
  reports: Report[];
}

export function Dashboard({ reports: initialReports }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TargetGroup>('Posłowie');
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'votes'>('date');
  const [showArchive, setShowArchive] = useState(false);
  const [, startVoteTransition] = useTransition();

  function handleStatusChange(id: string, status: ReportStatus) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelectedReport((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }

  function handleVote(id: string) {
    // Optimistic update
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, votes: r.votes + 1 } : r)));
    startVoteTransition(async () => {
      await voteForReport(id);
    });
  }

  function handleArchive(id: string, archived: boolean) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, archived } : r)));
  }

  const filtered = reports
    .filter((r) => r.target_group === activeTab && r.archived === showArchive)
    .sort((a, b) => sortBy === 'votes' ? b.votes - a.votes : 0);

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  const tabButtons = TABS.map((tab) => {
    const count = reports.filter((r) => r.target_group === tab.id).length;
    return { ...tab, count };
  });

  return (
    <div className="pb-16 sm:pb-0">
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={handleStatusChange}
          onArchive={handleArchive}
        />
      )}

      {/* Desktop tab navigation */}
      <div className="hidden sm:flex flex-wrap gap-2 mb-6">
        {tabButtons.map(({ id, label, icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              activeTab === id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-200'
            )}
          >
            {icon}
            {label}
            <span className={clsx('ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold',
              activeTab === id ? 'bg-emerald-500/30 text-emerald-100' : 'bg-slate-700 text-slate-400'
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Section header + sort + archive toggle */}
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <p className="text-slate-400 text-sm">{activeTabData.description}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortBy(sortBy === 'date' ? 'votes' : 'date')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
          >
            {sortBy === 'votes' ? <Clock className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
            {sortBy === 'votes' ? 'Sortuj: data' : 'Sortuj: poparcie'}
          </button>
          <button
            onClick={() => setShowArchive(!showArchive)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
              showArchive
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            )}
          >
            <Archive className="w-3.5 h-3.5" />
            {showArchive ? 'Aktywne' : `Archiwum (${reports.filter(r => r.target_group === activeTab && r.archived).length})`}
          </button>
        </div>
      </div>

      {/* Report grid or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <FileX className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">Brak zgłoszeń</p>
          <p className="text-slate-600 text-sm mt-1">
            {showArchive ? 'Brak zarchiwizowanych zgłoszeń.' : 'Nie ma jeszcze żadnych zgłoszeń dla tej grupy.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onClick={() => setSelectedReport(report)}
              onVote={handleVote}
            />
          ))}
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800">
        <div className="flex">
          {tabButtons.map(({ id, shortLabel, icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors',
                activeTab === id ? 'text-emerald-400' : 'text-slate-500'
              )}
            >
              {icon}
              <span>{shortLabel}</span>
              <span className={clsx(
                'text-[10px] font-bold px-1.5 rounded-full',
                activeTab === id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
              )}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
