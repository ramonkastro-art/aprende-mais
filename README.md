# Aprende+ 📚

Assistente pedagógico de inglês com IA para professores que utilizam o sistema Aprende Brasil (Grupo Positivo).

## Estrutura do projeto

```
aprende-mais/
├── public/
│   └── index.html        # Frontend completo
├── api/
│   └── generate.js       # Backend serverless (esconde as chaves)
├── .env.local            # Chaves de API (local — não vai ao Git)
├── .gitignore
├── vercel.json
└── README.md
```

## Como rodar localmente

1. Instale o Vercel CLI:
```bash
npm install -g vercel
```

2. Rode o projeto:
```bash
vercel dev
```

3. Acesse `http://localhost:3000`

## Como publicar no Vercel

### 1. Suba para o GitHub
```bash
git init
git add .
git commit -m "primeiro commit"
git remote add origin https://github.com/seu-usuario/aprende-mais.git
git push -u origin main
```

### 2. Configure as variáveis de ambiente no Vercel
No painel do Vercel → Settings → Environment Variables, adicione:

| Nome                | Valor                        |
|---------------------|------------------------------|
| `ANTHROPIC_API_KEY` | sua chave da Anthropic       |
| `GEMINI_API_KEY`    | sua chave do Google Gemini   |

### 3. Faça o deploy
```bash
vercel --prod
```

## Segurança
- As chaves de API ficam **somente no servidor** (variáveis de ambiente do Vercel)
- O arquivo `.env.local` está no `.gitignore` e nunca vai ao repositório
- O frontend nunca tem acesso direto às chaves
