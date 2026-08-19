'use client';

import { useState, useTransition } from 'react';
import { clsx } from 'clsx';
import { X, User, Calendar, Tag, AlertCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { updateReportStatus } from '@/app/actions';
import type { Report, ReportStatus } from '@/types';

const statusConfig: Record<ReportStatus, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  Nowe: {
    label: 'Nowe',
    icon: <AlertCircle className="w-4 h-4" />,
    badgeClass: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  'W trakcie realizacji': {
    label: 'W trakcie realizacji',
    icon: <Clock className="w-4 h-4" />,
    badgeClass: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  },
  Zakończone: {
    label: 'Zakończone',
    icon: <CheckCircle2 className="w-4 h-4" />,
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  },
};

const STATUS_BUTTONS: { status: ReportStatus; label: string; className: string }[] = [
  {
    status: 'Nowe',
    label: 'Oznacz jako Nowe',
    className: 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30',
  },
  {
    status: 'W trakcie realizacji',
    label: 'W trakcie realizacji',
    className: 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30',
  },
  {
    status: 'Zakończone',
    label: 'Zakończone',
    className: 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30',
  },
];

interface ReportModalProps {
  report: Report;
  onClose: () => void;
  onStatusChange: (id: string, status: ReportStatus) => void;
}

export function ReportModal({ report, onClose, onStatusChange }: ReportModalProps) {
  const [currentStatus, setCurrentStatus] = useState<ReportStatus>(report.status);
  const [isPending, startTransition] = useTransition();

  const status = statusConfig[currentStatus];

  const formattedDate = new Date(report.created_at).toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  function handleStatusChange(newStatus: ReportStatus) {
    startTransition(async () => {
      const res = await updateReportStatus(report.id, newStatus);
      if (!res?.error) {
        setCurrentStatus(newStatus);
        onStatusChange(report.id, newStatus);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={clsx(
          'relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border-2 transition-colors',
          currentStatus === 'Zakończone' && 'border-emerald-500/50',
          currentStatus === 'W trakcie realizacji' && 'border-amber-500/50',
          currentStatus === 'Nowe' && 'border-blue-500/50'
        )}
      >
        {/* Color accent top bar */}
        <div
          className={clsx(
            'h-1 rounded-t-2xl',
            currentStatus === 'Zakończone' && 'bg-emerald-500',
            currentStatus === 'W trakcie realizacji' && 'bg-amber-500',
            currentStatus === 'Nowe' && 'bg-blue-500'
          )}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-100 text-lg">{report.nick}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status + Type */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium', status.badgeClass)}>
              {status.icon}
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-700/60 text-slate-300 border border-slate-600/50">
              <Tag className="w-3.5 h-3.5" />
              {report.report_type}
            </span>
            <span className="text-xs text-slate-500 px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
              {report.target_group}
            </span>
          </div>

          {/* Content */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-5">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{report.content}</p>
          </div>

          {/* Status buttons */}
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Zmień status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_BUTTONS.map((btn) => (
                <button
                  key={btn.status}
                  onClick={() => handleStatusChange(btn.status)}
                  disabled={isPending || currentStatus === btn.status}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                    btn.className,
                    currentStatus === btn.status && 'ring-2 ring-offset-2 ring-offset-slate-900',
                    currentStatus === btn.status && btn.status === 'Nowe' && 'ring-blue-500/50',
                    currentStatus === btn.status && btn.status === 'W trakcie realizacji' && 'ring-amber-500/50',
                    currentStatus === btn.status && btn.status === 'Zakończone' && 'ring-emerald-500/50'
                  )}
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : statusConfig[btn.status].icon}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
