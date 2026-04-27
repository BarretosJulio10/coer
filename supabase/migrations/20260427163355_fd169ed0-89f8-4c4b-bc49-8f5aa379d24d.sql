-- Tabela de comitês (catálogo público)
CREATE TABLE public.committees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  reports_to TEXT NOT NULL,
  vacancies TEXT NOT NULL,
  dedication TEXT NOT NULL,
  why_exists TEXT NOT NULL,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comitês são públicos" ON public.committees
  FOR SELECT USING (true);

-- Status enum
CREATE TYPE public.application_status AS ENUM ('pendente', 'em_analise', 'aprovado', 'rejeitado');

-- Tabela de candidaturas
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  experience TEXT NOT NULL,
  hours_per_week TEXT NOT NULL,
  prior_participation BOOLEAN NOT NULL DEFAULT false,
  prior_participation_details TEXT,
  motivation TEXT,
  status public.application_status NOT NULL DEFAULT 'pendente',
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (formulário público)
CREATE POLICY "Qualquer um pode enviar candidatura" ON public.applications
  FOR INSERT WITH CHECK (true);

-- Sem SELECT/UPDATE/DELETE no cliente — apenas via edge functions com service role

-- Tabela N:N candidatura ↔ comitês
CREATE TABLE public.application_committees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  committee_id UUID NOT NULL REFERENCES public.committees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(application_id, committee_id)
);

ALTER TABLE public.application_committees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode vincular candidatura a comitês" ON public.application_committees
  FOR INSERT WITH CHECK (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_applications_status ON public.applications(status);
CREATE INDEX idx_applications_created ON public.applications(created_at DESC);
CREATE INDEX idx_app_committees_app ON public.application_committees(application_id);
CREATE INDEX idx_app_committees_committee ON public.application_committees(committee_id);