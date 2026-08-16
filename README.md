# Aprende+ — Ações BNCC entre disciplinas

O Aprende+ é um assistente pedagógico para transformar habilidades da Base Nacional Comum Curricular (BNCC) em **planos de ação práticos**, estratégias alternativas e materiais aplicáveis em diferentes disciplinas. A disciplina em que a aula acontece pode ser diferente do componente curricular associado ao código BNCC. Assim, um professor de Língua Inglesa pode trabalhar uma habilidade de Matemática, por exemplo, usando problemas matemáticos escritos em inglês.

O aplicativo não substitui o diagnóstico pedagógico da rede, o planejamento docente ou a consulta à redação oficial da BNCC. Ele organiza propostas para recomposição e aprofundamento das aprendizagens a partir das informações fornecidas pelo professor.

## Funcionalidades principais

O formulário permite informar o ano/série, a disciplina da aula, o componente curricular do código BNCC, o código, a redação da habilidade, o tema ou evidência do gargalo, a duração, os recursos e o contexto da turma.

A geração pode produzir seis materiais independentes: Plano de Ação BNCC, Estratégias Alternativas, Exercícios para Quadro, Exercícios para Tela, Acessibilidade e Inclusão e Acompanhamento do Avanço. O professor pode desmarcar os materiais de que não precisa.

A aba `Usar foto ou PDF` continua disponível. A mídia é enviada ao backend multimodal como imagem ou documento; quando o provedor principal não puder interpretar a mídia, os fallbacks preservam a consulta textual e informam a limitação ao professor, sem inventar o conteúdo do arquivo. A captura pela câmera permanece disponível.

O gerador de avaliações e suas rotas (`/avaliacao`, `/corrigir` e `/painel`) foram mantidos separados do novo fluxo de ações BNCC.

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

O projeto usa funções serverless compatíveis com Vercel. Instale a CLI e execute:

```bash
npm install -g vercel
vercel dev
```

Depois, acesse `http://localhost:3000`.

Para testar as funções com IA localmente, configure as variáveis de ambiente em um arquivo `.env.local` ou na configuração local da Vercel. Nunca versione esse arquivo.

## Variáveis de ambiente

Configure no Vercel, em **Settings → Environment Variables**, somente as chaves que serão utilizadas pela sua operação. O fluxo de geração usa esta ordem de fallback:

| Variável | Uso |
|---|---|
| `GROQ_API_KEY` | Geração de texto sem mídia, como provedor rápido inicial |
| `GEMINI_API_KEY` | Geração de texto e interpretação de imagens/PDFs |
| `CEREBRAS_API_KEY` | Fallback de geração de texto |
| `OPENAI_API_KEY` | Fallback final de geração; também trata imagens como visão |
| `SUPABASE_URL` | Registro administrativo, quando habilitado |
| `SUPABASE_KEY` | Chave do Supabase para o registro administrativo |
| `PAINEL_SENHA` | Proteção do painel administrativo, quando habilitada |

Para o caminho de foto/PDF, recomenda-se manter `GEMINI_API_KEY` configurada, pois é o provedor priorizado para interpretar a mídia. Sem essa chave, o sistema pode recorrer aos fallbacks textuais, mas o resultado pode ser baseado apenas nos dados escritos pelo professor.

## Como publicar no GitHub

Dentro da pasta do projeto final:

```bash
git init
git add .
git commit -m "Reestruturar gerador para ações BNCC interdisciplinares"
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

A redação oficial da habilidade deve ser conferida pelo professor na [Base Nacional Comum Curricular do MEC](https://basenacionalcomum.mec.gov.br/abase/). O aplicativo permite colar essa redação no campo correspondente para reduzir ambiguidades e orientar a geração com maior precisão.

O comando completo usado pelo backend está versionado em [`PROMPT_IA_BNCC.md`](./PROMPT_IA_BNCC.md). Ele estabelece que o código BNCC é o alvo de aprendizagem, enquanto a disciplina da aula é o meio de acesso, e exige evidências observáveis, alternativa de baixo recurso e apoios pedagógicos inclusivos sem diagnóstico ou prescrição.

## Segurança

As chaves de API são usadas somente nas funções serverless. O frontend chama as rotas internas e não recebe os segredos. O arquivo `.env.local` deve permanecer no `.gitignore`. Não inclua chaves reais, PDFs de estudantes ou outros dados pessoais no repositório.
