'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Gavel, HardHat, ScrollText, FileX } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ReportModal } from './ReportModal';
import type { Report, TargetGroup, ReportStatus } from '@/types';

const TABS: { id: TargetGroup; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'Posłowie',
    label: 'Dla Posłów',
    icon: <Gavel className="w-4 h-4" />,
    description: 'Sprawy prawne i organizacja miasta',
  },
  {
    id: 'Budowniczy',
    label: 'Dla Budowniczych',
    icon: <HardHat className="w-4 h-4" />,
    description: 'Projekty budowlane i infrastruktura',
  },
  {
    id: 'Radni',
    label: 'Dla Radnych',
    icon: <ScrollText className="w-4 h-4" />,
    description: 'Sprawy bieżące i zarządzanie gruntami',
  },
];

interface DashboardProps {
  reports: Report[];
}

export function Dashboard({ reports: initialReports }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TargetGroup>('Posłowie');
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  function handleStatusChange(id: string, status: ReportStatus) {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelectedReport((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }

  const filtered = reports.filter((r) => r.target_group === activeTab);

  const activeTabData = TABS.find((t) => t.id === activeTab)!;

  return (
    <div>
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={handleStatusChange}
        />
      )}
      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((tab) => {
          const count = reports.filter((r) => r.target_group === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:bg-slate-700/60 hover:text-slate-200'
              )}
            >
              {tab.icon}
              {tab.label}
              <span
                className={clsx(
                  'ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold',
                  activeTab === tab.id ? 'bg-emerald-500/30 text-emerald-100' : 'bg-slate-700 text-slate-400'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section header */}
      <div className="mb-4">
        <p className="text-slate-400 text-sm">{activeTabData.description}</p>
      </div>

      {/* Report grid or empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <FileX className="w-7 h-7 text-slate-600" />
          </div>
          <p className="text-slate-400 font-medium">Brak zgłoszeń</p>
          <p className="text-slate-600 text-sm mt-1">Nie ma jeszcze żadnych zgłoszeń dla tej grupy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} onClick={() => setSelectedReport(report)} />
          ))}
        </div>
      )}
    </div>
  );
}
