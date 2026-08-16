-- ============================================================================
-- MIGRATION 2: TRIGGERS, RPCS ATÔMICAS E PERMISSÕES MÍNIMAS
-- ============================================================================

-- 1. TRIGGERS DE UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_services_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN NEW.updated_at = timezone('utc'::text, now()); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_services_updated_at ON public.services;
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.handle_services_updated_at();

CREATE OR REPLACE FUNCTION public.handle_publications_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN NEW.updated_at = timezone('utc'::text, now()); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_publications_updated_at ON public.service_publications;
CREATE TRIGGER trg_publications_updated_at BEFORE UPDATE ON public.service_publications
FOR EACH ROW EXECUTE FUNCTION public.handle_publications_updated_at();

CREATE OR REPLACE FUNCTION public.handle_r2_cleanup_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN NEW.updated_at = timezone('utc'::text, now()); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_r2_cleanup_updated_at ON public.r2_orphan_cleanup_queue;
CREATE TRIGGER trg_r2_cleanup_updated_at BEFORE UPDATE ON public.r2_orphan_cleanup_queue
FOR EACH ROW EXECUTE FUNCTION public.handle_r2_cleanup_updated_at();

-- 2. FUNÇÃO AUXILIAR: VERIFICAR SE STORAGE_KEY ESTÁ EM USO
CREATE OR REPLACE FUNCTION public.is_storage_key_in_use(p_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.services WHERE card_image_storage_key = p_key
        UNION ALL
        SELECT 1 FROM public.service_media WHERE storage_key = p_key OR thumbnail_storage_key = p_key
    );
$$;

-- 3. RPC: ATIVAR SERVIÇO
CREATE OR REPLACE FUNCTION public.activate_service_atomic(
    p_service_id UUID,
    p_user_id UUID
)
RETURNS public.services
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_service public.services;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT * INTO v_service FROM public.services WHERE id = p_service_id AND archived_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Serviço não encontrado ou arquivado.' USING ERRCODE = 'no_data_found';
    END IF;

    IF v_service.card_image_storage_key IS NULL OR v_service.card_image_alt IS NULL OR btrim(v_service.card_image_alt) = '' THEN
        RAISE EXCEPTION 'O serviço não pode ser ativado sem imagem de card válida e texto alternativo.' USING ERRCODE = 'check_violation';
    END IF;

    UPDATE public.services
    SET is_active = true, updated_by = p_user_id, updated_at = timezone('utc'::text, now())
    WHERE id = p_service_id
    RETURNING * INTO v_service;

    RETURN v_service;
END; $$;

