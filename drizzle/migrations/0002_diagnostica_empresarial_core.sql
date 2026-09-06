-- =====================================================================
-- APAS DIAGNÓSTICA — módulo Diagnóstico Empresarial (aditivo; DISC preservado)
-- =====================================================================

-- Instrumentos configuráveis (versões, escala e configuração do motor)
CREATE TABLE public.diag_instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'V3',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','archived')),
  description TEXT,
  scale JSONB NOT NULL DEFAULT '[]'::jsonb,
  engine_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (code, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_instruments TO authenticated;
GRANT ALL ON public.diag_instruments TO service_role;
ALTER TABLE public.diag_instruments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_instruments_select_auth" ON public.diag_instruments FOR SELECT TO authenticated USING (true);
CREATE POLICY "diag_instruments_insert_auth" ON public.diag_instruments FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "diag_instruments_update_auth" ON public.diag_instruments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "diag_instruments_delete_owner" ON public.diag_instruments FOR DELETE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- Dimensões (com pesos por eixo configuráveis)
CREATE TABLE public.diag_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES public.diag_instruments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  axis_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instrument_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_dimensions TO authenticated;
GRANT ALL ON public.diag_dimensions TO service_role;
ALTER TABLE public.diag_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_dimensions_select_auth" ON public.diag_dimensions FOR SELECT TO authenticated USING (true);
CREATE POLICY "diag_dimensions_write_auth" ON public.diag_dimensions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'));

-- Perguntas (peso 1/2/3, direção direta/inversa, N/A permitido)
CREATE TABLE public.diag_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES public.diag_instruments(id) ON DELETE CASCADE,
  dimension_id UUID NOT NULL REFERENCES public.diag_dimensions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  text TEXT NOT NULL,
  weight SMALLINT NOT NULL DEFAULT 2 CHECK (weight BETWEEN 1 AND 3),
  direction TEXT NOT NULL DEFAULT 'direct' CHECK (direction IN ('direct','inverse')),
  allow_na BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instrument_id, code)
);
CREATE INDEX diag_questions_dimension_idx ON public.diag_questions(dimension_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_questions TO authenticated;
GRANT ALL ON public.diag_questions TO service_role;
ALTER TABLE public.diag_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_questions_select_auth" ON public.diag_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "diag_questions_write_auth" ON public.diag_questions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'));

-- Perfis de estágio (referência conceitual de ciclo de vida; eixos configuráveis)
CREATE TABLE public.diag_stage_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES public.diag_instruments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  short_label TEXT,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  axes JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  auto_release_allowed BOOLEAN NOT NULL DEFAULT true,
  narrative JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instrument_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_stage_profiles TO authenticated;
GRANT ALL ON public.diag_stage_profiles TO service_role;
ALTER TABLE public.diag_stage_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_stages_select_auth" ON public.diag_stage_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "diag_stages_write_auth" ON public.diag_stage_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'));

-- Padrões organizacionais e indicadores críticos (regras configuráveis)
CREATE TABLE public.diag_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_id UUID NOT NULL REFERENCES public.diag_instruments(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'pattern' CHECK (kind IN ('pattern','critical')),
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'media' CHECK (severity IN ('baixa','media','alta','critica')),
  rule JSONB NOT NULL DEFAULT '{}'::jsonb,
  stage_affinity JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (instrument_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_patterns TO authenticated;
GRANT ALL ON public.diag_patterns TO service_role;
ALTER TABLE public.diag_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_patterns_select_auth" ON public.diag_patterns FOR SELECT TO authenticated USING (true);
CREATE POLICY "diag_patterns_write_auth" ON public.diag_patterns FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'coach') OR public.has_role(auth.uid(), 'admin'));

-- Participantes (pessoas que respondem; vinculados a um analista e opcionalmente a uma empresa)
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analyst_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  role_title TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX participants_analyst_idx ON public.participants(analyst_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.participants TO authenticated;
GRANT ALL ON public.participants TO service_role;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants_owner_all" ON public.participants FOR ALL TO authenticated
  USING (auth.uid() = analyst_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = analyst_id OR public.has_role(auth.uid(), 'admin'));

-- Aplicações (uma aplicação = um instrumento + um participante + um token exclusivo)
CREATE TABLE public.diag_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analyst_id UUID NOT NULL,
  instrument_id UUID NOT NULL REFERENCES public.diag_instruments(id),
  instrument_version TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','submitted','in_review','validated','released','cancelled')),
  context TEXT,
  consent_accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  validated_at TIMESTAMPTZ,
  validated_by UUID,
  released_at TIMESTAMPTZ,
  released_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX diag_applications_analyst_idx ON public.diag_applications(analyst_id);
CREATE INDEX diag_applications_org_idx ON public.diag_applications(organization_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_applications TO authenticated;
GRANT ALL ON public.diag_applications TO service_role;
ALTER TABLE public.diag_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_applications_owner_all" ON public.diag_applications FOR ALL TO authenticated
  USING (auth.uid() = analyst_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = analyst_id OR public.has_role(auth.uid(), 'admin'));

-- Respostas (uma linha por pergunta; value NULL = N/A)
CREATE TABLE public.diag_application_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.diag_applications(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.diag_questions(id) ON DELETE CASCADE,
  question_code TEXT NOT NULL,
  value SMALLINT CHECK (value BETWEEN 1 AND 5),
  is_na BOOLEAN NOT NULL DEFAULT false,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (application_id, question_id)
);
CREATE INDEX diag_answers_application_idx ON public.diag_application_answers(application_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_application_answers TO authenticated;
GRANT ALL ON public.diag_application_answers TO service_role;
ALTER TABLE public.diag_application_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_answers_owner_all" ON public.diag_application_answers FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.diag_applications a WHERE a.id = application_id AND (a.analyst_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.diag_applications a WHERE a.id = application_id AND (a.analyst_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- Pré-diagnóstico calculado pelo motor (snapshot completo para auditoria)
CREATE TABLE public.diag_pre_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES public.diag_applications(id) ON DELETE CASCADE,
  engine_version TEXT NOT NULL DEFAULT 'V1',
  dimension_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  axes JSONB NOT NULL DEFAULT '{}'::jsonb,
  patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  indicators JSONB NOT NULL DEFAULT '[]'::jsonb,
  affinities JSONB NOT NULL DEFAULT '[]'::jsonb,
  predominant_stage TEXT,
  secondary_stage TEXT,
  in_transition BOOLEAN NOT NULL DEFAULT false,
  confidence NUMERIC(5,2),
  confidence_level TEXT,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  requires_validation BOOLEAN NOT NULL DEFAULT true,
  auto_release_blocked BOOLEAN NOT NULL DEFAULT false,
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_pre_diagnostics TO authenticated;
GRANT ALL ON public.diag_pre_diagnostics TO service_role;
ALTER TABLE public.diag_pre_diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_prediag_owner_all" ON public.diag_pre_diagnostics FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.diag_applications a WHERE a.id = application_id AND (a.analyst_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.diag_applications a WHERE a.id = application_id AND (a.analyst_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- Relatório final (validação e liberação pelo analista)
CREATE TABLE public.diag_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL UNIQUE REFERENCES public.diag_applications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','validated','released')),
  adjusted_stage_code TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  analyst_notes TEXT,
  validated_at TIMESTAMPTZ,
  validated_by UUID,
  released_at TIMESTAMPTZ,
  released_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diag_reports TO authenticated;
GRANT ALL ON public.diag_reports TO service_role;
ALTER TABLE public.diag_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_reports_owner_all" ON public.diag_reports FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.diag_applications a WHERE a.id = application_id AND (a.analyst_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.diag_applications a WHERE a.id = application_id AND (a.analyst_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- Auditoria básica (criação, consentimento, envio, cálculo, validação, liberação)
CREATE TABLE public.diag_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.diag_applications(id) ON DELETE CASCADE,
  actor_id UUID,
  actor_type TEXT NOT NULL DEFAULT 'system' CHECK (actor_type IN ('analyst','participant','system')),
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX diag_audit_application_idx ON public.diag_audit_log(application_id);
GRANT SELECT, INSERT ON public.diag_audit_log TO authenticated;
GRANT ALL ON public.diag_audit_log TO service_role;
ALTER TABLE public.diag_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diag_audit_select_owner" ON public.diag_audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.diag_applications a WHERE a.id = application_id AND (a.analyst_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
CREATE POLICY "diag_audit_insert_owner" ON public.diag_audit_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.diag_applications a WHERE a.id = application_id AND (a.analyst_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- updated_at automático
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER diag_instruments_updated_at BEFORE UPDATE ON public.diag_instruments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER diag_questions_updated_at BEFORE UPDATE ON public.diag_questions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER participants_updated_at BEFORE UPDATE ON public.participants FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER diag_applications_updated_at BEFORE UPDATE ON public.diag_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER diag_reports_updated_at BEFORE UPDATE ON public.diag_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();