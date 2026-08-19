'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { X, User, Calendar, Tag, AlertCircle, Clock, CheckCircle2, Loader2, MessageSquare, Send, Archive, ArchiveRestore } from 'lucide-react';
import { updateReportStatus, addComment, getComments, archiveReport, unarchiveReport } from '@/app/actions';
import type { Report, ReportStatus, Comment } from '@/types';

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
  onArchive: (id: string, archived: boolean) => void;
  userNick?: string | null;
}

export function ReportModal({ report, onClose, onStatusChange, onArchive, userNick }: ReportModalProps) {
  const [currentStatus, setCurrentStatus] = useState<ReportStatus>(report.status);
  const [isArchived, setIsArchived] = useState(report.archived);
  const isAuthor = !!userNick && userNick.toLowerCase() === report.nick.toLowerCase();
  const [isPending, startTransition] = useTransition();
  const [isArchiving, startArchiveTransition] = useTransition();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentNick, setCommentNick] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isSubmittingComment, startCommentTransition] = useTransition();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getComments(report.id).then((data) => {
      setComments(data as Comment[]);
      setLoadingComments(false);
    });
  }, [report.id]);

  useEffect(() => {
    if (!loadingComments) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length, loadingComments]);

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

  function handleArchive() {
    startArchiveTransition(async () => {
      const newArchived = !isArchived;
      const res = newArchived
        ? await archiveReport(report.id)
        : await unarchiveReport(report.id);
      if (!res?.error) {
        setIsArchived(newArchived);
        onArchive(report.id, newArchived);
        if (newArchived) onClose();
      }
    });
  }

  function handleAddComment() {
    if (!commentNick.trim() || !commentContent.trim()) return;
    setCommentError('');
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      report_id: report.id,
      nick: commentNick.trim(),
      content: commentContent.trim(),
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    const nick = commentNick;
    const content = commentContent;
    setCommentContent('');
    startCommentTransition(async () => {
      const res = await addComment(report.id, nick, content);
      if (res?.error) {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        setCommentError(res.error);
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
          'relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border-2 transition-colors max-h-[90dvh] flex flex-col',
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

        <div className="p-6 overflow-y-auto">
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
            <div className="flex items-center gap-1">
              {isAuthor && (
                <button
                  onClick={handleArchive}
                  disabled={isArchiving}
                  title={isArchived ? 'Przywróć z archiwum' : 'Przenieś do archiwum'}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    isArchived
                      ? 'text-amber-400 hover:bg-amber-500/20'
                      : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                  )}
                >
                  {isArchiving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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

          {/* Comments */}
          <div className="mt-5 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Komentarze ({comments.length})
              </p>
            </div>

            {/* Comment list */}
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1 mb-4">
              {loadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                </div>
              ) : comments.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-4">Brak komentarzy. Bądź pierwszy!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://mc-heads.net/avatar/${c.nick}/24`}
                      alt=""
                      className="w-6 h-6 rounded-full bg-slate-700 shrink-0 mt-0.5"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-slate-300">{c.nick}</span>
                        <span className="text-[10px] text-slate-600">
                          {new Date(c.created_at).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Add comment form */}
            <div className="space-y-2">
              <input
                type="text"
                value={commentNick}
                onChange={(e) => setCommentNick(e.target.value)}
                placeholder="Twój nick"
                maxLength={50}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
              />
              <div className="flex gap-2">
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment();
                  }}
                  placeholder="Napisz komentarz... (Ctrl+Enter aby wysłać)"
                  rows={2}
                  maxLength={500}
                  className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors resize-none"
                />
                <button
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !commentNick.trim() || !commentContent.trim()}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors shrink-0"
                >
                  {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              {commentError && (
                <p className="text-red-400 text-xs">{commentError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
