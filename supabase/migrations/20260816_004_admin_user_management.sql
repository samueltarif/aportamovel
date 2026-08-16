-- ============================================================
-- Migration 004: Módulo de Gerenciamento Seguro de Administradores (V17.1 FINAL)
-- Projeto: A Portamóvel — Painel Administrativo
-- Contém exatamente: 5 Tabelas + 18 RPCs Atômicas
-- ============================================================

SET search_path = '';

-- 1. Evolução da tabela admin_users (campo accepted_at + constraint de estados)
ALTER TABLE public.admin_users
  ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ NULL;

-- Backfill correto: considera todos os administradores preexistentes como aceitos
UPDATE public.admin_users
SET accepted_at = COALESCE(created_at, now())
WHERE accepted_at IS NULL;

ALTER TABLE public.admin_users
  DROP CONSTRAINT IF EXISTS chk_admin_user_status_state;

ALTER TABLE public.admin_users
  ADD CONSTRAINT chk_admin_user_status_state CHECK (
    (accepted_at IS NULL AND is_active = FALSE) OR
    (accepted_at IS NOT NULL)
  );


-- 2. Tabela de Auditoria Imutável (Inclui invite_resent)
CREATE TABLE IF NOT EXISTS public.admin_user_audit (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  target_user_id   UUID        NOT NULL REFERENCES auth.users(id),
  actor_user_id    UUID        NOT NULL REFERENCES auth.users(id),
  action           TEXT        NOT NULL
    CHECK (action IN ('invited', 'invite_resent', 'invite_accepted', 'role_changed', 'activated', 'deactivated')),
  old_role         TEXT        NULL CHECK (old_role IS NULL OR old_role IN ('admin', 'editor')),
  new_role         TEXT        NULL CHECK (new_role IS NULL OR new_role IN ('admin', 'editor')),
  old_is_active    BOOLEAN     NULL,
  new_is_active    BOOLEAN     NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_audit_action_strict CHECK (
    (action = 'invited' AND old_role IS NULL AND new_role IS NOT NULL AND old_is_active IS NULL AND new_is_active IS NULL) OR
    (action = 'invite_resent' AND old_role IS NULL AND new_role IS NULL AND old_is_active IS NULL AND new_is_active IS NULL) OR
    (action = 'invite_accepted' AND old_role IS NULL AND new_role IS NULL AND old_is_active = FALSE AND new_is_active = TRUE) OR
    (action = 'role_changed' AND old_role IS NOT NULL AND new_role IS NOT NULL AND old_role <> new_role AND old_is_active IS NULL AND new_is_active IS NULL) OR
    (action = 'activated' AND old_role IS NULL AND new_role IS NULL AND old_is_active = FALSE AND new_is_active = TRUE) OR
    (action = 'deactivated' AND old_role IS NULL AND new_role IS NULL AND old_is_active = TRUE AND new_is_active = FALSE)
  )
);

