import { clsx } from 'clsx';
import { User, Calendar, Tag, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import type { Report, ReportStatus } from '@/types';

const statusConfig: Record<ReportStatus, { label: string; icon: React.ReactNode; className: string }> = {
  Nowe: {
    label: 'Nowe',
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  'W trakcie realizacji': {
    label: 'W trakcie',
    icon: <Clock className="w-3.5 h-3.5" />,
    className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  },
  Zakończone: {
    label: 'Zakończone',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    className: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  },
};

const borderByStatus: Record<ReportStatus, string> = {
  Nowe: 'border-l-blue-500/70',
  'W trakcie realizacji': 'border-l-amber-500/70',
  Zakończone: 'border-l-emerald-500/70',
};

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  const status = statusConfig[report.status] ?? statusConfig['Nowe'];
  const borderColor = borderByStatus[report.status] ?? borderByStatus['Nowe'];

  const formattedDate = new Date(report.created_at).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative w-full text-left bg-slate-800/60 border border-slate-700/50 border-l-4 rounded-xl p-5',
        'hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-200 hover:shadow-lg hover:shadow-black/20',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500/40',
        borderColor
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-100 text-sm truncate">{report.nick}</p>
            <div className="flex items-center gap-1 text-slate-500 text-xs">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0', status.className)}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Type tag */}
      <div className="flex items-center gap-1.5 mb-3">
        <Tag className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-xs font-medium text-slate-400">{report.report_type}</span>
      </div>

      {/* Content */}
      <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">{report.content}</p>
    </button>
  );
}
