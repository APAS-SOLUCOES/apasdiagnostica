DROP POLICY IF EXISTS "diag_dimensions_select_auth" ON public.diag_dimensions;

CREATE POLICY "diag_dimensions_select_team"
ON public.diag_dimensions
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'coach'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);