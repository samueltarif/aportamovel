# Edição de mídias da publicação

Antes de publicar esta versão, aplique a migração `supabase/migrations/20260930_001_edit_publication_media.sql` no Supabase. Ela cria as operações de edição e substituição com transação e acesso restrito ao servidor.

Para a ordenação por arrastar, aplique também `supabase/migrations/20260930_002_drag_home_publications.sql`. Na lista Trabalhos na home, arraste pelo ícone com mouse ou dedo; ao soltar, a sequência inteira é salva em uma transação. A lista rola automaticamente perto das bordas. As setas do teclado também funcionam quando o ícone está focado. Cancelamento e falha restauram a ordem anterior. Confira em computador e celular e recarregue a página para verificar a persistência.

Em Gerenciar Publicação → Mídias Vinculadas → Editar, é possível alterar texto alternativo, legenda e etapa. Escolher um novo arquivo é opcional. Salvar mídia grava imediatamente; Cancelar descarta a edição. A substituição mantém o ID, a capa, a ordem, os vínculos do carrossel e a descrição da publicação. Fotos são substituídas por fotos; vídeos por vídeos.

A galeria pública mostra somente a legenda informada. O texto alternativo permanece no atributo de acessibilidade da imagem, sem aparecer abaixo dela. Novos uploads sem texto alternativo usam uma descrição genérica, nunca o nome do arquivo.

## Verificação em ambiente conectado

1. Abrir uma publicação com texto alternativo e sem legenda: não deve haver texto abaixo da foto; o atributo `alt` deve continuar preenchido.
2. Editar texto alternativo, legenda e etapa, salvar e reabrir: conferir persistência no painel e na página pública.
3. Substituir a foto de capa em uma publicação com seis mídias: conferir que continuam seis, com mesma posição, capa, textos e descrição da publicação.
4. Cancelar uma edição com arquivo selecionado: a mídia original deve continuar intacta.
5. Tentar arquivo acima do limite ou formato inválido: deve exibir erro e manter a mídia original.
6. Conferir que chamadas sem sessão administrativa são negadas e que uma intenção de upload de outra publicação não pode substituir a mídia.

O arquivo antigo entra na fila existente de limpeza somente após a substituição ser confirmada no banco. A limpeza respeita a verificação de arquivos ainda em uso.
