DROP POLICY IF EXISTS "diag_questions_select_auth" ON public.diag_questions;
CREATE POLICY "diag_questions_select_team"
ON public.diag_questions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'coach')
  OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "instruments_select_auth" ON public.instruments;
CREATE POLICY "instruments_select_team"
ON public.instruments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'coach')
  OR public.has_role(auth.uid(), 'admin')
);