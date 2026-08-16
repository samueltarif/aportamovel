-- ============================================================================
-- MIGRATION 1: TABELAS, ÍNDICES E SEGURANÇA BÁSICA
-- ============================================================================

-- 1. TABELA DE SERVIÇOS
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (char_length(btrim(name)) >= 3 AND char_length(name) <= 120),
    slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' AND char_length(slug) <= 120),
    short_description TEXT NOT NULL CHECK (char_length(btrim(short_description)) >= 3 AND char_length(short_description) <= 200),
    description TEXT NOT NULL CHECK (char_length(btrim(description)) >= 3 AND char_length(description) <= 2000),
    card_image_storage_key TEXT CHECK (card_image_storage_key IS NULL OR char_length(card_image_storage_key) <= 500),
    card_image_alt TEXT CHECK (card_image_alt IS NULL OR char_length(btrim(card_image_alt)) <= 200),
    icon_key TEXT NOT NULL CHECK (icon_key IN ('gate', 'fence', 'chain', 'rail', 'welding', 'door', 'roller', 'cftv', 'wrench', 'shield')),
    accent_variant TEXT NOT NULL DEFAULT 'blue' CHECK (accent_variant IN ('blue', 'red')),
    is_active BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    home_display_order INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    archived_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_active_service_has_image CHECK (
        (is_active = false) OR (card_image_storage_key IS NOT NULL AND card_image_alt IS NOT NULL AND btrim(card_image_alt) <> '')
    )
);

CREATE INDEX IF NOT EXISTS idx_services_active_order ON public.services(display_order ASC) WHERE is_active = true AND archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_featured ON public.services(home_display_order ASC) WHERE is_active = true AND is_featured = true AND archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);

-- 2. TABELA DE PUBLICAÇÕES (TRABALHOS REALIZADOS)
CREATE TABLE IF NOT EXISTS public.service_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    title TEXT NOT NULL CHECK (char_length(btrim(title)) >= 3 AND char_length(title) <= 160),
    slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' AND char_length(slug) <= 160),
    summary TEXT NOT NULL CHECK (char_length(btrim(summary)) >= 3 AND char_length(summary) <= 300),
    description TEXT NOT NULL CHECK (char_length(btrim(description)) >= 3 AND char_length(description) <= 4000),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    display_order INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_publications_service_status ON public.service_publications(service_id, status, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_publications_slug ON public.service_publications(slug);
CREATE INDEX IF NOT EXISTS idx_publications_published_at ON public.service_publications(published_at DESC) WHERE status = 'published';

-- 3. TABELA DE MÍDIAS (FOTOS E VÍDEOS)
CREATE TABLE IF NOT EXISTS public.service_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publication_id UUID NOT NULL REFERENCES public.service_publications(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL UNIQUE CHECK (char_length(storage_key) <= 500),
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    media_stage TEXT NOT NULL DEFAULT 'general' CHECK (media_stage IN ('before', 'after', 'general')),
    mime_type TEXT NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm')),
    size_bytes BIGINT NOT NULL,
    width INTEGER CHECK (width > 0),
    height INTEGER CHECK (height > 0),
    duration_seconds NUMERIC(6, 2) CHECK (duration_seconds > 0),
    thumbnail_storage_key TEXT CHECK (thumbnail_storage_key IS NULL OR char_length(thumbnail_storage_key) <= 500),
    alt_text TEXT NOT NULL CHECK (char_length(btrim(alt_text)) >= 3 AND char_length(alt_text) <= 200),
    caption TEXT CHECK (caption IS NULL OR char_length(caption) <= 500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_cover BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_media_size_by_type CHECK (
        (media_type = 'image' AND size_bytes > 0 AND size_bytes <= 10485760)
        OR
        (media_type = 'video' AND size_bytes > 0 AND size_bytes <= 104857600)
    ),
    CONSTRAINT uq_publication_media_sort_order UNIQUE (publication_id, sort_order) DEFERRABLE INITIALLY DEFERRED
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_service_media_single_cover ON public.service_media(publication_id) WHERE is_cover = true;
CREATE INDEX IF NOT EXISTS idx_service_media_pub_sort ON public.service_media(publication_id, sort_order ASC);

-- 4. TABELA DE INTENÇÕES DE UPLOAD
CREATE TABLE IF NOT EXISTS public.upload_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('service_card_image', 'publication_media')),
    target_id UUID NOT NULL,
    storage_key TEXT NOT NULL UNIQUE CHECK (char_length(storage_key) <= 500),
    expected_mime_type TEXT NOT NULL,
    expected_size_bytes BIGINT NOT NULL CHECK (expected_size_bytes > 0),
    max_size_bytes BIGINT NOT NULL CHECK (max_size_bytes >= expected_size_bytes),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_upload_intents_lookup ON public.upload_intents(id, user_id, status);

-- 5. TABELA DE FILA DE LIMPEZA DE MÍDIAS ÓRFÃS NO R2
CREATE TABLE IF NOT EXISTS public.r2_orphan_cleanup_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_key TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 5,
    last_error TEXT,
    next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_r2_orphan_cleanup ON public.r2_orphan_cleanup_queue(next_attempt_at ASC) WHERE attempts < max_attempts;
