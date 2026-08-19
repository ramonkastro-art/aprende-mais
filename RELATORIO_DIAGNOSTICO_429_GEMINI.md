# Diagnóstico da falha de geração e correção Gemini

## O que estava acontecendo

O site estava devolvendo HTTP 429 com a mensagem de uso de IA excedido. Esse retorno não prova que a conta paga do professor havia excedido quota. O backend classificava como limite qualquer erro cuja mensagem contivesse palavras genéricas como `token`, `exceed` ou `context`, mesmo quando a causa real era modelo inexistente, parâmetro incompatível, chave inválida ou endpoint incompatível.

Além disso, a seleção dinâmica podia escolher um modelo listado no catálogo que não estivesse autorizado para a chave em uso. Quando a primeira tentativa falhava, a rotina seguia por vários candidatos e, ao final, mascarava a causa original como limite.

## Correção aplicada

O `gemini-2.5-flash` voltou a ser a prioridade quando aparece no catálogo oficial e está associado à chave configurada. O `gemini-2.5-flash-lite` é a segunda opção Gemini. O `gemini-2.0-flash` não foi reativado porque está marcado como desligado na documentação atual do Google; o Gemini 1.5 também não foi escolhido como rota de produção recomendada.

O backend continua consultando o catálogo antes da geração, mas agora registra o status HTTP real de cada provedor. A classificação ficou assim:

| Situação | Retorno |
|---|---|
| Todos os provedores respondem 429, quota ou rate limit | HTTP 429 / `AI_LIMIT` |
| Modelo inexistente, API key inválida, acesso negado ou parâmetro incompatível | HTTP 502 / `AI_CONFIGURATION` |
| Indisponibilidade geral, timeout ou erro transitório sem classificação de quota | HTTP 503 / `AI_UNAVAILABLE` |

Uma resposta Gemini que contenha texto parcial não é mais descartada automaticamente só porque terminou por limite de saída. Isso é diferente de quota da conta e pode ser aproveitado pelo professor.

## Verificações

O sandbox não possui as chaves do Vercel do usuário, portanto não foi possível executar uma chamada real com a conta paga. Foram executados testes automatizados com catálogos e respostas simuladas:

| Teste | Resultado |
|---|---|
| Catálogo antes da geração | Aprovado. |
| Primeira escolha textual | `gemini/gemini-2.5-flash`. |
| Falha do Gemini e Groq | Fallback para `cerebras/gpt-oss-120b`. |
| PDF | `gemini/gemini-2.5-flash`. |
| Todos os provedores em 429 | HTTP 429 / `AI_LIMIT`. |
| Modelo inexistente | HTTP 502 / `AI_CONFIGURATION`. |
| Sintaxe | Frontend e backend aprovados com `node --check`. |

## Referências oficiais

[1] [Gemini API — Models](https://ai.google.dev/gemini-api/docs/models)

[2] [Gemini API — Troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting)

[3] [Gemini API — Deprecations](https://ai.google.dev/gemini-api/docs/deprecations)

[4] [Gemini API — Changelog](https://ai.google.dev/gemini-api/docs/changelog)
