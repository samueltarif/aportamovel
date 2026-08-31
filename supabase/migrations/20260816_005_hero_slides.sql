-- ============================================================================
-- MIGRATION 5: CARROSSEL DINÂMICO DO HERO (HERO SLIDES)
-- ============================================================================

-- 1. TABELA DE SLIDES DO HERO
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID NOT NULL REFERENCES public.service_media(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    title_override TEXT CHECK (title_override IS NULL OR (char_length(btrim(title_override)) >= 2 AND char_length(title_override) <= 100)),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_hero_slides_media UNIQUE (media_id)
);

CREATE INDEX IF NOT EXISTS idx_hero_slides_active_order ON public.hero_slides(sort_order ASC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hero_slides_media ON public.hero_slides(media_id);

-- 2. TRIGGER DE UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_hero_slides_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_hero_slides_updated_at ON public.hero_slides;
CREATE TRIGGER trg_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW EXECUTE FUNCTION public.handle_hero_slides_updated_at();

-- 3. RPC: ADICIONAR SLIDE ATÔMICO COM SERIALIZAÇÃO TRANSACIONAL
CREATE OR REPLACE FUNCTION public.create_hero_slide_atomic(
    p_media_id UUID,
    p_user_id UUID,
    p_title_override TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_next_sort INTEGER;
    v_new_id UUID;
    v_clean_title TEXT;
BEGIN
    -- Serialização transacional exclusiva compartilhada com ADD/DELETE/REORDER
    PERFORM pg_advisory_xact_lock(hashtext('hero_slides_reorder_lock'));

    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- Validar elegibilidade da mídia
    IF NOT EXISTS (
        SELECT 1 FROM public.service_media sm
        JOIN public.service_publications sp ON sp.id = sm.publication_id
        JOIN public.services s ON s.id = sp.service_id
        WHERE sm.id = p_media_id
          AND sm.media_type = 'image'
          AND sp.status = 'published'
          AND s.is_active = true
          AND s.archived_at IS NULL
    ) THEN
        RAISE EXCEPTION 'A mídia informada não existe ou não pertence a uma publicação e serviço ativos.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Próximo sort_order contíguo garantido
    SELECT COALESCE(MAX(sort_order) + 1, 0) INTO v_next_sort FROM public.hero_slides;

    -- Normalização rigorosa de title_override
    IF p_title_override IS NOT NULL AND char_length(btrim(p_title_override)) >= 2 THEN
        v_clean_title := btrim(p_title_override);
    ELSE
        v_clean_title := NULL;
    END IF;

    INSERT INTO public.hero_slides (
        media_id,
        sort_order,
        is_active,
        title_override,
        created_by,
        updated_by
    ) VALUES (
        p_media_id,
        v_next_sort,
        true,
        v_clean_title,
        p_user_id,
        p_user_id
    ) RETURNING id INTO v_new_id;

    RETURN v_new_id;
END; $$;

-- 4. RPC: REMOVER SLIDE ATÔMICO E REINDEXAR COM SERIALIZAÇÃO TRANSACIONAL
CREATE OR REPLACE FUNCTION public.delete_hero_slide_atomic(
    p_slide_id UUID,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    -- Serialização transacional exclusiva compartilhada com ADD/DELETE/REORDER
    PERFORM pg_advisory_xact_lock(hashtext('hero_slides_reorder_lock'));

    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    DELETE FROM public.hero_slides WHERE id = p_slide_id;

    -- Reindexação determinística dos slides restantes (0, 1, 2...) com desempate por id ASC
    WITH reindexed AS (
        SELECT id, (ROW_NUMBER() OVER (ORDER BY sort_order ASC, updated_at DESC, id ASC) - 1) AS new_sort
        FROM public.hero_slides
    )
    UPDATE public.hero_slides h
    SET sort_order = r.new_sort,
        updated_at = timezone('utc'::text, now())
    FROM reindexed r
    WHERE h.id = r.id AND h.sort_order <> r.new_sort;
END; $$;

-- 5. RPC: REORDENAÇÃO ATÔMICA DOS SLIDES DO HERO (SERIALIZADA VIA ADVISORY LOCK)
CREATE OR REPLACE FUNCTION public.reorder_hero_slides_atomic(
    p_slide_ids UUID[],
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_total_arr INTEGER;
    v_distinct_arr INTEGER;
    v_matched_count INTEGER;
    i INTEGER;
BEGIN
    -- Serialização transacional exclusiva compartilhada com ADD/DELETE/REORDER
    PERFORM pg_advisory_xact_lock(hashtext('hero_slides_reorder_lock'));

    -- Validação de autenticação e papel (admin/editor)
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- Validação dos parâmetros de entrada
    IF p_slide_ids IS NULL OR array_length(p_slide_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Lista de IDs não pode ser vazia.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    v_total_arr := array_length(p_slide_ids, 1);

    SELECT COUNT(DISTINCT id_val) INTO v_distinct_arr FROM unnest(p_slide_ids) AS id_val;
    IF v_distinct_arr <> v_total_arr THEN
        RAISE EXCEPTION 'A lista contém IDs duplicados.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Validação de que todos os IDs informados existem na tabela
    SELECT COUNT(*) INTO v_matched_count
    FROM public.hero_slides
    WHERE id = ANY(p_slide_ids);

    IF v_matched_count <> v_total_arr THEN
        RAISE EXCEPTION 'Um ou mais IDs informados não existem na tabela hero_slides.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Atualização da sequência fornecida
    FOR i IN 1..v_total_arr LOOP
        UPDATE public.hero_slides
        SET sort_order = i - 1,
            updated_by = p_user_id,
            updated_at = timezone('utc'::text, now())
        WHERE id = p_slide_ids[i];
    END LOOP;

    -- Reindexação determinística dos slides remanescentes (com desempate por id ASC)
    WITH remaining AS (
        SELECT id, (ROW_NUMBER() OVER (ORDER BY sort_order ASC, updated_at DESC, id ASC) + v_total_arr - 1) AS new_sort
        FROM public.hero_slides
        WHERE id <> ALL(p_slide_ids)
    )
    UPDATE public.hero_slides h
    SET sort_order = r.new_sort,
        updated_at = timezone('utc'::text, now())
    FROM remaining r
    WHERE h.id = r.id;
END; $$;

-- 6. RLS E PERMISSÕES MÍNIMAS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.hero_slides FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.create_hero_slide_atomic(UUID, UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_hero_slide_atomic(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reorder_hero_slides_atomic(UUID[], UUID) FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hero_slides TO service_role;
GRANT EXECUTE ON FUNCTION public.create_hero_slide_atomic(UUID, UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_hero_slide_atomic(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.reorder_hero_slides_atomic(UUID[], UUID) TO service_role;
