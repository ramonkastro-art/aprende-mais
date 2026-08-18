# Seleção dinâmica de modelos — Aprende+

## Objetivo

A geração deixou de depender de um nome fixo de modelo. Antes de cada solicitação, o backend consulta os catálogos dos provedores habilitados, verifica quais modelos estão disponíveis naquele momento e seleciona a melhor opção funcional para o tipo de conteúdo solicitado.

## Funcionamento

As consultas aos catálogos do Gemini, Groq, Cerebras e OpenAI acontecem em paralelo, com timeout curto. O resultado é filtrado por modelos de conversa/geração e pela existência da chave correspondente no ambiente. Para textos, a pontuação prioriza velocidade, disponibilidade e custo-benefício operacional. Para imagem, prioriza modelos que declaram visão. Para PDF, prioriza o Gemini ou outro modelo que o catálogo permita usar com conteúdo multimodal.

O catálogo fica em cache por um minuto. Esse cache não fixa o modelo: ele apenas evita quatro consultas repetidas durante uma única sequência de materiais. Depois desse período, o projeto consulta novamente os catálogos e pode escolher modelos diferentes sem alteração de código.

Se um catálogo estiver indisponível, entram candidatos de emergência por provedor. Se o primeiro modelo selecionado falhar, o backend tenta o próximo modelo/provedor disponível. Se todos falharem por quota, rate limit ou tokens excedidos, a API retorna `AI_LIMIT`; se todos falharem por indisponibilidade geral, retorna `AI_UNAVAILABLE`. O frontend transforma ambos em uma mensagem simples para o professor.

## Modelos multimodais

O fluxo de imagem usa o modelo dinâmico quando o catálogo confirmar capacidade visual. O fallback Groq consegue usar imagem quando o modelo selecionado declarar visão; PDFs seguem o caminho Gemini ou são tratados pelos fallbacks apenas com o contexto textual disponível, sem inventar o conteúdo do documento.

## Teste automatizado

O arquivo temporário `test_dynamic_models.js` validou que o catálogo é consultado antes da geração, que o modo texto seleciona `groq/qwen/qwen3.6-27b` no catálogo simulado e que uma falha desse modelo direciona a solicitação para `cerebras/gpt-oss-120b`. O arquivo de teste não faz parte do pacote final.

## Referências oficiais

[1]: https://ai.google.dev/api/models "Google AI for Developers — Models API"
[2]: https://console.groq.com/docs/models "GroqDocs — Models"
[3]: https://console.groq.com/docs/vision "GroqDocs — Images and Vision"
[4]: https://inference-docs.cerebras.ai/api-reference/models/list-models "Cerebras Inference — List models"
