# Relatório de otimização do Aprende+

## 1. Diagnóstico do PDF original

O PDF enviado pelo usuário tinha **31 páginas**, **10.954 palavras** e aproximadamente **258 KB** para uma aula de apenas um período de 50 minutos. O problema principal não era a exportação em si, mas a combinação de seis módulos gerados ao mesmo tempo, todos selecionados por padrão, com instruções extensas e repetição de objetivos, materiais, adaptações e verificações em cada seção.

A estrutura anterior também possuía um módulo independente de exercícios para telas e um módulo de acompanhamento do avanço. Esses módulos ampliavam a resposta sem serem necessários para todas as aulas. A interface dava ao professor uma coleção completa de materiais antes de ele decidir o que realmente precisava.

## 2. Alterações aplicadas

| Alteração | Resultado |
|---|---|
| Exercícios para telas | Removidos como opção independente. A possibilidade de usar tela ou projeção ficou dentro de Estratégias Alternativas, sempre com equivalente no quadro ou em papel. |
| Acompanhamento do avanço | Removido como módulo independente. A verificação imediata da compreensão permanece no Roteiro de Aula e nos Exercícios para Quadro. |
| Seleção dos materiais | Agora existem quatro opções: Roteiro de Aula, Estratégias Alternativas, Exercícios para Quadro e Acessibilidade e Inclusão. |
| Estado inicial | Todas as quatro opções começam desmarcadas. O professor escolhe apenas o que deseja gerar. |
| Limites de texto | Roteiro: até 420 palavras; Estratégias: até 320; Quadro: até 260; Inclusão: até 260. |
| Limite técnico | Os provedores passaram a receber `maxOutputTokens`/`max_tokens` de 2.048 por chamada, reduzindo respostas excessivamente longas. |
| Exportação | O histórico antigo continua podendo exibir módulos legados, mas novas consultas e novos PDFs usam somente os quatro módulos ativos. |
| Foto/PDF | Continua opcional, sem ser exigido para gerar. |

## 3. Auditoria dos provedores e modelos

Antes da alteração, o backend utilizava Gemini 2.5 Flash como provedor multimodal, Groq com `llama-3.3-70b-versatile`, Cerebras com `llama-3.3-70b` e OpenAI com `gpt-4o-mini`. O Gemini recebia até 8.192 tokens e os fallbacks recebiam entre 4.096 e 8.192 tokens, o que permitia respostas maiores do que o necessário.

A versão atualizada troca o modelo Gemini para `gemini-3.6-flash`, listado pela documentação oficial como modelo estável da família Gemini 3 e adequado a tarefas gerais e multimodais [1]. O changelog oficial informa que o Gemini 3.6 Flash foi disponibilizado como versão estável e com melhorias de eficiência de tokens [2]. Os fallbacks foram mantidos para preservar compatibilidade com as variáveis de ambiente já usadas pelo projeto.

| Ordem | Provedor | Modelo atual | Uso |
|---:|---|---|---|
| 1, texto | Groq | `llama-3.3-70b-versatile` | Velocidade para texto sem mídia. |
| 1, mídia | Google Gemini | `gemini-3.6-flash` | Imagem, PDF e texto multimodal. |
| 2, texto/mídia compatível | Google Gemini ou Groq | Conforme disponibilidade | Fallback do modo solicitado. |
| 3, texto | Cerebras | `llama-3.3-70b` | Fallback textual. |
| 4, texto/mídia compatível | OpenAI | `gpt-4o-mini` | Fallback final. |

O frontend agora informa “IA escolhida automaticamente” antes da resposta e atualiza o indicador quando o backend informa o provedor efetivamente utilizado. Isso corrige a indicação anterior que mostrava Gemini mesmo quando o modo texto poderia começar pelo Groq.

Não foi adotado um modelo de raciocínio pesado nem pesquisa automática na internet. Para este produto, isso aumentaria tempo, custo e risco de inserir fatos recentes não verificados. Quando nenhum tema é fornecido, o prompt pede uma proposta geral coerente com disciplina, turma e tempo, sem inventar notícias ou acontecimentos.

## 4. Validação executada

A sintaxe do JavaScript do frontend e das funções serverless foi validada com `node --check`. A interface local foi testada com disciplina, turma e duração preenchidas, sem tema, sem foto e sem PDF. Também foi testado o upload opcional anteriormente preservado.

| Cenário | Páginas | Palavras | Tamanho |
|---|---:|---:|---:|
| PDF original recebido | 31 | 10.954 | 258.484 bytes |
| Um material selecionado, teste local | 1 | 63 | 12.176 bytes |
| Quatro materiais selecionados, teste local | 2 | 157 | 21.486 bytes |

Os dois últimos testes utilizaram o servidor local simulado, portanto comprovam a seleção, renderização e exportação da estrutura. A extensão exata da resposta em produção dependerá do texto retornado pelo provedor, mas o formulário, o prompt e o limite técnico agora restringem fortemente a geração.

## 5. Arquivos alterados

`public/index.html` contém a interface simplificada, os quatro módulos ativos, os limites dos prompts em tempo de execução e a compatibilidade com históricos antigos. `api/generate.js` contém a atualização do modelo Gemini e dos limites de saída. `PROMPT_IA_BNCC.md` contém o comando pedagógico versionado e revisável. `README.md` documenta os módulos atuais, a ordem de fallback e os modelos configurados.

## Referências

[1]: https://ai.google.dev/gemini-api/docs/models "Google AI for Developers — Gemini API Models"

[2]: https://ai.google.dev/gemini-api/docs/changelog "Google AI for Developers — Gemini API Changelog"

[3]: https://console.groq.com/docs/changelog "Groq Documentation — Changelog"