-- 4. RPC: FINALIZAR UPLOAD DE MÍDIA
CREATE OR REPLACE FUNCTION public.finalize_media_upload_atomic(
    p_intent_id UUID,
    p_user_id UUID,
    p_alt_text TEXT,
    p_caption TEXT,
    p_media_stage TEXT,
    p_is_cover BOOLEAN,
    p_width INTEGER,
    p_height INTEGER,
    p_duration_seconds NUMERIC,
    p_actual_size_bytes BIGINT
)
RETURNS public.service_media
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_intent public.upload_intents;
    v_pub_id UUID;
    v_media_count INTEGER;
    v_media_type TEXT;
    v_next_sort INTEGER;
    v_media public.service_media;
    v_has_cover BOOLEAN;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT * INTO v_intent FROM public.upload_intents WHERE id = p_intent_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Intenção de upload inválida.' USING ERRCODE = 'no_data_found';
    END IF;

    IF v_intent.status = 'completed' THEN
        SELECT * INTO v_media FROM public.service_media WHERE storage_key = v_intent.storage_key;
        IF FOUND THEN RETURN v_media; END IF;
    END IF;

    IF v_intent.status <> 'pending' OR v_intent.expires_at <= timezone('utc'::text, now()) THEN
        RAISE EXCEPTION 'Intenção de upload expirada ou inválida.' USING ERRCODE = 'check_violation';
    END IF;

    IF v_intent.target_type <> 'publication_media' THEN
        RAISE EXCEPTION 'Tipo de intenção incompatível.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    IF p_actual_size_bytes <> v_intent.expected_size_bytes OR p_actual_size_bytes > v_intent.max_size_bytes THEN
        RAISE EXCEPTION 'Tamanho real do arquivo difere do autorizado.' USING ERRCODE = 'check_violation';
    END IF;

    v_pub_id := v_intent.target_id;

    PERFORM 1 FROM public.service_publications WHERE id = v_pub_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Publicação de destino inexistente.' USING ERRCODE = 'no_data_found';
    END IF;

    SELECT COUNT(*) INTO v_media_count FROM public.service_media WHERE publication_id = v_pub_id;
    IF v_media_count >= 6 THEN
        RAISE EXCEPTION 'Limite máximo de 6 mídias por publicação atingido.' USING ERRCODE = 'check_violation';
    END IF;

    v_media_type := CASE WHEN v_intent.expected_mime_type LIKE 'video/%' THEN 'video' ELSE 'image' END;

    SELECT COALESCE(MAX(sort_order), -1) + 1 INTO v_next_sort
    FROM public.service_media WHERE publication_id = v_pub_id;

    SELECT EXISTS(SELECT 1 FROM public.service_media WHERE publication_id = v_pub_id AND is_cover = true) INTO v_has_cover;

    IF p_is_cover AND v_has_cover THEN
        UPDATE public.service_media SET is_cover = false WHERE publication_id = v_pub_id;
    END IF;

    INSERT INTO public.service_media (
        publication_id, storage_key, media_type, media_stage, mime_type,
        size_bytes, width, height, duration_seconds, thumbnail_storage_key,
        alt_text, caption, sort_order, is_cover
    ) VALUES (
        v_pub_id, v_intent.storage_key, v_media_type, p_media_stage, v_intent.expected_mime_type,
        p_actual_size_bytes, p_width, p_height, p_duration_seconds, NULL,
        btrim(p_alt_text), p_caption, v_next_sort,
        CASE WHEN NOT v_has_cover THEN true ELSE p_is_cover END
    ) RETURNING * INTO v_media;

    UPDATE public.upload_intents SET status = 'completed' WHERE id = v_intent.id;
    UPDATE public.service_publications SET updated_at = timezone('utc'::text, now()), updated_by = p_user_id WHERE id = v_pub_id;

    RETURN v_media;
END; $$;

-- 5. RPC: PUBLICAR PUBLICAÇÃO
CREATE OR REPLACE FUNCTION public.publish_publication_atomic(
    p_publication_id UUID,
    p_user_id UUID
)
RETURNS public.service_publications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_pub public.service_publications;
    v_media_count INTEGER;
    v_cover_count INTEGER;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT * INTO v_pub FROM public.service_publications WHERE id = p_publication_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Publicação não encontrada.' USING ERRCODE = 'no_data_found';
    END IF;

    SELECT COUNT(*), COUNT(*) FILTER (WHERE is_cover = true)
    INTO v_media_count, v_cover_count
    FROM public.service_media WHERE publication_id = p_publication_id;

    IF v_media_count < 1 OR v_media_count > 6 THEN
        RAISE EXCEPTION 'A publicação deve possuir entre 1 e 6 mídias para ser publicada.' USING ERRCODE = 'check_violation';
    END IF;

    IF v_cover_count <> 1 THEN
        RAISE EXCEPTION 'A publicação deve possuir exatamente 1 mídia de capa.' USING ERRCODE = 'check_violation';
    END IF;

    UPDATE public.service_publications
    SET status = 'published',
        published_at = COALESCE(published_at, timezone('utc'::text, now())),
        updated_by = p_user_id,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_publication_id
    RETURNING * INTO v_pub;

    RETURN v_pub;
END; $$;

