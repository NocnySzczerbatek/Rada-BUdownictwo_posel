export type TargetGroup = 'Radni' | 'Budowniczy' | 'Posłowie';
export type ReportStatus = 'Nowe' | 'W trakcie realizacji' | 'Zakończone';
export type ApplicationStatus = 'Oczekuje' | 'Zatwierdzony' | 'Odrzucony';
export type ApplicationTargetGroup = 'Radni' | 'Posłowie';

export interface Report {
  id: string;
  nick: string;
  target_group: TargetGroup;
  report_type: string;
  content: string;
  status: ReportStatus;
  coordinates: string | null;
  votes: number;
  archived: boolean;
  progress: number;
  created_at: string;
}

export interface Application {
  id: string;
  nick: string;
  target_group: ApplicationTargetGroup;
  application_type: string;
  content: string;
  status: ApplicationStatus;
  decision_reason: string | null;
  votes: number;
  archived: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  report_id: string;
  nick: string;
  content: string;
  created_at: string;
}
