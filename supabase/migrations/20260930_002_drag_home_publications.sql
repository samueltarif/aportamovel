CREATE OR REPLACE FUNCTION public.reorder_home_publications_atomic(p_user_id UUID, p_publication_ids UUID[])
RETURNS SETOF public.service_publications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_count INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_user_id AND is_active AND role IN ('admin', 'editor')) THEN
    RAISE EXCEPTION 'Não autorizado.';
  END IF;
  IF COALESCE(cardinality(p_publication_ids), 0) = 0
    OR cardinality(p_publication_ids) <> (SELECT count(DISTINCT id) FROM unnest(p_publication_ids) AS ids(id)) THEN
    RAISE EXCEPTION 'Lista de publicações inválida.';
  END IF;
  PERFORM p.id FROM public.service_publications p WHERE p.id = ANY(p_publication_ids) ORDER BY p.id FOR UPDATE;
  SELECT count(*) INTO v_count FROM public.service_publications p
    JOIN public.services s ON s.id = p.service_id
    WHERE p.id = ANY(p_publication_ids) AND p.status = 'published' AND s.is_active AND s.archived_at IS NULL;
  IF v_count <> cardinality(p_publication_ids) THEN
    RAISE EXCEPTION 'A lista mudou. Atualize a página e tente novamente.';
  END IF;
  SELECT count(*) INTO v_count FROM public.service_publications p JOIN public.services s ON s.id = p.service_id
    WHERE p.status = 'published' AND s.is_active AND s.archived_at IS NULL;
  IF v_count <> cardinality(p_publication_ids) THEN
    RAISE EXCEPTION 'A lista mudou. Atualize a página e tente novamente.';
  END IF;
  RETURN QUERY UPDATE public.service_publications p SET display_order = ids.position::INTEGER - 1,
    updated_by = p_user_id, updated_at = now()
    FROM unnest(p_publication_ids) WITH ORDINALITY AS ids(id, position)
    WHERE p.id = ids.id RETURNING p.*;
END; $$;
REVOKE ALL ON FUNCTION public.reorder_home_publications_atomic(UUID, UUID[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reorder_home_publications_atomic(UUID, UUID[]) TO service_role;
