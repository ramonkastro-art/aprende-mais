# Seleção dinâmica de modelos — Aprende+

## Objetivo

A geração consulta os catálogos dos provedores habilitados antes de cada solicitação. Para recuperar a estabilidade do fluxo anterior, o backend prioriza `gemini-2.5-flash` quando o catálogo confirma sua disponibilidade e usa `gemini-2.5-flash-lite` como segunda opção Gemini; os demais provedores permanecem como fallback dinâmico.

## Funcionamento

As consultas aos catálogos do Gemini, Groq, Cerebras e OpenAI acontecem em paralelo, com timeout curto. O resultado é filtrado por modelos de conversa/geração e pela existência da chave correspondente no ambiente. Para textos, a pontuação prioriza Gemini 2.5 estável, depois velocidade, disponibilidade e custo-benefício operacional. Para imagem, prioriza modelos que declaram visão. Para PDF, prioriza Gemini 2.5 ou outro modelo que o catálogo permita usar com conteúdo multimodal.

O catálogo fica em cache por um minuto. Esse cache não fixa o modelo: ele apenas evita quatro consultas repetidas durante uma única sequência de materiais. Depois desse período, o projeto consulta novamente os catálogos e pode escolher modelos diferentes sem alteração de código.

Se um catálogo estiver indisponível, entram candidatos de emergência por provedor. Se o primeiro modelo selecionado falhar, o backend tenta o próximo modelo/provedor disponível. Se todos falharem por quota ou rate limit HTTP 429, a API retorna `AI_LIMIT`; se houver modelo inexistente, chave inválida ou parâmetro incompatível, retorna `AI_CONFIGURATION` com HTTP 502; se houver indisponibilidade geral, retorna `AI_UNAVAILABLE` com HTTP 503. O frontend transforma os códigos em mensagens simples para o professor.

## Modelos multimodais

O fluxo de imagem usa o modelo dinâmico quando o catálogo confirmar capacidade visual. O fallback Groq consegue usar imagem quando o modelo selecionado declarar visão; PDFs seguem o caminho Gemini ou são tratados pelos fallbacks apenas com o contexto textual disponível, sem inventar o conteúdo do documento.

## Teste automatizado

O teste `test_dynamic_models.js` valida que o catálogo é consultado antes da geração, que o modo texto prioriza `gemini/gemini-2.5-flash` quando disponível, que falhas de Gemini e Groq direcionam a solicitação para `cerebras/gpt-oss-120b` e que o modo PDF usa Gemini 2.5. Os testes auxiliares de quota e configuração ficam fora do pacote final.

## Referências oficiais

[1]: https://ai.google.dev/api/models "Google AI for Developers — Models API"
[2]: https://console.groq.com/docs/models "GroqDocs — Models"
[3]: https://console.groq.com/docs/vision "GroqDocs — Images and Vision"
[4]: https://inference-docs.cerebras.ai/api-reference/models/list-models "Cerebras Inference — List models"