CREATE INDEX IF NOT EXISTS idx_admin_user_audit_actor ON public.admin_user_audit (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_audit_target ON public.admin_user_audit (target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_audit_created ON public.admin_user_audit (created_at DESC);

ALTER TABLE public.admin_user_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_user_audit FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.admin_user_audit TO service_role;
REVOKE UPDATE, DELETE ON public.admin_user_audit FROM service_role;


-- 3. Tabela de Rate Limit Persistente
CREATE TABLE IF NOT EXISTS public.admin_rate_limits (
  key          TEXT        PRIMARY KEY,
  attempts     INT         NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_rate_limits_window ON public.admin_rate_limits (window_start);

ALTER TABLE public.admin_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_rate_limits TO service_role;


-- 4. Tabela de Idempotência com Duplo Prazo
CREATE TABLE IF NOT EXISTS public.admin_idempotency_keys (
  actor_user_id         UUID        NOT NULL REFERENCES auth.users(id),
  operation             TEXT        NOT NULL,
  idempotency_key       TEXT        NOT NULL,
  execution_token       UUID        NOT NULL DEFAULT gen_random_uuid(),
  request_hash          TEXT        NOT NULL,
  status                TEXT        NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  response              JSONB       NULL,
  processing_expires_at TIMESTAMPTZ NOT NULL,
  result_expires_at     TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (actor_user_id, operation, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_admin_idempotency_result_exp ON public.admin_idempotency_keys (result_expires_at);

ALTER TABLE public.admin_idempotency_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_idempotency_keys FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_idempotency_keys TO service_role;


-- 5. Tabela de Reserva Concorrente com Estado 'compensating' e 'compensated'
CREATE TABLE IF NOT EXISTS public.admin_invite_reservations (
  normalized_email      TEXT        PRIMARY KEY,
  lease_token           UUID        NOT NULL DEFAULT gen_random_uuid(),
  compensation_token    UUID        NULL,
  actor_user_id         UUID        NOT NULL REFERENCES auth.users(id),
  idempotency_key       TEXT        NOT NULL,
  auth_user_id          UUID        NULL,
  status                TEXT        NOT NULL CHECK (status IN ('reserved', 'compensating', 'compensated', 'completed', 'failed')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  processing_expires_at TIMESTAMPTZ NOT NULL,
  result_expires_at     TIMESTAMPTZ NOT NULL,
  CONSTRAINT chk_reservation_email_normalized CHECK (normalized_email = lower(trim(normalized_email)))
);

CREATE INDEX IF NOT EXISTS idx_admin_reservations_result_exp ON public.admin_invite_reservations (result_expires_at);

ALTER TABLE public.admin_invite_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_invite_reservations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invite_reservations TO service_role;


-- 6. Tabela de Leases Persistentes para Ações Externas (ex: Reenvio)
CREATE TABLE IF NOT EXISTS public.admin_action_leases (
  action_key            TEXT        PRIMARY KEY,
  lease_token           UUID        NOT NULL DEFAULT gen_random_uuid(),
  actor_user_id         UUID        NOT NULL REFERENCES auth.users(id),
  idempotency_key       TEXT        NOT NULL,
  status                TEXT        NOT NULL CHECK (status IN ('active', 'completed', 'failed')),
  processing_expires_at TIMESTAMPTZ NOT NULL,
  result_expires_at     TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_action_leases_result_exp ON public.admin_action_leases (result_expires_at);

ALTER TABLE public.admin_action_leases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_action_leases FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_action_leases TO service_role;


-- RPC 1: Rate Limit Atômico
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key          TEXT,
  p_max_attempts INT,
  p_window_secs  INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := now();
BEGIN
  DELETE FROM public.admin_rate_limits
  WHERE window_start < (v_now - INTERVAL '1 hour');

  PERFORM pg_advisory_xact_lock(hashtext(p_key));

  SELECT attempts, window_start INTO v_rec
  FROM public.admin_rate_limits
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.admin_rate_limits (key, attempts, window_start)
    VALUES (p_key, 1, v_now);
    RETURN TRUE;
  END IF;

  IF (v_now - v_rec.window_start) > (p_window_secs * INTERVAL '1 second') THEN
    UPDATE public.admin_rate_limits
    SET attempts = 1, window_start = v_now
    WHERE key = p_key;
    RETURN TRUE;
  END IF;

  IF v_rec.attempts >= p_max_attempts THEN
    RETURN FALSE;
  END IF;

  UPDATE public.admin_rate_limits
  SET attempts = attempts + 1
  WHERE key = p_key;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(TEXT, INT, INT) TO service_role;


-- RPC 2: Aquisição de Idempotência com Validação Prévia de Hash
CREATE OR REPLACE FUNCTION public.acquire_idempotency_key(
  p_actor_user_id       UUID,
  p_operation           TEXT,
  p_key                 TEXT,
  p_request_hash        TEXT,
  p_processing_ttl_secs INT,
  p_result_ttl_secs     INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := now();
  v_proc_exp TIMESTAMPTZ := v_now + (p_processing_ttl_secs * INTERVAL '1 second');
  v_res_exp  TIMESTAMPTZ := v_now + (p_result_ttl_secs * INTERVAL '1 second');
  v_token UUID := gen_random_uuid();
BEGIN
  DELETE FROM public.admin_idempotency_keys
  WHERE result_expires_at < v_now;

  PERFORM pg_advisory_xact_lock(hashtext(p_actor_user_id::text || p_operation || p_key));

  SELECT status, request_hash, response, processing_expires_at, result_expires_at, execution_token INTO v_rec
  FROM public.admin_idempotency_keys
  WHERE actor_user_id = p_actor_user_id AND operation = p_operation AND idempotency_key = p_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_rec.result_expires_at > v_now THEN
      IF v_rec.request_hash <> p_request_hash THEN
        RAISE EXCEPTION 'Conflito de chave de idempotencia com payload diferente dentro do periodo de retencao.' USING ERRCODE = 'P0409';
      END IF;

      IF v_rec.status = 'completed' THEN
        RETURN jsonb_build_object('state', 'completed', 'response', v_rec.response, 'execution_token', v_rec.execution_token);
      END IF;

      IF v_rec.status = 'processing' AND v_rec.processing_expires_at > v_now THEN
        RAISE EXCEPTION 'Operacao em processamento em outra requisicao.' USING ERRCODE = 'P0409';
      END IF;

      UPDATE public.admin_idempotency_keys
      SET status = 'processing', response = NULL, processing_expires_at = v_proc_exp, execution_token = v_token, updated_at = v_now
      WHERE actor_user_id = p_actor_user_id AND operation = p_operation AND idempotency_key = p_key;

      RETURN jsonb_build_object('state', 'acquired', 'execution_token', v_token);
    END IF;

    UPDATE public.admin_idempotency_keys
    SET request_hash = p_request_hash, status = 'processing', response = NULL, processing_expires_at = v_proc_exp, result_expires_at = v_res_exp, execution_token = v_token, updated_at = v_now
    WHERE actor_user_id = p_actor_user_id AND operation = p_operation AND idempotency_key = p_key;

    RETURN jsonb_build_object('state', 'acquired', 'execution_token', v_token);
  END IF;

  INSERT INTO public.admin_idempotency_keys (
    actor_user_id, operation, idempotency_key, execution_token, request_hash, status, processing_expires_at, result_expires_at
  ) VALUES (
    p_actor_user_id, p_operation, p_key, v_token, p_request_hash, 'processing', v_proc_exp, v_res_exp
  );

  RETURN jsonb_build_object('state', 'acquired', 'execution_token', v_token);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.acquire_idempotency_key(UUID, TEXT, TEXT, TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_idempotency_key(UUID, TEXT, TEXT, TEXT, INT, INT) TO service_role;


-- RPC 3: Release de Idempotência
CREATE OR REPLACE FUNCTION public.release_idempotency_key(
  p_actor_user_id   UUID,
  p_operation       TEXT,
  p_key             TEXT,
  p_execution_token UUID,
  p_status          TEXT,
  p_response        JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INT;
BEGIN
  IF p_status NOT IN ('completed', 'failed') THEN
    RAISE EXCEPTION 'Status de conclusao invalido.' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.admin_idempotency_keys
  SET status = p_status, response = p_response, updated_at = now()
  WHERE actor_user_id = p_actor_user_id
    AND operation = p_operation
    AND idempotency_key = p_key
    AND execution_token = p_execution_token
    AND status = 'processing';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.release_idempotency_key(UUID, TEXT, TEXT, UUID, TEXT, JSONB) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_idempotency_key(UUID, TEXT, TEXT, UUID, TEXT, JSONB) TO service_role;


-- RPC 4: Aquisição de Reserva por E-mail (Cleanup Seguro Protegendo 'compensating')
CREATE OR REPLACE FUNCTION public.acquire_admin_invite_reservation(
  p_normalized_email    TEXT,
  p_actor_user_id       UUID,
  p_idempotency_key     TEXT,
  p_processing_ttl_secs INT,
  p_result_ttl_secs     INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := now();
  v_proc_exp TIMESTAMPTZ := v_now + (p_processing_ttl_secs * INTERVAL '1 second');
  v_res_exp  TIMESTAMPTZ := v_now + (p_result_ttl_secs * INTERVAL '1 second');
  v_lease UUID := gen_random_uuid();
BEGIN
  -- Cleanup seguro: NUNCA apaga compensating
  DELETE FROM public.admin_invite_reservations
  WHERE result_expires_at < v_now AND status <> 'compensating';

  PERFORM pg_advisory_xact_lock(hashtext('reservation:' || p_normalized_email));

  SELECT status, actor_user_id, idempotency_key, processing_expires_at, result_expires_at, lease_token INTO v_rec
  FROM public.admin_invite_reservations
  WHERE normalized_email = p_normalized_email
  FOR UPDATE;

  IF FOUND THEN
    -- Bloqueio absoluto: compensating nunca pode ser sobrescrito pelo fluxo normal
    IF v_rec.status = 'compensating' THEN
      RAISE EXCEPTION 'Convite para este e-mail esta em processo de compensacao de exclusao.' USING ERRCODE = 'P0409';
    END IF;

    IF v_rec.status = 'completed' AND v_rec.result_expires_at > v_now THEN
      IF v_rec.actor_user_id = p_actor_user_id AND v_rec.idempotency_key = p_idempotency_key THEN
        RETURN jsonb_build_object('state', 'completed_by_same_operation');
      ELSE
        RAISE EXCEPTION 'E-mail ja possui convite concluido por outra operacao.' USING ERRCODE = 'P0409';
      END IF;
    END IF;

    IF v_rec.status = 'reserved' AND v_rec.processing_expires_at > v_now THEN
      RAISE EXCEPTION 'Convite para este e-mail ja esta em processamento por outra requisicao.' USING ERRCODE = 'P0409';
    END IF;

    UPDATE public.admin_invite_reservations
    SET actor_user_id = p_actor_user_id,
        idempotency_key = p_idempotency_key,
        lease_token = v_lease,
        compensation_token = NULL,
        status = 'reserved',
        auth_user_id = NULL,
        processing_expires_at = v_proc_exp,
        result_expires_at = CASE WHEN v_rec.result_expires_at > v_now THEN v_rec.result_expires_at ELSE v_res_exp END,
        created_at = v_now
    WHERE normalized_email = p_normalized_email;

    RETURN jsonb_build_object('state', 'reserved', 'lease_token', v_lease);
  END IF;

  INSERT INTO public.admin_invite_reservations (
    normalized_email, lease_token, actor_user_id, idempotency_key, status, processing_expires_at, result_expires_at
  ) VALUES (
    p_normalized_email, v_lease, p_actor_user_id, p_idempotency_key, 'reserved', v_proc_exp, v_res_exp
  );

  RETURN jsonb_build_object('state', 'reserved', 'lease_token', v_lease);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.acquire_admin_invite_reservation(TEXT, UUID, TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_admin_invite_reservation(TEXT, UUID, TEXT, INT, INT) TO service_role;


-- RPC 5: Liberação Explícita de Reserva de Convite
CREATE OR REPLACE FUNCTION public.release_admin_invite_reservation(
  p_normalized_email TEXT,
  p_lease_token      UUID,
  p_actor_user_id    UUID,
  p_idempotency_key  TEXT,
  p_status           TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INT;
BEGIN
  IF p_status NOT IN ('completed', 'failed') THEN
    RAISE EXCEPTION 'Status de liberacao invalido.' USING ERRCODE = 'P0002';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('reservation:' || p_normalized_email));

  UPDATE public.admin_invite_reservations
  SET status = p_status, auth_user_id = NULL
  WHERE normalized_email = p_normalized_email
    AND lease_token = p_lease_token
    AND actor_user_id = p_actor_user_id
    AND idempotency_key = p_idempotency_key
    AND status = 'reserved';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.release_admin_invite_reservation(TEXT, UUID, UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_admin_invite_reservation(TEXT, UUID, UUID, TEXT, TEXT) TO service_role;


-- RPC 6: Vínculo Atômico de auth_user_id Validando Lease Ativo
CREATE OR REPLACE FUNCTION public.bind_admin_invite_auth_user(
  p_normalized_email TEXT,
  p_lease_token      UUID,
  p_actor_user_id    UUID,
  p_idempotency_key  TEXT,
  p_auth_user_id     UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := now();
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('reservation:' || p_normalized_email));

  SELECT status, auth_user_id, processing_expires_at INTO v_rec
  FROM public.admin_invite_reservations
  WHERE normalized_email = p_normalized_email AND lease_token = p_lease_token
    AND actor_user_id = p_actor_user_id AND idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF NOT FOUND OR v_rec.status <> 'reserved' OR v_rec.processing_expires_at <= v_now THEN
    RETURN FALSE;
  END IF;

  IF v_rec.auth_user_id IS NOT NULL AND v_rec.auth_user_id <> p_auth_user_id THEN
    RETURN FALSE;
  END IF;

  UPDATE public.admin_invite_reservations
  SET auth_user_id = p_auth_user_id
  WHERE normalized_email = p_normalized_email AND lease_token = p_lease_token;

  RETURN TRUE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bind_admin_invite_auth_user(TEXT, UUID, UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bind_admin_invite_auth_user(TEXT, UUID, UUID, TEXT, UUID) TO service_role;


-- RPC 7: Commit Administrativo Atômico Vinculado ao Lease
CREATE OR REPLACE FUNCTION public.commit_pending_admin_invite_atomic(
  p_normalized_email TEXT,
  p_lease_token      UUID,
  p_actor_user_id    UUID,
  p_idempotency_key  TEXT,
  p_auth_user_id     UUID,
  p_role             TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_actor_role TEXT;
  v_actor_active BOOLEAN;
  v_actor_accepted TIMESTAMPTZ;
  v_now TIMESTAMPTZ := now();
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('reservation:' || p_normalized_email));

  SELECT status, actor_user_id, idempotency_key, auth_user_id, processing_expires_at
  INTO v_rec
  FROM public.admin_invite_reservations
  WHERE normalized_email = p_normalized_email AND lease_token = p_lease_token
  FOR UPDATE;

  IF NOT FOUND OR v_rec.status <> 'reserved' OR v_rec.processing_expires_at <= v_now THEN
    RAISE EXCEPTION 'Lease expirado ou invalido para commit.' USING ERRCODE = 'P0409';
  END IF;

  IF v_rec.actor_user_id <> p_actor_user_id OR v_rec.idempotency_key <> p_idempotency_key THEN
    RAISE EXCEPTION 'Titularidade da reserva invalida.' USING ERRCODE = '42501';
  END IF;

  IF v_rec.auth_user_id IS NULL OR v_rec.auth_user_id <> p_auth_user_id THEN
    RAISE EXCEPTION 'Auth user id nao vinculado ou divergente.' USING ERRCODE = 'P0002';
  END IF;

  IF p_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Funcao invalida.' USING ERRCODE = 'P0002';
  END IF;

  SELECT role, is_active, accepted_at INTO v_actor_role, v_actor_active, v_actor_accepted
  FROM public.admin_users WHERE user_id = p_actor_user_id;

  IF NOT FOUND OR v_actor_role <> 'admin' OR v_actor_active IS NOT TRUE OR v_actor_accepted IS NULL THEN
    RAISE EXCEPTION 'Acao nao autorizada.' USING ERRCODE = '42501';
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_auth_user_id) THEN
    RAISE EXCEPTION 'Usuario ja possui registro administrativo.' USING ERRCODE = 'P0409';
  END IF;

  INSERT INTO public.admin_users (user_id, role, is_active, accepted_at)
  VALUES (p_auth_user_id, p_role, FALSE, NULL);

  INSERT INTO public.admin_user_audit (target_user_id, actor_user_id, action, new_role)
  VALUES (p_auth_user_id, p_actor_user_id, 'invited', p_role);

  UPDATE public.admin_invite_reservations
  SET status = 'completed', auth_user_id = p_auth_user_id
  WHERE normalized_email = p_normalized_email AND lease_token = p_lease_token;

  RETURN jsonb_build_object('success', true, 'target_user_id', p_auth_user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.commit_pending_admin_invite_atomic(TEXT, UUID, UUID, TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.commit_pending_admin_invite_atomic(TEXT, UUID, UUID, TEXT, UUID, TEXT) TO service_role;


-- RPC 8: Reivindicação Exclusiva de Compensação ('compensating')
CREATE OR REPLACE FUNCTION public.claim_admin_invite_compensation(
  p_normalized_email TEXT,
  p_lease_token      UUID,
  p_actor_user_id    UUID,
  p_idempotency_key  TEXT,
  p_auth_user_id     UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := now();
  v_comp_token UUID := gen_random_uuid();
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('reservation:' || p_normalized_email));

  SELECT status, processing_expires_at, auth_user_id INTO v_rec
  FROM public.admin_invite_reservations
  WHERE normalized_email = p_normalized_email AND lease_token = p_lease_token
    AND actor_user_id = p_actor_user_id AND idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF NOT FOUND OR v_rec.status <> 'reserved' OR v_rec.processing_expires_at <= v_now THEN
    RETURN jsonb_build_object('success', false);
  END IF;

  IF v_rec.auth_user_id IS NULL OR v_rec.auth_user_id <> p_auth_user_id THEN
    RETURN jsonb_build_object('success', false);
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = p_auth_user_id) THEN
    RETURN jsonb_build_object('success', false);
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_user_audit WHERE target_user_id = p_auth_user_id AND action = 'invited') THEN
    RETURN jsonb_build_object('success', false);
  END IF;

  UPDATE public.admin_invite_reservations
  SET status = 'compensating',
      compensation_token = v_comp_token,
      processing_expires_at = (v_now + INTERVAL '30 seconds')
  WHERE normalized_email = p_normalized_email AND lease_token = p_lease_token;

  RETURN jsonb_build_object('success', true, 'compensation_token', v_comp_token);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_admin_invite_compensation(TEXT, UUID, UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_admin_invite_compensation(TEXT, UUID, UUID, TEXT, UUID) TO service_role;


-- RPC 9: Finalização de Compensação Estrita ('compensated')
CREATE OR REPLACE FUNCTION public.finalize_admin_invite_compensation(
  p_normalized_email   TEXT,
  p_compensation_token UUID,
  p_auth_user_id       UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('reservation:' || p_normalized_email));

  UPDATE public.admin_invite_reservations
  SET status = 'compensated', compensation_token = NULL, auth_user_id = NULL
  WHERE normalized_email = p_normalized_email
    AND compensation_token = p_compensation_token
    AND auth_user_id = p_auth_user_id
    AND status = 'compensating';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.finalize_admin_invite_compensation(TEXT, UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_admin_invite_compensation(TEXT, UUID, UUID) TO service_role;


-- RPC 10: Recuperação de Compensação Stale (Lazy Recovery)
CREATE OR REPLACE FUNCTION public.claim_stale_admin_invite_compensation_recovery(
  p_normalized_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := now();
  v_comp_token UUID := gen_random_uuid();
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('reservation:' || p_normalized_email));

  SELECT status, processing_expires_at, auth_user_id INTO v_rec
  FROM public.admin_invite_reservations
  WHERE normalized_email = p_normalized_email
  FOR UPDATE;

  IF NOT FOUND OR v_rec.status <> 'compensating' OR v_rec.processing_expires_at > (v_now - INTERVAL '5 minutes') THEN
    RETURN jsonb_build_object('success', false);
  END IF;

  -- Se commit ocorreu no banco, reconcilia para completed
  IF v_rec.auth_user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = v_rec.auth_user_id) THEN
    UPDATE public.admin_invite_reservations
    SET status = 'completed', compensation_token = NULL
    WHERE normalized_email = p_normalized_email;
    RETURN jsonb_build_object('success', true, 'reconciled_status', 'completed');
  END IF;

  -- Concede novo token de recuperação
  UPDATE public.admin_invite_reservations
  SET compensation_token = v_comp_token, processing_expires_at = (v_now + INTERVAL '30 seconds')
  WHERE normalized_email = p_normalized_email;

  RETURN jsonb_build_object('success', true, 'compensation_token', v_comp_token, 'auth_user_id', v_rec.auth_user_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_stale_admin_invite_compensation_recovery(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_stale_admin_invite_compensation_recovery(TEXT) TO service_role;


-- RPC 11: Aquisição de Lease Persistente de Ação Externa
CREATE OR REPLACE FUNCTION public.acquire_admin_action_lease(
  p_action_key          TEXT,
  p_actor_user_id       UUID,
  p_idempotency_key     TEXT,
  p_processing_ttl_secs INT,
  p_result_ttl_secs     INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := now();
  v_proc_exp TIMESTAMPTZ := v_now + (p_processing_ttl_secs * INTERVAL '1 second');
  v_res_exp  TIMESTAMPTZ := v_now + (p_result_ttl_secs * INTERVAL '1 second');
  v_lease UUID := gen_random_uuid();
BEGIN
  DELETE FROM public.admin_action_leases WHERE result_expires_at < v_now;
  PERFORM pg_advisory_xact_lock(hashtext('action_lease:' || p_action_key));

  SELECT status, actor_user_id, idempotency_key, processing_expires_at, result_expires_at, lease_token INTO v_rec
  FROM public.admin_action_leases WHERE action_key = p_action_key FOR UPDATE;

  IF FOUND THEN
    IF v_rec.status = 'active' AND v_rec.processing_expires_at > v_now THEN
      RAISE EXCEPTION 'Acao em processamento por outra requisicao.' USING ERRCODE = 'P0409';
    END IF;

    UPDATE public.admin_action_leases
    SET actor_user_id = p_actor_user_id, idempotency_key = p_idempotency_key, lease_token = v_lease, status = 'active', processing_expires_at = v_proc_exp, result_expires_at = CASE WHEN v_rec.result_expires_at > v_now THEN v_rec.result_expires_at ELSE v_res_exp END, updated_at = v_now
    WHERE action_key = p_action_key;

    RETURN jsonb_build_object('state', 'acquired', 'lease_token', v_lease);
  END IF;

  INSERT INTO public.admin_action_leases (
    action_key, lease_token, actor_user_id, idempotency_key, status, processing_expires_at, result_expires_at
  ) VALUES (
    p_action_key, v_lease, p_actor_user_id, p_idempotency_key, 'active', v_proc_exp, v_res_exp
  );

  RETURN jsonb_build_object('state', 'acquired', 'lease_token', v_lease);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.acquire_admin_action_lease(TEXT, UUID, TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_admin_action_lease(TEXT, UUID, TEXT, INT, INT) TO service_role;


-- RPC 12: Liberação de Lease Persistente de Ação Externa
CREATE OR REPLACE FUNCTION public.release_admin_action_lease(
  p_action_key  TEXT,
  p_lease_token UUID,
  p_status      TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_updated INT;
BEGIN
  IF p_status NOT IN ('completed', 'failed') THEN
    RAISE EXCEPTION 'Status de conclusao invalido.' USING ERRCODE = 'P0002';
  END IF;

  UPDATE public.admin_action_leases
  SET status = p_status, updated_at = now()
  WHERE action_key = p_action_key AND lease_token = p_lease_token AND status = 'active';

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.release_admin_action_lease(TEXT, UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.release_admin_action_lease(TEXT, UUID, TEXT) TO service_role;


-- RPC 13: Auditoria de Reenvio de Convite
CREATE OR REPLACE FUNCTION public.audit_admin_invite_resent_atomic(
  p_target_user_id UUID,
  p_actor_user_id  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_role TEXT;
  v_actor_active BOOLEAN;
  v_actor_accepted TIMESTAMPTZ;
  v_target_accepted TIMESTAMPTZ;
BEGIN
  SELECT role, is_active, accepted_at INTO v_actor_role, v_actor_active, v_actor_accepted
  FROM public.admin_users WHERE user_id = p_actor_user_id;

  IF NOT FOUND OR v_actor_role <> 'admin' OR v_actor_active IS NOT TRUE OR v_actor_accepted IS NULL THEN
    RAISE EXCEPTION 'Acao nao autorizada.' USING ERRCODE = '42501';
  END IF;

  SELECT accepted_at INTO v_target_accepted FROM public.admin_users WHERE user_id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario alvo nao encontrado.' USING ERRCODE = 'P0003';
  END IF;

  IF v_target_accepted IS NOT NULL THEN
    RAISE EXCEPTION 'Convite ja aceito pelo usuario.' USING ERRCODE = 'P0005';
  END IF;

  INSERT INTO public.admin_user_audit (target_user_id, actor_user_id, action)
  VALUES (p_target_user_id, p_actor_user_id, 'invite_resent');

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.audit_admin_invite_resent_atomic(UUID, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.audit_admin_invite_resent_atomic(UUID, UUID) TO service_role;


-- RPC 14: Aceitar Convite do Próprio Usuário
CREATE OR REPLACE FUNCTION public.accept_admin_invite_atomic(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_accepted TIMESTAMPTZ;
BEGIN
  SELECT accepted_at INTO v_accepted
  FROM public.admin_users WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Registro administrativo nao encontrado.' USING ERRCODE = 'P0003';
  END IF;

  IF v_accepted IS NOT NULL THEN
    RETURN jsonb_build_object('success', true, 'already_accepted', true);
  END IF;

  UPDATE public.admin_users
  SET is_active = TRUE, accepted_at = now(), updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.admin_user_audit (target_user_id, actor_user_id, action, old_is_active, new_is_active)
  VALUES (p_user_id, p_user_id, 'invite_accepted', FALSE, TRUE);

  RETURN jsonb_build_object('success', true, 'already_accepted', false);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.accept_admin_invite_atomic(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_admin_invite_atomic(UUID) TO service_role;


-- RPC 15: Alterar Função (Role) com Proteção do Último Admin
CREATE OR REPLACE FUNCTION public.update_admin_user_role_atomic(
  p_target_user_id UUID,
  p_new_role       TEXT,
  p_actor_user_id  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_role TEXT;
  v_actor_active BOOLEAN;
  v_actor_accepted TIMESTAMPTZ;
  v_target_role TEXT;
  v_target_active BOOLEAN;
  v_target_accepted TIMESTAMPTZ;
  v_active_admins INT;
BEGIN
  IF p_target_user_id = p_actor_user_id THEN
    RAISE EXCEPTION 'Nao e possivel alterar a propria funcao.' USING ERRCODE = 'P0001';
  END IF;

  IF p_new_role NOT IN ('admin', 'editor') THEN
    RAISE EXCEPTION 'Funcao invalida.' USING ERRCODE = 'P0002';
  END IF;

  PERFORM pg_advisory_xact_lock(987654321);

  SELECT role, is_active, accepted_at INTO v_actor_role, v_actor_active, v_actor_accepted
  FROM public.admin_users WHERE user_id = p_actor_user_id;

  IF NOT FOUND OR v_actor_role <> 'admin' OR v_actor_active IS NOT TRUE OR v_actor_accepted IS NULL THEN
    RAISE EXCEPTION 'Acao nao autorizada.' USING ERRCODE = '42501';
  END IF;

  SELECT role, is_active, accepted_at INTO v_target_role, v_target_active, v_target_accepted
  FROM public.admin_users WHERE user_id = p_target_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario alvo nao encontrado.' USING ERRCODE = 'P0003';
  END IF;

  IF v_target_role = p_new_role THEN
    RETURN jsonb_build_object('success', true, 'changed', false, 'role', p_new_role);
  END IF;

  IF v_target_role = 'admin' AND v_target_active IS TRUE AND v_target_accepted IS NOT NULL AND p_new_role = 'editor' THEN
    SELECT COUNT(*) INTO v_active_admins
    FROM public.admin_users WHERE role = 'admin' AND is_active = TRUE AND accepted_at IS NOT NULL;

    IF v_active_admins <= 1 THEN
      RAISE EXCEPTION 'Nao e possivel rebaixar o unico administrador ativo e aceito do sistema.' USING ERRCODE = 'P0004';
    END IF;
  END IF;

  UPDATE public.admin_users SET role = p_new_role, updated_at = now() WHERE user_id = p_target_user_id;

  INSERT INTO public.admin_user_audit (target_user_id, actor_user_id, action, old_role, new_role)
  VALUES (p_target_user_id, p_actor_user_id, 'role_changed', v_target_role, p_new_role);

  RETURN jsonb_build_object('success', true, 'changed', true, 'old_role', v_target_role, 'new_role', p_new_role);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_admin_user_role_atomic(UUID, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_user_role_atomic(UUID, TEXT, UUID) TO service_role;


-- RPC 16: Alterar Status
CREATE OR REPLACE FUNCTION public.update_admin_user_status_atomic(
  p_target_user_id UUID,
  p_is_active      BOOLEAN,
  p_actor_user_id  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_actor_role TEXT;
  v_actor_active BOOLEAN;
  v_actor_accepted TIMESTAMPTZ;
  v_target_role TEXT;
  v_target_active BOOLEAN;
  v_target_accepted TIMESTAMPTZ;
  v_active_admins INT;
  v_action TEXT;
BEGIN
  IF p_target_user_id = p_actor_user_id THEN
    RAISE EXCEPTION 'Nao e possivel alterar o proprio status.' USING ERRCODE = 'P0001';
  END IF;

  PERFORM pg_advisory_xact_lock(987654321);

  SELECT role, is_active, accepted_at INTO v_actor_role, v_actor_active, v_actor_accepted
  FROM public.admin_users WHERE user_id = p_actor_user_id;

  IF NOT FOUND OR v_actor_role <> 'admin' OR v_actor_active IS NOT TRUE OR v_actor_accepted IS NULL THEN
    RAISE EXCEPTION 'Acao nao autorizada.' USING ERRCODE = '42501';
  END IF;

  SELECT role, is_active, accepted_at INTO v_target_role, v_target_active, v_target_accepted
  FROM public.admin_users WHERE user_id = p_target_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario alvo nao encontrado.' USING ERRCODE = 'P0003';
  END IF;

  IF v_target_accepted IS NULL THEN
    RAISE EXCEPTION 'Nao e possivel ativar manualmente um convite pendente. Aguarde o aceite pelo usuario.' USING ERRCODE = 'P0005';
  END IF;

  IF v_target_active = p_is_active THEN
    RETURN jsonb_build_object('success', true, 'changed', false, 'is_active', p_is_active);
  END IF;

  IF v_target_role = 'admin' AND v_target_active IS TRUE AND p_is_active IS FALSE THEN
    SELECT COUNT(*) INTO v_active_admins
    FROM public.admin_users WHERE role = 'admin' AND is_active = TRUE AND accepted_at IS NOT NULL;

    IF v_active_admins <= 1 THEN
      RAISE EXCEPTION 'Nao e possivel desativar o unico administrador ativo e aceito do sistema.' USING ERRCODE = 'P0004';
    END IF;
  END IF;

  UPDATE public.admin_users SET is_active = p_is_active, updated_at = now() WHERE user_id = p_target_user_id;

  v_action := CASE WHEN p_is_active THEN 'activated' ELSE 'deactivated' END;

  INSERT INTO public.admin_user_audit (target_user_id, actor_user_id, action, old_is_active, new_is_active)
  VALUES (p_target_user_id, p_actor_user_id, v_action, v_target_active, p_is_active);

  RETURN jsonb_build_object('success', true, 'changed', true, 'old_is_active', v_target_active, 'new_is_active', p_is_active);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_admin_user_status_atomic(UUID, BOOLEAN, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_admin_user_status_atomic(UUID, BOOLEAN, UUID) TO service_role;


-- RPC 17: Listagem e Busca Paginada de Administradores
CREATE OR REPLACE FUNCTION public.list_admin_users_paginated_atomic(
  p_search_query TEXT DEFAULT NULL,
  p_role         TEXT DEFAULT NULL,
  p_status       TEXT DEFAULT NULL,
  p_page         INT  DEFAULT 1,
  p_limit        INT  DEFAULT 20
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_offset INT := (GREATEST(p_page, 1) - 1) * LEAST(GREATEST(p_limit, 1), 50);
  v_clamped_limit INT := LEAST(GREATEST(p_limit, 1), 50);
  v_total INT := 0;
  v_users JSONB;
  v_active_admins INT := 0;
  v_active_editors INT := 0;
  v_pending_invites INT := 0;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE role = 'admin' AND is_active = TRUE AND accepted_at IS NOT NULL),
    COUNT(*) FILTER (WHERE role = 'editor' AND is_active = TRUE AND accepted_at IS NOT NULL),
    COUNT(*) FILTER (WHERE is_active = FALSE AND accepted_at IS NULL)
  INTO v_active_admins, v_active_editors, v_pending_invites
  FROM public.admin_users;

  SELECT COUNT(*) INTO v_total
  FROM public.admin_users au
  JOIN auth.users u ON au.user_id = u.id
  WHERE (p_search_query IS NULL OR p_search_query = '' OR u.email ILIKE '%' || p_search_query || '%')
    AND (p_role IS NULL OR p_role = 'all' OR au.role = p_role)
    AND (
      p_status IS NULL OR p_status = 'all' OR
      (p_status = 'active' AND au.is_active = TRUE AND au.accepted_at IS NOT NULL) OR
      (p_status = 'inactive' AND au.is_active = FALSE AND au.accepted_at IS NOT NULL) OR
      (p_status = 'pending' AND au.is_active = FALSE AND au.accepted_at IS NULL)
    );

  SELECT jsonb_agg(item) INTO v_users
  FROM (
    SELECT
      au.user_id AS id,
      u.email AS email,
      au.role AS role,
      au.is_active AS is_active,
      au.accepted_at AS accepted_at,
      CASE
        WHEN au.accepted_at IS NULL THEN 'pending'
        WHEN au.is_active = TRUE THEN 'active'
        ELSE 'inactive'
      END AS status,
      au.created_at AS created_at,
      u.invited_at AS invited_at,
      u.last_sign_in_at AS last_sign_in_at
    FROM public.admin_users au
    JOIN auth.users u ON au.user_id = u.id
    WHERE (p_search_query IS NULL OR p_search_query = '' OR u.email ILIKE '%' || p_search_query || '%')
      AND (p_role IS NULL OR p_role = 'all' OR au.role = p_role)
      AND (
        p_status IS NULL OR p_status = 'all' OR
        (p_status = 'active' AND au.is_active = TRUE AND au.accepted_at IS NOT NULL) OR
        (p_status = 'inactive' AND au.is_active = FALSE AND au.accepted_at IS NOT NULL) OR
        (p_status = 'pending' AND au.is_active = FALSE AND au.accepted_at IS NULL)
      )
    ORDER BY au.created_at DESC, au.user_id ASC
    LIMIT v_clamped_limit OFFSET v_offset
  ) item;

  RETURN jsonb_build_object(
    'users', COALESCE(v_users, '[]'::jsonb),
    'pagination', jsonb_build_object(
      'page', GREATEST(p_page, 1),
      'limit', v_clamped_limit,
      'total', v_total,
      'totalPages', CEIL(v_total::NUMERIC / v_clamped_limit)
    ),
    'summary', jsonb_build_object(
      'active_admins', v_active_admins,
      'active_editors', v_active_editors,
      'pending_invites', v_pending_invites
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.list_admin_users_paginated_atomic(TEXT, TEXT, TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_admin_users_paginated_atomic(TEXT, TEXT, TEXT, INT, INT) TO service_role;


-- RPC 18: Consulta de Usuário por E-mail
CREATE OR REPLACE FUNCTION public.get_admin_user_by_email_atomic(
  p_normalized_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_res JSONB;
BEGIN
  SELECT jsonb_build_object(
    'auth_user_id', u.id,
    'email', u.email,
    'email_confirmed_at', u.email_confirmed_at,
    'has_admin_record', (au.user_id IS NOT NULL),
    'role', au.role,
    'is_active', au.is_active,
    'accepted_at', au.accepted_at
  ) INTO v_res
  FROM auth.users u
  LEFT JOIN public.admin_users au ON u.id = au.user_id
  WHERE lower(u.email) = p_normalized_email
  LIMIT 1;

  RETURN v_res;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_admin_user_by_email_atomic(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_user_by_email_atomic(TEXT) TO service_role;
