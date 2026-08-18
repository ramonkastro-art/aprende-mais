const dotenv = require('dotenv');
dotenv.config();

const OUTPUT_TOKENS = 2048;
const CATALOG_TTL_MS = 60 * 1000;
let catalogCache = { expiresAt: 0, models: [] };

const EMERGENCY_MODELS = {
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash'],
  groq: ['qwen/qwen3.6-27b', 'openai/gpt-oss-20b', 'llama-3.3-70b-versatile'],
  cerebras: ['gpt-oss-120b', 'gemma-4-31b', 'llama-3.3-70b'],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini'],
};

const AI_LIMIT_MESSAGE = 'O uso de IA foi excedido ou está temporariamente indisponível. Tente novamente mais tarde.';
const AI_UNAVAILABLE_MESSAGE = 'As IAs estão temporariamente indisponíveis. Tente novamente mais tarde.';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { userContent, systemPrompt } = req.body || {};
  if (!userContent || !systemPrompt) {
    return res.status(400).json({ error: 'Parâmetros inválidos' });
  }

  const hasImage = Array.isArray(userContent) && userContent.some(part => part.type === 'image');
  const hasPdf = Array.isArray(userContent) && userContent.some(part => part.type === 'document');
  const needsVision = hasImage || hasPdf;
  const errors = [];

  try {
    // A consulta ao catálogo acontece antes da primeira chamada de geração.
    // O cache curto evita quatro consultas repetidas quando uma geração possui vários materiais.
    const candidates = await selectModels({ needsVision, hasPdf });
    console.log('Modelos selecionados dinamicamente:', candidates.map(candidate => `${candidate.provider}/${candidate.model}`).join(', '));

    for (const candidate of candidates) {
      try {
        const text = await callProvider(candidate, userContent, systemPrompt);
        return res.status(200).json({
          text,
          provider: candidate.provider,
          model: candidate.model,
          dynamic: true,
        });
      } catch (error) {
        errors.push(error);
        console.warn(`${candidate.provider}/${candidate.model} falhou:`, error.message);
      }
    }
  } catch (error) {
    errors.push(error);
    console.warn('Consulta de catálogo falhou:', error.message);
  }

  return respondWithAIError(res, errors.length ? errors : [new Error('Nenhum modelo disponível')]);
};

async function selectModels({ needsVision, hasPdf }) {
  const discovered = await discoverModels();
  const usable = discovered.filter(model => model.provider && model.model && process.env[model.key]);
  const selectedByProvider = new Map();

  for (const provider of ['gemini', 'groq', 'cerebras', 'openai']) {
    const providerModels = usable
      .filter(model => model.provider === provider)
      .filter(model => !needsVision || model.vision || provider === 'gemini')
      .sort((a, b) => scoreModel(b, { needsVision, hasPdf }) - scoreModel(a, { needsVision, hasPdf }));

    if (providerModels[0]) selectedByProvider.set(provider, providerModels[0]);
  }

  let selected = Array.from(selectedByProvider.values())
    .sort((a, b) => scoreModel(b, { needsVision, hasPdf }) - scoreModel(a, { needsVision, hasPdf }));

  // Se o catálogo estiver indisponível, mantém um conjunto curto de candidatos de emergência.
  if (selected.length === 0) {
    selected = emergencyCandidates({ needsVision, hasPdf });
  }

  return selected;
}

async function discoverModels() {
  const now = Date.now();
  if (catalogCache.expiresAt > now && catalogCache.models.length) {
    return catalogCache.models;
  }

  const requests = [
    ['gemini', 'GEMINI_API_KEY', listGeminiModels],
    ['groq', 'GROQ_API_KEY', listOpenAICompatibleModels('https://api.groq.com/openai/v1/models', 'GROQ_API_KEY')],
    ['cerebras', 'CEREBRAS_API_KEY', listOpenAICompatibleModels('https://api.cerebras.ai/v1/models', 'CEREBRAS_API_KEY')],
    ['openai', 'OPENAI_API_KEY', listOpenAICompatibleModels('https://api.openai.com/v1/models', 'OPENAI_API_KEY')],
  ];

  const settled = await Promise.allSettled(
    requests
      .filter(([, key]) => Boolean(process.env[key]))
      .map(async ([provider, key, loader]) => ({ provider, key, models: await loader() }))
  );

  const models = [];
  for (const result of settled) {
    if (result.status !== 'fulfilled') continue;
    for (const model of result.value.models) {
      models.push({ ...model, provider: result.value.provider, key: result.value.key });
    }
  }

  if (models.length) {
    catalogCache = { expiresAt: now + CATALOG_TTL_MS, models };
  }
  return models;
}

