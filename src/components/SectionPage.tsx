'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { FileText, BarChart3 } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { ApplicationDashboard } from './ApplicationDashboard';
import { ReportForm } from './ReportForm';
import { ApplicationForm } from './ApplicationForm';
import { MobileFormDrawer } from './MobileFormDrawer';
import type { Report, Application } from '@/types';

type Section = 'reports' | 'applications';

interface SectionPageProps {
  reports: Report[];
  applications: Application[];
  userNick?: string | null;
  userRole?: string | null;
}

export function SectionPage({ reports, applications, userNick, userRole }: SectionPageProps) {
  const [section, setSection] = useState<Section>('reports');

  return (
    <>
      {/* Section switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="inline-flex bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 gap-1">
          <button
            onClick={() => setSection('reports')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              section === 'reports'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Raporty i Zgłoszenia</span>
          </button>
          <button
            onClick={() => setSection('applications')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              section === 'applications'
                ? 'bg-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Wnioski Mieszkańców</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {section === 'reports' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            <section>
              <Dashboard reports={reports} userNick={userNick} />
            </section>
            <aside className="hidden lg:block lg:sticky lg:top-24">
              <ReportForm userNick={userNick} />
            </aside>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
            <section>
              <ApplicationDashboard applications={applications} userNick={userNick} userRole={userRole} />
            </section>
            <aside className="hidden lg:block lg:sticky lg:top-24">
              <ApplicationForm userNick={userNick} />
            </aside>
          </div>
        )}
      </main>

      {/* Mobile FAB + drawer */}
      <MobileFormDrawer
        userNick={userNick}
        section={section}
      />
    </>
  );
}