-- 6. RPC: DEFINIR CAPA DA MÍDIA
CREATE OR REPLACE FUNCTION public.set_media_cover_atomic(
    p_publication_id UUID,
    p_media_id UUID,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    PERFORM 1 FROM public.service_publications WHERE id = p_publication_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Publicação não encontrada.' USING ERRCODE = 'no_data_found';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.service_media WHERE id = p_media_id AND publication_id = p_publication_id) THEN
        RAISE EXCEPTION 'Mídia não pertence a esta publicação.' USING ERRCODE = 'no_data_found';
    END IF;

    UPDATE public.service_media SET is_cover = false WHERE publication_id = p_publication_id;
    UPDATE public.service_media SET is_cover = true WHERE id = p_media_id AND publication_id = p_publication_id;

    UPDATE public.service_publications SET updated_at = timezone('utc'::text, now()), updated_by = p_user_id WHERE id = p_publication_id;
END; $$;

-- 7. RPC: REORDENAR MÍDIAS
CREATE OR REPLACE FUNCTION public.reorder_media_atomic(
    p_publication_id UUID,
    p_media_ids UUID[],
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_total_db INTEGER;
    v_total_arr INTEGER;
    v_distinct_arr INTEGER;
    v_match_count INTEGER;
    i INTEGER;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    IF p_media_ids IS NULL OR array_length(p_media_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Lista de mídias não pode ser vazia.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    v_total_arr := array_length(p_media_ids, 1);

    PERFORM 1 FROM public.service_publications WHERE id = p_publication_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Publicação não encontrada.' USING ERRCODE = 'no_data_found';
    END IF;

    SELECT COUNT(*) INTO v_total_db FROM public.service_media WHERE publication_id = p_publication_id;

    IF v_total_db <> v_total_arr THEN
        RAISE EXCEPTION 'A quantidade de IDs fornecida difere da quantidade real de mídias.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    SELECT COUNT(DISTINCT id_val) INTO v_distinct_arr FROM unnest(p_media_ids) AS id_val;
    IF v_distinct_arr <> v_total_arr THEN
        RAISE EXCEPTION 'A lista de reordenação contém IDs duplicados.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    SELECT COUNT(*) INTO v_match_count FROM public.service_media WHERE publication_id = p_publication_id AND id = ANY(p_media_ids);
    IF v_match_count <> v_total_arr THEN
        RAISE EXCEPTION 'A lista contém IDs que não pertencem a esta publicação.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    FOR i IN 1..v_total_arr LOOP
        UPDATE public.service_media SET sort_order = i - 1 WHERE id = p_media_ids[i] AND publication_id = p_publication_id;
    END LOOP;

    UPDATE public.service_publications SET updated_at = timezone('utc'::text, now()), updated_by = p_user_id WHERE id = p_publication_id;
END; $$;

-- 8. RPC: REMOVER MÍDIA SEGURA
CREATE OR REPLACE FUNCTION public.delete_media_atomic(
    p_media_id UUID,
    p_user_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_media public.service_media;
    v_pub public.service_publications;
    v_remaining INTEGER;
    v_new_cover UUID;
    v_storage_key TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT * INTO v_media FROM public.service_media WHERE id = p_media_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Mídia não encontrada.' USING ERRCODE = 'no_data_found';
    END IF;

    SELECT * INTO v_pub FROM public.service_publications WHERE id = v_media.publication_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Publicação vinculada não encontrada.' USING ERRCODE = 'no_data_found';
    END IF;

    SELECT COUNT(*) INTO v_remaining FROM public.service_media WHERE publication_id = v_pub.id AND id <> p_media_id;

    IF v_pub.status = 'published' AND v_remaining = 0 THEN
        RAISE EXCEPTION 'Não é permitido remover a única mídia de uma publicação publicada. Reverta para rascunho primeiro.' USING ERRCODE = 'check_violation';
    END IF;

    v_storage_key := v_media.storage_key;
    DELETE FROM public.service_media WHERE id = p_media_id;

    IF v_media.is_cover AND v_remaining > 0 THEN
        SELECT id INTO v_new_cover FROM public.service_media WHERE publication_id = v_pub.id ORDER BY sort_order ASC LIMIT 1;
        UPDATE public.service_media SET is_cover = true WHERE id = v_new_cover;
    END IF;

    WITH reordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC) - 1 AS new_sort
        FROM public.service_media WHERE publication_id = v_pub.id
    )
    UPDATE public.service_media m SET sort_order = r.new_sort FROM reordered r WHERE m.id = r.id;

    UPDATE public.service_publications SET updated_at = timezone('utc'::text, now()), updated_by = p_user_id WHERE id = v_pub.id;
    RETURN v_storage_key;
END; $$;

-- 9. RPC: FINALIZAR IMAGEM DO CARD DE SERVIÇO
CREATE OR REPLACE FUNCTION public.finalize_service_card_image_atomic(
    p_intent_id UUID,
    p_user_id UUID,
    p_alt_text TEXT,
    p_actual_size_bytes BIGINT
)
RETURNS TABLE (service_row public.services, old_storage_key TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_intent public.upload_intents;
    v_service public.services;
    v_old_key TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE user_id = p_user_id AND is_active = true AND role IN ('admin', 'editor')
    ) THEN
        RAISE EXCEPTION 'Não autorizado.' USING ERRCODE = 'insufficient_privilege';
    END IF;

    SELECT * INTO v_intent FROM public.upload_intents WHERE id = p_intent_id AND user_id = p_user_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Intenção de upload inválida.' USING ERRCODE = 'no_data_found';
    END IF;

    IF v_intent.status = 'completed' THEN
        SELECT * INTO v_service FROM public.services WHERE id = v_intent.target_id;
        RETURN QUERY SELECT v_service, NULL::TEXT;
        RETURN;
    END IF;

    IF v_intent.status <> 'pending' OR v_intent.expires_at <= timezone('utc'::text, now()) THEN
        RAISE EXCEPTION 'Intenção expirada ou inválida.' USING ERRCODE = 'check_violation';
    END IF;

    IF v_intent.target_type <> 'service_card_image' THEN
        RAISE EXCEPTION 'Tipo de intenção incompatível.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    IF v_intent.expected_mime_type NOT IN ('image/jpeg', 'image/png', 'image/webp', 'image/avif') THEN
        RAISE EXCEPTION 'MIME type não permitido para imagem de card.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    IF p_actual_size_bytes <> v_intent.expected_size_bytes OR p_actual_size_bytes > v_intent.max_size_bytes THEN
        RAISE EXCEPTION 'Tamanho real do arquivo difere do autorizado.' USING ERRCODE = 'check_violation';
    END IF;

    SELECT * INTO v_service FROM public.services WHERE id = v_intent.target_id FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Serviço de destino inexistente.' USING ERRCODE = 'no_data_found';
    END IF;

    v_old_key := v_service.card_image_storage_key;

    UPDATE public.services
    SET card_image_storage_key = v_intent.storage_key,
        card_image_alt = btrim(p_alt_text),
        updated_by = p_user_id,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_service.id
    RETURNING * INTO v_service;

    UPDATE public.upload_intents SET status = 'completed' WHERE id = v_intent.id;

    RETURN QUERY SELECT v_service, v_old_key;
END; $$;

-- 10. PERMISSÕES E REVOGADOR EXPLÍCITO
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.r2_orphan_cleanup_queue ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.services FROM anon, authenticated, public;
REVOKE ALL ON public.service_publications FROM anon, authenticated, public;
REVOKE ALL ON public.service_media FROM anon, authenticated, public;
REVOKE ALL ON public.upload_intents FROM anon, authenticated, public;
REVOKE ALL ON public.r2_orphan_cleanup_queue FROM anon, authenticated, public;

REVOKE ALL ON FUNCTION public.is_storage_key_in_use(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.activate_service_atomic(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_media_upload_atomic(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER, NUMERIC, BIGINT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.publish_publication_atomic(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_media_cover_atomic(UUID, UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reorder_media_atomic(UUID, UUID[], UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_media_atomic(UUID, UUID) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.finalize_service_card_image_atomic(UUID, UUID, TEXT, BIGINT) FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE ON public.services TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.service_publications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_media TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upload_intents TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.r2_orphan_cleanup_queue TO service_role;

GRANT EXECUTE ON FUNCTION public.is_storage_key_in_use(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.activate_service_atomic(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_media_upload_atomic(UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER, NUMERIC, BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION public.publish_publication_atomic(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_media_cover_atomic(UUID, UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.reorder_media_atomic(UUID, UUID[], UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_media_atomic(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.finalize_service_card_image_atomic(UUID, UUID, TEXT, BIGINT) TO service_role;