async function listGeminiModels() {
  const data = await fetchJsonWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`
  );

  return (data.models || [])
    .map(model => ({
      model: String(model.baseModelId || model.name || '').replace(/^models\//, ''),
      vision: Boolean(model.supportedGenerationMethods?.includes('generateContent')),
      production: !/preview|experimental|exp/i.test(String(model.name || '')),
      metadata: `${model.displayName || ''} ${model.description || ''}`,
    }))
    .filter(model => model.model && model.vision && !/embedding|tts|imagen|veo|robotics/i.test(model.model));
}

function listOpenAICompatibleModels(url, key) {
  return async function loadModels() {
    const data = await fetchJsonWithTimeout(url, {
      headers: { Authorization: `Bearer ${process.env[key]}` },
    });

    return (data.data || [])
      .map(model => {
        const id = String(model.id || '');
        return {
          model: id,
          vision: /qwen\/qwen3\.6-27b|vision|gpt-4o|gpt-4\.1|gpt-5/i.test(id),
          production: !/preview|deprecated|whisper|embedding|moderation|tts|image|audio/i.test(id),
          metadata: String(model.owned_by || ''),
        };
      })
      .filter(model => isChatModel(model.model));
  };
}

function isChatModel(model) {
  return /gpt|llama|qwen|gemma|mixtral|mistral|deepseek|command|phi|claude|kimi|moonshot|oss/i.test(model);
}

function scoreModel(candidate, { needsVision, hasPdf }) {
  const id = candidate.model.toLowerCase();
  const provider = candidate.provider;
  let score = 0;

  // Disponibilidade comprovada pelo catálogo é a regra mais importante.
  score += candidate.production ? 30 : 10;

  if (needsVision) {
    if (provider === 'gemini') score += hasPdf ? 130 : 115;
    if (provider === 'groq' && candidate.vision) score += 120;
    if (provider === 'openai' && candidate.vision) score += 100;
    if (provider === 'cerebras') score -= 20;
  } else {
    // Texto: prioriza velocidade/custo operacional e só depois o tamanho do modelo.
    if (provider === 'groq') score += 130;
    if (provider === 'cerebras') score += 120;
    if (provider === 'gemini') score += 110;
    if (provider === 'openai') score += 100;
  }

  // Heurística operacional de custo-benefício: os catálogos não expõem uma tabela
  // de preços uniforme entre provedores, então priorizamos produção, velocidade,
  // tamanho suficiente e modelos econômicos sem congelar tarifas no código.
  if (/flash|mini|small|20b|27b|31b|32b/i.test(id)) score += 22;
  if (/70b|120b|pro|opus|sonnet/i.test(id)) score += 8;
  if (/preview|experimental|exp|deprecated/i.test(id)) score -= 30;
  if (candidate.vision && needsVision) score += 12;

  return score;
}

function emergencyCandidates({ needsVision, hasPdf }) {
  const providers = needsVision
    ? (hasPdf ? ['gemini', 'groq', 'openai', 'cerebras'] : ['groq', 'gemini', 'openai', 'cerebras'])
    : ['groq', 'cerebras', 'gemini', 'openai'];

  return providers.flatMap(provider => {
    if (!process.env[`${provider.toUpperCase()}_API_KEY`]) return [];
    const model = EMERGENCY_MODELS[provider][0];
    return [{ provider, model, key: `${provider.toUpperCase()}_API_KEY`, vision: provider === 'gemini' || provider === 'groq' }];
  });
}

async function callProvider(candidate, userContent, systemPrompt) {
  if (candidate.provider === 'gemini') return callGemini(candidate.model, userContent, systemPrompt);
  if (candidate.provider === 'groq') return callGroq(candidate.model, candidate.vision, userContent, systemPrompt);
  if (candidate.provider === 'cerebras') return callCerebras(candidate.model, userContent, systemPrompt);
  if (candidate.provider === 'openai') return callOpenAI(candidate.model, userContent, systemPrompt);
  throw new Error('Provedor de IA desconhecido');
}

async function callGemini(model, userContent, systemPrompt) {
  const parts = [];
  let textPrompt = '';

  if (typeof userContent === 'string') {
    textPrompt = userContent;
  } else {
    for (const part of userContent) {
      if (part.type === 'text') textPrompt = part.text;
      if (part.type === 'image' || part.type === 'document') {
        parts.push({
          inlineData: {
            mimeType: part.source.media_type,
            data: part.source.data,
          },
        });
      }
    }
  }

  parts.push({ text: systemPrompt + '\n\n' + textPrompt });
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { maxOutputTokens: OUTPUT_TOKENS },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Gemini HTTP ${response.status}`);
  if (data.error) throw new Error(data.error.message);
  if (!data.candidates?.[0]) throw new Error(data.promptFeedback?.blockReason || 'Resposta vazia do Gemini');

  const finishReason = data.candidates[0].finishReason;
  if (finishReason === 'MAX_TOKENS') throw new Error('Limite de tokens excedido');
  if (finishReason && finishReason !== 'STOP') throw new Error(`Gemini encerrou com motivo: ${finishReason}`);

  const text = data.candidates[0].content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini retornou conteúdo vazio');
  return text.trim();
}

