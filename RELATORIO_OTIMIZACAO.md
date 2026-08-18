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

O backend não mantém mais uma lista fixa de modelos para a geração principal. Antes de cada solicitação, consulta em paralelo os catálogos dos provedores habilitados e seleciona um modelo atualmente disponível, filtrando modelos de conversa/geração e priorizando custo-benefício, produção e compatibilidade com texto, imagem ou PDF.

| Tipo de solicitação | Critério de seleção | Fallback |
|---|---|---|
| Texto | Velocidade, disponibilidade e custo-benefício operacional | Próximo modelo/provedor do ranking dinâmico |
| Imagem | Modelo que o catálogo confirme como visual | Gemini, Groq com visão ou OpenAI com visão, conforme catálogo |
| PDF | Modelo multimodal compatível; sem fingir leitura quando não houver | Contexto textual e próximos provedores |

O catálogo fica em cache por um minuto apenas para evitar quatro consultas repetidas durante a geração dos materiais. Depois disso, o projeto consulta novamente os provedores. Se o catálogo estiver temporariamente indisponível, candidatos de emergência são usados; se um modelo selecionado falhar, o próximo é tentado. Assim, uma mudança de versão ou descontinuação não exige editar novamente o nome do modelo no código.

O frontend informa “IA escolhida automaticamente” antes da resposta e recebe do backend o provedor utilizado. O backend também devolve o modelo selecionado no campo `model`, facilitando diagnóstico sem exibir detalhes técnicos ao professor.

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

`public/index.html` contém a interface simplificada, os quatro módulos ativos, os limites dos prompts em tempo de execução e a compatibilidade com históricos antigos. `api/generate.js` contém a consulta dinâmica de catálogos, o ranking de custo-benefício, os fallbacks e os limites de saída. `PROMPT_IA_BNCC.md` contém o comando pedagógico versionado e revisável. `README.md` documenta a seleção dinâmica e os endpoints de catálogo. `RELATORIO_MODELOS_DINAMICOS.md` detalha a arquitetura e o teste automatizado.

## Referências

[1]: https://ai.google.dev/api/models "Google AI for Developers — Models API"
[2]: https://console.groq.com/docs/models "GroqDocs — Models"
[3]: https://console.groq.com/docs/vision "GroqDocs — Images and Vision"
[4]: https://inference-docs.cerebras.ai/api-reference/models/list-models "Cerebras Inference — List models"
