'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { X, Clock, CheckCircle2, XCircle, Loader2, MessageSquare, Send, Archive, ArchiveRestore } from 'lucide-react';
import { updateApplicationStatus, archiveApplication, addComment, getComments } from '@/app/actions';
import type { Application, ApplicationStatus, Comment } from '@/types';

const STATUS_BUTTONS: {
  status: ApplicationStatus;
  label: string;
  className: string;
  activeRing: string;
}[] = [
  {
    status: 'Oczekuje',
    label: 'Oczekuje na rozpatrzenie',
    className: 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30',
    activeRing: 'ring-amber-500/50',
  },
  {
    status: 'Zatwierdzony',
    label: 'Zatwierdź',
    className: 'bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30',
    activeRing: 'ring-emerald-500/50',
  },
  {
    status: 'Odrzucony',
    label: 'Odrzuć',
    className: 'bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30',
    activeRing: 'ring-red-500/50',
  },
];

const borderByStatus: Record<ApplicationStatus, string> = {
  Oczekuje: 'border-amber-500/50',
  Zatwierdzony: 'border-emerald-500/50',
  Odrzucony: 'border-red-500/50',
};

const barByStatus: Record<ApplicationStatus, string> = {
  Oczekuje: 'bg-amber-500',
  Zatwierdzony: 'bg-emerald-500',
  Odrzucony: 'bg-red-500',
};

interface ApplicationModalProps {
  application: Application;
  onClose: () => void;
  onStatusChange: (id: string, status: ApplicationStatus, reason?: string) => void;
  onArchive: (id: string, archived: boolean) => void;
  userNick?: string | null;
  userRole?: string | null;
}

const DECISION_ROLES = ['radny', 'posel'];

export function ApplicationModal({
  application, onClose, onStatusChange, onArchive, userNick, userRole,
}: ApplicationModalProps) {
  const [currentStatus, setCurrentStatus] = useState<ApplicationStatus>(application.status);
  const [isArchived, setIsArchived] = useState(application.archived);
  const [decisionReason, setDecisionReason] = useState(application.decision_reason ?? '');
  const [isPending, startTransition] = useTransition();
  const [isArchiving, startArchiveTransition] = useTransition();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentNick, setCommentNick] = useState(userNick ?? '');
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState('');
  const [isSubmittingComment, startCommentTransition] = useTransition();
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const isAuthor = !!userNick && userNick.toLowerCase() === application.nick.toLowerCase();
  const canDecide = !!userRole && DECISION_ROLES.includes(userRole.toLowerCase());

  useEffect(() => {
    getComments(application.id).then((data) => {
      setComments(data as Comment[]);
      setLoadingComments(false);
    });
  }, [application.id]);

  function handleStatusChange(newStatus: ApplicationStatus) {
    startTransition(async () => {
      const res = await updateApplicationStatus(application.id, newStatus, decisionReason || undefined);
      if (!res?.error) {
        setCurrentStatus(newStatus);
        onStatusChange(application.id, newStatus, decisionReason || undefined);
      }
    });
  }

  function handleArchive() {
    startArchiveTransition(async () => {
      const newArchived = !isArchived;
      const res = await archiveApplication(application.id, newArchived);
      if (!res?.error) {
        setIsArchived(newArchived);
        onArchive(application.id, newArchived);
        if (newArchived) onClose();
      }
    });
  }

  function handleAddComment() {
    if (!commentNick.trim() || !commentContent.trim()) return;
    setCommentError('');
    const optimistic: Comment = {
      id: crypto.randomUUID(),
      report_id: application.id,
      nick: commentNick.trim(),
      content: commentContent.trim(),
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    const nick = commentNick;
    const content = commentContent;
    setCommentContent('');
    startCommentTransition(async () => {
      const res = await addComment(application.id, nick, content);
      if (res?.error) {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
        setCommentError(res.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx(
        'relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl border-2 transition-colors max-h-[90dvh] flex flex-col',
        borderByStatus[currentStatus]
      )}>
        <div className={clsx('h-1 rounded-t-2xl', barByStatus[currentStatus])} />

        <div className="p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs text-violet-400 font-medium mb-1">{application.application_type}</p>
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://mc-heads.net/avatar/${application.nick}/28`} alt="" className="w-7 h-7 rounded-full bg-slate-700" />
                <span className="font-bold text-slate-100">{application.nick}</span>
                <span className="text-slate-500 text-xs">→ {application.target_group}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAuthor && (
                <button
                  onClick={handleArchive}
                  disabled={isArchiving}
                  title={isArchived ? 'Przywróć' : 'Archiwizuj'}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    isArchived ? 'text-amber-400 hover:bg-amber-500/20' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                  )}
                >
                  {isArchiving ? <Loader2 className="w-4 h-4 animate-spin" /> : isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                </button>
              )}
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-5">
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{application.content}</p>
          </div>

          {/* Decision by officials */}
          {canDecide && (
            <div className="mb-5">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Decyzja urzędnika</p>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="Powód decyzji (opcjonalnie)..."
                rows={2}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors resize-none mb-3"
              />
              <div className="flex flex-wrap gap-2">
                {STATUS_BUTTONS.map((btn) => (
                  <button
                    key={btn.status}
                    onClick={() => handleStatusChange(btn.status)}
                    disabled={isPending || currentStatus === btn.status}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                      btn.className,
                      currentStatus === btn.status && `ring-2 ring-offset-2 ring-offset-slate-900 ${btn.activeRing}`
                    )}
                  >
                    {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                      btn.status === 'Oczekuje' ? <Clock className="w-3.5 h-3.5" /> :
                      btn.status === 'Zatwierdzony' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                      <XCircle className="w-3.5 h-3.5" />}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Decision reason display (read-only) */}
          {!canDecide && application.decision_reason && (
            <div className="mb-5 text-xs bg-slate-800/60 border border-slate-700/30 rounded-xl p-3">
              <p className="text-slate-400 font-medium mb-1">Powód decyzji urzędnika:</p>
              <p className="text-slate-300">{application.decision_reason}</p>
            </div>
          )}

          {/* Comments */}
          <div className="mt-2 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Komentarze ({comments.length})</p>
            </div>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 mb-4">
              {loadingComments ? (
                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-slate-500" /></div>
              ) : comments.length === 0 ? (
                <p className="text-slate-600 text-xs text-center py-3">Brak komentarzy.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://mc-heads.net/avatar/${c.nick}/24`} alt="" className="w-6 h-6 rounded-full bg-slate-700 shrink-0 mt-0.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-semibold text-slate-300">{c.nick}</span>
                        <span className="text-[10px] text-slate-600">{new Date(c.created_at).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed mt-0.5">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={commentsEndRef} />
            </div>
            <div className="space-y-2">
              <input type="text" value={commentNick} onChange={(e) => !userNick && setCommentNick(e.target.value)} readOnly={!!userNick} placeholder="Nick" maxLength={50} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors" />
              <div className="flex gap-2">
                <textarea value={commentContent} onChange={(e) => setCommentContent(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAddComment(); }} placeholder="Komentarz... (Ctrl+Enter)" rows={2} maxLength={500} className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-colors resize-none" />
                <button onClick={handleAddComment} disabled={isSubmittingComment || !commentNick.trim() || !commentContent.trim()} className="px-3 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors shrink-0">
                  {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              {commentError && <p className="text-red-400 text-xs">{commentError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
