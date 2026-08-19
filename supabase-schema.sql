-- Supabase SQL schema – uruchom to w SQL Editor swojego projektu Supabase

CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nick VARCHAR(50) NOT NULL,
  target_group VARCHAR(20) NOT NULL CHECK (target_group IN ('Radni', 'Budowniczowie', 'Posłowie')),
  report_type VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'Nowe' CHECK (status IN ('Nowe', 'W trakcie realizacji', 'Zakończone')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Włącz Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Polityka: każdy może czytać raporty
CREATE POLICY "Raporty są publiczne do odczytu"
  ON reports FOR SELECT
  USING (true);

-- Polityka: każdy może dodać raport
CREATE POLICY "Każdy może dodać raport"
  ON reports FOR INSERT
  WITH CHECK (true);

-- Polityka: każdy może zaktualizować status (opcjonalnie zabezpiecz to w produkcji)
CREATE POLICY "Każdy może aktualizować status"
  ON reports FOR UPDATE
  USING (true);

-- Indeks dla szybkiego filtrowania po grupie i dacie
CREATE INDEX IF NOT EXISTS idx_reports_target_group ON reports (target_group);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at DESC);
