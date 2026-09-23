-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'coach');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'coach')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Organizations (empresas)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_owner_all" ON public.organizations FOR ALL TO authenticated
  USING (auth.uid() = coach_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = coach_id OR public.has_role(auth.uid(), 'admin'));

-- Configurable instrument (questions + scoring rules)
CREATE TABLE public.instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID,
  name TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  status TEXT NOT NULL DEFAULT 'draft',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  scoring JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.instruments TO authenticated;
GRANT ALL ON public.instruments TO service_role;
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "instruments_select_auth" ON public.instruments FOR SELECT TO authenticated USING (true);
CREATE POLICY "instruments_write_owner" ON public.instruments FOR ALL TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- Assessments
CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  instrument_id UUID REFERENCES public.instruments(id) ON DELETE SET NULL,
  instrument_version TEXT,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_whatsapp TEXT,
  context TEXT,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  consent_accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX assessments_coach_idx ON public.assessments (coach_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assessments_owner_all" ON public.assessments FOR ALL TO authenticated
  USING (auth.uid() = coach_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = coach_id OR public.has_role(auth.uid(), 'admin'));

-- Raw responses
CREATE TABLE public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL UNIQUE REFERENCES public.assessments(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_responses TO authenticated;
GRANT ALL ON public.assessment_responses TO service_role;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "responses_owner_all" ON public.assessment_responses FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND (a.coach_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND (a.coach_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));

-- Computed results
CREATE TABLE public.assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL UNIQUE REFERENCES public.assessments(id) ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  predominant TEXT,
  combination TEXT,
  scoring_version TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_results TO authenticated;
GRANT ALL ON public.assessment_results TO service_role;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "results_owner_all" ON public.assessment_results FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND (a.coach_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))))
  WITH CHECK (EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND (a.coach_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))));
