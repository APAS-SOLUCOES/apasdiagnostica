ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS role_title text;

CREATE UNIQUE INDEX IF NOT EXISTS assessments_token_key ON public.assessments (token);
CREATE UNIQUE INDEX IF NOT EXISTS assessment_responses_assessment_id_key ON public.assessment_responses (assessment_id);
CREATE UNIQUE INDEX IF NOT EXISTS assessment_results_assessment_id_key ON public.assessment_results (assessment_id);
CREATE INDEX IF NOT EXISTS assessments_coach_id_idx ON public.assessments (coach_id);