# Aprende+ — Estratégias de aula para todos aprenderem

O Aprende+ é um assistente pedagógico para criar **estratégias de aula claras, práticas e inclusivas** para professores da Educação Básica. O formulário principal foi pensado para ser rápido: o professor informa a disciplina, a turma/ano, a quantidade de períodos e escolhe quais materiais deseja receber.

O conteúdo, objetivo, código BNCC, contexto da turma e foto/PDF são recursos opcionais. Quando forem informados, ajudam a tornar a proposta mais específica; quando não forem, o sistema ainda deve gerar uma sugestão coerente com a disciplina, a turma e o tempo selecionados.

## Funcionalidades principais

A geração oferece quatro materiais independentes: Roteiro de Aula, Estratégias Alternativas, Exercícios para Quadro e Acessibilidade e Inclusão. Exercícios para telas foram incorporados como uma possibilidade breve dentro de Estratégias Alternativas, sempre acompanhados de uma versão no quadro ou em papel. O acompanhamento do avanço deixou de ser um módulo separado para reduzir tempo e extensão do PDF.

O comando interno orienta a IA a usar linguagem simples, instruções em etapas, alternativas de baixo recurso, diferentes formas de participação e apoios pedagógicos para estudantes com diferentes ritmos, formas de comunicação, atenção, leitura, escrita, mobilidade e processamento sensorial. Cada material agora possui limite explícito de palavras para evitar respostas longas e repetitivas. A lógica pedagógica fica no sistema e não é transformada em um questionário para o professor.

A seção `Adicionar conteúdo ou foto/PDF` fica recolhida e é totalmente opcional. O professor pode escrever um tema, anexar uma imagem/PDF ou tirar uma foto, mas também pode gerar sem nenhum desses dados. A mídia é enviada ao backend multimodal quando existir; se o provedor não puder interpretá-la, o sistema não deve inventar o conteúdo. Todos os quatro materiais começam desmarcados para que o professor escolha somente o que precisa.

O gerador de avaliações e suas rotas (`/avaliacao`, `/corrigir` e `/painel`) foram mantidos separados do fluxo principal.

## Campos do fluxo principal

| Campo | Obrigatório? | Função |
|---|---:|---|
| Disciplina | Sim | Define a área e a linguagem da proposta. |
| Turma/ano | Sim | Ajusta a complexidade dos exemplos. |
| Quantidade de períodos | Sim | Dimensiona o tempo da aula. |
| Materiais desejados | Sim | Define quais dos quatro módulos serão gerados; todos começam desmarcados. |
| Conteúdo ou objetivo | Não | Personaliza a aula quando o professor quiser. |
| Foto/PDF | Não | Fornece referência visual ou documental opcional. |

## Estrutura do projeto

```text
aprende-mais/
├── public/
│   ├── index.html        # Frontend principal
│   ├── avaliacao.html    # Interface do gerador de avaliações
│   └── ...
├── api/
│   ├── generate.js       # Geração multimodal com fallbacks
│   ├── avaliacao.js      # Geração de avaliações
│   ├── corrigir.js       # Correção de respostas
│   ├── painel.js         # Registro administrativo
│   └── ...
├── PROMPT_IA_BNCC.md     # Comando pedagógico versionado e revisável
├── vercel.json            # Rotas e rewrites do deploy
├── package.json
├── .gitignore
└── README.md
```

## Como rodar localmente

O projeto usa funções serverless compatíveis com Vercel. Na raiz do projeto, execute:

```bash
npm install
npm install -g vercel
vercel login
vercel dev
```

Depois, acesse `http://localhost:3000`. Configure as variáveis de ambiente em `.env.local` ou na configuração local da Vercel. Nunca versione esse arquivo.

## Variáveis de ambiente

Configure no Vercel, em **Settings → Environment Variables**, somente as chaves utilizadas pela sua operação. O fluxo de geração usa esta ordem de fallback:

