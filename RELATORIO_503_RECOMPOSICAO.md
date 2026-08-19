# Correção do erro 503 e recomposição de aprendizagem

## Diagnóstico

O erro 503 ocorria quando o catálogo retornava modelos que não estavam disponíveis para a chave utilizada ou quando o modelo escolhido falhava e havia poucas tentativas de fallback. O backend agora mantém os dois melhores candidatos de cada provedor, inclui candidatos de emergência e tenta os próximos antes de retornar erro.

## Alterações pedagógicas

O material principal deixou de se chamar `Roteiro de Aula` e passou a se chamar `Recomposição de Aprendizagem`. O prompt foi reescrito para reconstruir o ponto central do conteúdo que a turma ainda não domina, propor uma sequência objetiva de retomada e verificar a compreensão imediatamente.

O conteúdo ou tema passou a ser obrigatório. A foto ou o PDF continuam opcionais e servem apenas como referência complementar; não substituem o tema escrito pelo professor.

## Alterações de interface

Os materiais começam desmarcados. Ao selecionar uma opção, o cartão recebe fundo azul, texto branco e ícone de confirmação. A alternância foi corrigida para impedir que o comportamento padrão do elemento `label` marque e desmarque a caixa duas vezes.

## Validações

| Cenário | Resultado |
|---|---|
| Backend | Sintaxe aprovada com `node --check`. |
| Catálogo dinâmico | Consulta acontece antes da chamada de geração. |
| Texto | Seleção simulada de Groq e fallback para Cerebras. |
| PDF | Seleção simulada de Gemini por compatibilidade multimodal. |
| Tema vazio | Geração bloqueada com mensagem clara para informar o conteúdo. |
| Seleção visual | Cartão selecionado com `rgb(37, 99, 235)` e classe `checked`. |
| Todos os provedores limitados | Retorno `429`, código `AI_LIMIT` e mensagem amigável. |
| Frontend | Geração local concluída e resultado exibido como Recomposição de Aprendizagem. |

A página de avaliações não foi alterada nesta rodada.

## Validação adicional do PDF

A exportação local após a mudança gerou um PDF de **1 página** e 12.039 bytes. O texto extraído confirmou o título `Recomposição de Aprendizagem` e o rodapé `EnsinAprende+ · 18/08/2026`.
