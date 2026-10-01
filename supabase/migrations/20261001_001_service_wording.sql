-- Atualizar o nome no catálogo dinâmico mantendo os endereços existentes.
UPDATE public.services
SET name = replace(name, 'Recuperação, Fabricação e Repintura', 'Fabricação, Recuperação e Repintura'),
    updated_at = now()
WHERE name LIKE 'Recuperação, Fabricação e Repintura%';
