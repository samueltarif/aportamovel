-- Edit in place: retain media identity, cover, order and publication description.
CREATE OR REPLACE FUNCTION public.update_media_details_atomic(
  p_media_id UUID, p_user_id UUID, p_alt_text TEXT, p_caption TEXT, p_media_stage TEXT
) RETURNS public.service_media
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_media public.service_media;
  v_pub_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_user_id AND is_active AND role IN ('admin', 'editor')) THEN
    RAISE EXCEPTION 'Não autorizado.';
  END IF;
  SELECT publication_id INTO v_pub_id FROM public.service_media WHERE id = p_media_id;
  PERFORM 1 FROM public.service_publications WHERE id = v_pub_id FOR UPDATE;
  UPDATE public.service_media SET alt_text = btrim(p_alt_text), caption = NULLIF(btrim(p_caption), ''), media_stage = p_media_stage
    WHERE id = p_media_id RETURNING * INTO v_media;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mídia não encontrada.'; END IF;
  UPDATE public.service_publications SET updated_at = now(), updated_by = p_user_id WHERE id = v_pub_id;
  RETURN v_media;
END; $$;

CREATE OR REPLACE FUNCTION public.replace_media_upload_atomic(
  p_media_id UUID, p_intent_id UUID, p_user_id UUID, p_alt_text TEXT,
  p_caption TEXT, p_media_stage TEXT, p_is_cover BOOLEAN,
  p_width INTEGER, p_height INTEGER, p_duration_seconds NUMERIC, p_actual_size_bytes BIGINT
) RETURNS public.service_media
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_intent public.upload_intents;
  v_media public.service_media;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_user_id AND is_active AND role IN ('admin', 'editor')) THEN
    RAISE EXCEPTION 'Não autorizado.';
  END IF;
  SELECT * INTO v_intent FROM public.upload_intents WHERE id = p_intent_id AND user_id = p_user_id FOR UPDATE;
  IF NOT FOUND OR v_intent.target_type <> 'publication_media' THEN RAISE EXCEPTION 'Intenção de upload inválida.'; END IF;
  PERFORM 1 FROM public.service_publications WHERE id = v_intent.target_id FOR UPDATE;
  SELECT * INTO v_media FROM public.service_media WHERE id = p_media_id AND publication_id = v_intent.target_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Mídia não encontrada nesta publicação.'; END IF;
  IF v_intent.status = 'completed' AND v_media.storage_key = v_intent.storage_key THEN RETURN v_media; END IF;
  IF v_intent.status <> 'pending' OR v_intent.expires_at <= now() THEN RAISE EXCEPTION 'Intenção de upload expirada ou inválida.'; END IF;
  IF v_media.media_type <> CASE WHEN v_intent.expected_mime_type LIKE 'video/%' THEN 'video' ELSE 'image' END THEN
    RAISE EXCEPTION 'Substitua uma foto por outra foto ou um vídeo por outro vídeo.';
  END IF;
  IF p_actual_size_bytes <> v_intent.expected_size_bytes OR p_actual_size_bytes > v_intent.max_size_bytes THEN
    RAISE EXCEPTION 'Tamanho real do arquivo difere do autorizado.';
  END IF;
  INSERT INTO public.r2_orphan_cleanup_queue(storage_key, reason) VALUES (v_media.storage_key, 'media_replaced') ON CONFLICT (storage_key) DO NOTHING;
  IF v_media.thumbnail_storage_key IS NOT NULL THEN
    INSERT INTO public.r2_orphan_cleanup_queue(storage_key, reason) VALUES (v_media.thumbnail_storage_key, 'media_replaced') ON CONFLICT (storage_key) DO NOTHING;
  END IF;
  UPDATE public.service_media SET
    storage_key = v_intent.storage_key,
    media_type = CASE WHEN v_intent.expected_mime_type LIKE 'video/%' THEN 'video' ELSE 'image' END,
    mime_type = v_intent.expected_mime_type, size_bytes = p_actual_size_bytes,
    width = p_width, height = p_height, duration_seconds = p_duration_seconds, thumbnail_storage_key = NULL,
    alt_text = btrim(p_alt_text), caption = NULLIF(btrim(p_caption), ''), media_stage = p_media_stage
  WHERE id = p_media_id RETURNING * INTO v_media;
  UPDATE public.upload_intents SET status = 'completed' WHERE id = p_intent_id;
  UPDATE public.service_publications SET updated_at = now(), updated_by = p_user_id WHERE id = v_intent.target_id;
  RETURN v_media;
END; $$;

REVOKE ALL ON FUNCTION public.update_media_details_atomic(UUID, UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_media_details_atomic(UUID, UUID, TEXT, TEXT, TEXT) TO service_role;
REVOKE ALL ON FUNCTION public.replace_media_upload_atomic(UUID, UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER, NUMERIC, BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.replace_media_upload_atomic(UUID, UUID, UUID, TEXT, TEXT, TEXT, BOOLEAN, INTEGER, INTEGER, NUMERIC, BIGINT) TO service_role;
