-- ============================================================================
-- MIGRATION 3: SEED TRANSACIONAL IDEMPOTENTE
-- Executada via Supabase MCP após validação dos 9 objetos no R2
-- ============================================================================

DO $$
DECLARE
    v_admin_id UUID;
    v_service_id UUID;
    v_pub_id UUID;
BEGIN
    -- 1. Obter primeiro administrador ativo
    SELECT user_id INTO v_admin_id FROM public.admin_users WHERE role = 'admin' AND is_active = true LIMIT 1;
    IF v_admin_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum administrador ativo encontrado para executar o seed.' USING ERRCODE = 'no_data_found';
    END IF;

    -- 2. Inserir os 7 serviços oficiais (valores com dimensões e arquivos reais)
    INSERT INTO public.services (name, slug, short_description, description, card_image_storage_key, card_image_alt, icon_key, accent_variant, is_active, is_featured, display_order, home_display_order, created_by, updated_by)
    VALUES
    ('Manutenção de Portões de Garagem e Pedestres', 'manutencao-portoes', 'Preventiva e corretiva', 'Manutenção preventiva e corretiva em portões de garagem e pedestres de todos os modelos e marcas, garantindo o perfeito funcionamento, segurança e conforto dos usuários.', 'services/manutencao-portoes.webp', 'Técnicos da A Portamóvel realizando manutenção de portão automático de garagem com veículo de apoio', 'gate', 'blue', true, true, 1, 1, v_admin_id, v_admin_id),
    ('Recuperação, Fabricação e Repintura de Gradis', 'recuperacao-gradis', 'Mais beleza, proteção e valorização', 'Recuperamos e fabricamos gradis danificados por ferrugem, impactos ou desgaste do tempo, com repintura profissional que devolve a beleza, proteção e durabilidade.', 'services/recuperacao-gradis.webp', 'Gradil metálico de condomínio recuperado e repintado', 'fence', 'blue', true, true, 2, 2, v_admin_id, v_admin_id),
    ('Troca de Cabos de Aço por Kit de Corrente', 'kit-corrente-portao', 'Mais segurança, menos ruídos e quebras', 'Substituímos cabos de aço por kits de corrente, reduzindo quebras, ruídos e manutenções frequentes, aumentando a segurança e a durabilidade do portão.', 'services/kit-corrente-portao.webp', 'Kit de corrente e engrenagem para acionamento de portão', 'chain', 'red', true, true, 3, 3, v_admin_id, v_admin_id),
    ('Troca de Trilhos Inferiores e Superiores', 'troca-trilhos', 'Deslizamento suave e alinhamento do sistema', 'A substituição de trilhos desgastados garante o deslizamento suave do portão, evitando desalinhamentos, ruídos e danos aos componentes.', 'services/troca-trilhos.webp', 'Substituição e alinhamento de trilhos para portão deslizante', 'rail', 'blue', true, true, 4, 4, v_admin_id, v_admin_id),
    ('Serralheria em Geral', 'serralheria-geral', 'Reformas, ajustes e fabricações', 'Serviços de serralheria para portões, portas, grades, corrimãos e estruturas metálicas em geral. Recuperação, fabricação e acabamento com qualidade que valorizam o patrimônio do condomínio.', 'services/serralheria-geral.webp', 'Profissional realizando serviço de serralheria com solda', 'welding', 'red', true, true, 5, 5, v_admin_id, v_admin_id),
    ('Portas Corta-Fogo e Estruturas Metálicas', 'portas-corta-fogo', 'Ajustes, manutenção preventiva e adequação às normas', 'Manutenção, ajuste e recuperação de portas corta-fogo, garantindo a conformidade com as normas de segurança e a proteção do seu condomínio.', 'services/portas-corta-fogo.webp', 'Porta corta-fogo para condomínios e edifícios', 'door', 'blue', true, true, 6, 6, v_admin_id, v_admin_id),
    ('Troca de Roldanas Simples por Roldanas Duplas (Truck)', 'roldanas-duplas-truck', 'Maior estabilidade e vida útil', 'A troca proporciona menor desgaste, mais estabilidade e maior vida útil para portões deslizantes, evitando travamentos e manutenções constantes.', 'services/roldanas-duplas-truck.webp', 'Roldanas duplas tipo truck para portões deslizantes pesados', 'roller', 'red', true, true, 7, 7, v_admin_id, v_admin_id)
    ON CONFLICT (slug) DO NOTHING;

    -- 3. Obter ID do serviço de manutenção de portões
    SELECT id INTO v_service_id FROM public.services WHERE slug = 'manutencao-portoes';

    -- 4. Inserir publicação inicial de Antes e Depois como draft
    INSERT INTO public.service_publications (service_id, title, slug, summary, description, status, display_order, created_by, updated_by)
    VALUES (
        v_service_id,
        'Reforma Estrutural e Restauração Completa de Portão Condominial',
        'reforma-estrutural-portao-condominial',
        'Estrutura metálica severamente comprometida por oxidação restaurada com reforço técnico e automatização suave.',
        'Portão totalmente reformado pela A Portamóvel: restauração metálica reforçada, tratamento anti-oxidação, alinhamento de guias e funcionamento automatizado seguro e silencioso.',
        'draft',
        1,
        v_admin_id,
        v_admin_id
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO v_pub_id;

    IF v_pub_id IS NULL THEN
        SELECT id INTO v_pub_id FROM public.service_publications WHERE slug = 'reforma-estrutural-portao-condominial';
    END IF;

    -- 5. Inserir mídias vinculadas com valores reais de arquivos (thumbnail_storage_key = NULL)
    INSERT INTO public.service_media (publication_id, storage_key, media_type, media_stage, mime_type, size_bytes, width, height, duration_seconds, thumbnail_storage_key, alt_text, caption, sort_order, is_cover)
    VALUES (
        v_pub_id, 'videos/antes.mp4', 'video', 'before', 'video/mp4', 9468701, 478, 850, 15.0, NULL,
        'Vídeo do portão oxidado antes da reforma técnica', 'Passo 1: Estado Inicial - Estrutura comprometida por oxidação severa.', 0, false
    ) ON CONFLICT (storage_key) DO NOTHING;

    INSERT INTO public.service_media (publication_id, storage_key, media_type, media_stage, mime_type, size_bytes, width, height, duration_seconds, thumbnail_storage_key, alt_text, caption, sort_order, is_cover)
    VALUES (
        v_pub_id, 'videos/resultado-final.mp4', 'video', 'after', 'video/mp4', 12898014, 848, 478, 20.0, NULL,
        'Vídeo do resultado final da restauração do portão', 'Passo 2: Resultado Final - Portão totalmente recuperado e alinhado.', 1, true
    ) ON CONFLICT (storage_key) DO NOTHING;

    -- 6. Executar RPC de publicação para validar invariantes e ativar
    PERFORM public.publish_publication_atomic(v_pub_id, v_admin_id);
END $$;
