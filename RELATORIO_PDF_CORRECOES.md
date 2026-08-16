# Relatório de correções do PDF

## Alterações implementadas

O exportador da página principal passou a justificar as linhas internas dos parágrafos, mantendo a última linha de cada parágrafo alinhada à esquerda para preservar a leitura natural. Os subtítulos e títulos permanecem alinhados à esquerda.

O rodapé do PDF foi atualizado para retirar a referência à rede municipal. O formato atual é `EnsinAprende+ · data`, seguido da frase `Execute com autenticidade. Protagonize em sala.` e da identificação `Desenvolvido por Ramon Castro`.

A paginação foi ajustada para desenhar separadores somente entre seções. O exportador não adiciona uma página nova após a última seção, evitando a página final composta apenas por cabeçalho e rodapé.

O backend passou a reconhecer falhas de quota, rate limit, tokens excedidos, contexto excedido e outros limites de uso. Quando todos os provedores falham por limite, a API retorna o código `AI_LIMIT`; quando falham sem indício de limite, retorna `AI_UNAVAILABLE`. O frontend exibe uma mensagem amigável e não revela os erros técnicos dos provedores.

## Validações realizadas

| Cenário | Resultado |
|---|---|
| Roteiro de Aula com texto curto | PDF com 1 página e paginação `1/1`. |
| Roteiro de Aula com parágrafos longos | PDF com 1 página, texto justificado e sem página extra. |
| Quatro seções | PDF com 2 páginas, ambas com conteúdo; nenhuma página vazia ao final. |
| Falha simulada HTTP 429 | Mensagem exibida: `O uso de IA foi excedido ou está temporariamente indisponível. Tente novamente mais tarde.` |
| Sintaxe | `node --check` aprovado no backend e no script principal do frontend. |

A data usada no PDF continua sendo calculada dinamicamente pelo navegador com `toLocaleDateString('pt-BR')`, portanto acompanha a data real do ambiente no momento da exportação.
