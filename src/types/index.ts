export type TargetGroup = 'Radni' | 'Budowniczy' | 'Posłowie';
export type ReportStatus = 'Nowe' | 'W trakcie realizacji' | 'Zakończone';

export interface Report {
  id: string;
  nick: string;
  target_group: TargetGroup;
  report_type: string;
  content: string;
  status: ReportStatus;
  created_at: string;
}