async function callGroq(model, vision, userContent, systemPrompt) {
  const parts = [];
  let textPrompt = '';
  let hasImage = false;
  let hasDocument = false;

  if (typeof userContent === 'string') {
    textPrompt = userContent;
  } else {
    for (const part of userContent) {
      if (part.type === 'text') {
        textPrompt += part.text;
        parts.push({ type: 'text', text: part.text });
      }
      if (part.type === 'image') {
        hasImage = true;
        parts.push({
          type: 'image_url',
          image_url: { url: `data:${part.source.media_type};base64,${part.source.data}` },
        });
      }
      if (part.type === 'document') {
        hasDocument = true;
        textPrompt += '\n[PDF enviado: este fallback não interpreta PDF diretamente. Use apenas o contexto textual disponível.]';
      }
    }
  }

  const canReadImage = vision && hasImage && !hasDocument;
  const userMessage = canReadImage
    ? { role: 'user', content: parts }
    : {
        role: 'user',
        content: textPrompt + (hasImage || hasDocument
          ? '\n[O arquivo visual não foi interpretado por este fallback; não invente o conteúdo.]'
          : ''),
      };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: OUTPUT_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        userMessage,
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Groq HTTP ${response.status}`);
  const choice = data.choices?.[0];
  if (choice?.finish_reason === 'length') throw new Error('Limite de tokens excedido');
  if (!choice?.message?.content) throw new Error('Groq retornou resposta vazia');
  return choice.message.content.trim();
}

async function callCerebras(model, userContent, systemPrompt) {
  const textPrompt = flattenUserContent(userContent, '[Imagem ou PDF enviado; este modelo usa apenas o contexto textual disponível.]');
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CEREBRAS_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: OUTPUT_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: textPrompt },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `Cerebras HTTP ${response.status}`);
  const choice = data.choices?.[0];
  if (choice?.finish_reason === 'length') throw new Error('Limite de tokens excedido');
  if (!choice?.message?.content) throw new Error('Cerebras retornou resposta vazia');
  return choice.message.content.trim();
}

async function callOpenAI(model, userContent, systemPrompt) {
  let userMessage;
  if (typeof userContent === 'string') {
    userMessage = { role: 'user', content: userContent };
  } else {
    const parts = [];
    for (const part of userContent) {
      if (part.type === 'text') parts.push({ type: 'text', text: part.text });
      if (part.type === 'image') {
        parts.push({
          type: 'image_url',
          image_url: { url: `data:${part.source.media_type};base64,${part.source.data}` },
        });
      }
      if (part.type === 'document') {
        parts.push({ type: 'text', text: '[PDF enviado. Use a descrição textual disponível.]' });
      }
    }
    userMessage = { role: 'user', content: parts };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: OUTPUT_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        userMessage,
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error?.message || `OpenAI HTTP ${response.status}`);
  const choice = data.choices?.[0];
  if (choice?.finish_reason === 'length') throw new Error('Limite de tokens excedido');
  if (!choice?.message?.content) throw new Error('OpenAI retornou resposta vazia');
  return choice.message.content.trim();
}

function flattenUserContent(userContent, attachmentNote) {
  if (typeof userContent === 'string') return userContent;
  return userContent
    .map(part => part.type === 'text' ? part.text : attachmentNote)
    .join('\n');
}

async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || `Catálogo HTTP ${response.status}`);
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function isLimitError(error) {
  const message = String(error?.message || error || '').toLowerCase();
  return /429|quota|rate.?limit|too many requests|resource exhausted|token|context length|max.?tokens|insufficient_quota|billing|exceed/.test(message);
}

function respondWithAIError(res, errors) {
  const limited = errors.some(isLimitError);
  return res.status(limited ? 429 : 503).json({
    error: limited ? AI_LIMIT_MESSAGE : AI_UNAVAILABLE_MESSAGE,
    code: limited ? 'AI_LIMIT' : 'AI_UNAVAILABLE',
  });
}