| Variável | Uso |
|---|---|
| `GROQ_API_KEY` | Geração de texto sem mídia, como provedor rápido inicial |
| `GEMINI_API_KEY` | Geração de texto e interpretação de imagens/PDFs |
| `CEREBRAS_API_KEY` | Fallback de geração de texto |
| `OPENAI_API_KEY` | Fallback final de geração; também trata imagens como visão |
| `SUPABASE_URL` | Registro administrativo, quando habilitado |
| `SUPABASE_KEY` | Chave do Supabase para o registro administrativo |
| `PAINEL_SENHA` | Proteção do painel administrativo, quando habilitada |

Para o caminho de foto/PDF, recomenda-se manter `GEMINI_API_KEY` configurada, pois o Gemini é o provedor priorizado para interpretar a mídia. Sem essa chave, o sistema pode recorrer aos fallbacks textuais, mas o resultado poderá se basear apenas nos dados escritos pelo professor.

## Provedores e modelos de IA

No modo texto, o backend tenta `Groq → Gemini → Cerebras → OpenAI`. No modo com imagem ou PDF, tenta `Gemini → Groq → OpenAI`. Os modelos configurados são os seguintes:

| Provedor | Modelo configurado | Uso |
|---|---|---|
| Google Gemini | `gemini-3.6-flash` | Primário multimodal e fallback de texto. |
| Groq | `llama-3.3-70b-versatile` | Primeiro provedor no modo texto, priorizando latência. |
| Cerebras | `llama-3.3-70b` | Fallback de texto. |
| OpenAI | `gpt-4o-mini` | Fallback final e tratamento de imagem no formato compatível. |

O Gemini foi atualizado de `gemini-2.5-flash` para `gemini-3.6-flash`, uma versão estável mais recente indicada na [documentação oficial de modelos do Gemini](https://ai.google.dev/gemini-api/docs/models) [1]. Os limites de saída também foram reduzidos para 2.048 tokens por chamada, pois os materiais agora têm limites de palavras próprios. Isso reduz verbosidade e tempo sem impedir a geração dos quatro materiais. O código não usa modelos de raciocínio pesado nem pesquisa na internet para montar aulas, o que evita latência e invenção de fatos atuais.

## Como publicar no GitHub

Dentro da pasta do projeto final:

```bash
git init
git add .
git commit -m "Simplificar gerador de estratégias de aula"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/aprende-mais.git
git push -u origin main
```

Se o repositório já tiver um remoto configurado, substitua apenas o conteúdo dos arquivos e execute `git add`, `git commit` e `git push`.

## Como publicar no Vercel

Importe o repositório no Vercel, mantenha a raiz do projeto como diretório de publicação e adicione as variáveis de ambiente descritas acima. O arquivo `vercel.json` já define os rewrites da página principal, das avaliações, da correção, do painel, do manifesto, do service worker e dos arquivos públicos.

Também é possível publicar pela CLI:

```bash
vercel login
vercel --prod
```

## Referência pedagógica

A redação oficial de códigos e habilidades deve ser conferida na [Base Nacional Comum Curricular do MEC](https://basenacionalcomum.mec.gov.br/abase/). O fluxo principal não exige que o professor informe código ou habilidade para gerar uma boa proposta de aula; esses dados podem ser acrescentados futuramente em uma versão avançada, sem fazer parte do questionário inicial.

## Referências

[1]: https://ai.google.dev/gemini-api/docs/models "Gemini API — Models"

O comando completo usado pelo sistema está em [`PROMPT_IA_BNCC.md`](./PROMPT_IA_BNCC.md). Ele exige linguagem acessível, atividades observáveis, alternativas de baixo recurso e apoios pedagógicos inclusivos sem diagnóstico ou prescrição.

## Segurança

As chaves de API são usadas somente nas funções serverless. O frontend chama as rotas internas e não recebe os segredos. O arquivo `.env.local` deve permanecer no `.gitignore`. Não inclua chaves reais, PDFs de estudantes ou outros dados pessoais no repositório.
