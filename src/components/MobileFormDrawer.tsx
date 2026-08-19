'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ReportForm } from './ReportForm';

interface MobileFormDrawerProps {
  userNick?: string | null;
}

export function MobileFormDrawer({ userNick }: MobileFormDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* FAB – visible only on mobile, above bottom tabs */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:hidden z-40 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-xl shadow-emerald-900/50 flex items-center justify-center transition-colors active:scale-95"
        aria-label="Nowe zgłoszenie"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Backdrop + bottom drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-2xl shadow-2xl max-h-[92dvh] overflow-y-auto">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-700 rounded-full" />
            </div>
            {/* Close button */}
            <div className="flex items-center justify-between px-5 py-2">
              <span className="text-slate-400 text-sm">Nowe zgłoszenie</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-4 pb-8">
              <ReportForm onSuccess={() => setIsOpen(false)} userNick={userNick} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
