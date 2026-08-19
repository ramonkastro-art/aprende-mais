const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const ID_RE = /^AV-\d{4}-[A-Z0-9]{4,8}$/;
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const MAX_QUESTIONS = 20;

function localFallback(res, warning = 'Persistência indisponível; a avaliação continua disponível localmente.') {
  // A persistência é complementar: a avaliação já foi gerada no navegador.
  // Retornar 200 evita um erro vermelho no console para uma falha não fatal.
  return res.status(200).json({ ok: true, persisted: false, local: true, warning });
}

function text(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function normalizeQuestions(value, expectedCount) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_QUESTIONS) return null;
  if (Number.isInteger(expectedCount) && value.length !== expectedCount) return null;

  const normalized = value.map((question) => {
    if (!question || typeof question !== 'object' || !question.alternativas || typeof question.alternativas !== 'object') return null;
    const gabarito = text(question.gabarito, 1).toUpperCase();
    if (!LETTERS.includes(gabarito)) return null;

    const alternativas = {};
    for (const letter of LETTERS) {
      alternativas[letter] = text(question.alternativas[letter], 1200);
      if (!alternativas[letter]) return null;
    }

    const enunciado = text(question.enunciado, 3000);
    if (!enunciado) return null;
    return { enunciado, alternativas, gabarito };
  });

  return normalized.every(Boolean) ? normalized : null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const config = body.config && typeof body.config === 'object' ? body.config : null;
  const requestedId = typeof body.id === 'string' ? body.id.trim().toUpperCase() : '';
  const qtd = Number(config && config.qtd);
  const questoes = normalizeQuestions(body.questoes, Number.isInteger(qtd) ? qtd : null);

  if (!config || !questoes || !Number.isInteger(qtd) || qtd < 1 || qtd > MAX_QUESTIONS) {
    return res.status(400).json({ error: 'Dados da avaliação inválidos' });
  }

  const normalizedConfig = {
    comp: text(config.comp, 120),
    ano: text(config.ano, 40),
    turma: text(config.turma, 120) || null,
    nivel: text(config.nivel, 30),
    conteudo: text(config.conteudo, 2000),
    qtd,
  };

  if (!normalizedConfig.comp || !normalizedConfig.ano || !normalizedConfig.nivel || !normalizedConfig.conteudo) {
    return res.status(400).json({ error: 'Configuração da avaliação incompleta' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return localFallback(res);
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const now = new Date();
  const aamm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const id = ID_RE.test(requestedId)
    ? requestedId
    : `AV-${aamm}-${crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8)}`;
  const expiraEm = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const record = {
    id,
    componente: normalizedConfig.comp,
    ano: normalizedConfig.ano,
    turma: normalizedConfig.turma,
    nivel: normalizedConfig.nivel,
    conteudo: normalizedConfig.conteudo,
    qtd: normalizedConfig.qtd,
    questoes: JSON.stringify(questoes),
    criado_em: now.toISOString(),
    expira_em: expiraEm,
  };

  try {
    const query = ID_RE.test(requestedId)
      ? supabase.from('avaliacoes').upsert([record], { onConflict: 'id' })
      : supabase.from('avaliacoes').insert([record]);
    const { error } = await query;

    if (error) {
      console.error('Falha ao persistir avaliação:', JSON.stringify({ code: error.code, message: error.message }));
      return localFallback(res);
    }

    // O registro administrativo não pode transformar um salvamento bem-sucedido em erro.
    try {
      const logResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/consultas`, {
        method: 'POST',
        headers: {
          apikey: process.env.SUPABASE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          componente: normalizedConfig.comp,
          ano: normalizedConfig.ano,
          volume: `${normalizedConfig.qtd} questões`,
          pagina: normalizedConfig.conteudo,
          recursos: JSON.stringify(['avaliacao']),
          tipo: 'avaliacao',
        }),
      });
      if (!logResponse.ok) console.warn('Registro administrativo não foi salvo:', logResponse.status);
    } catch (logError) {
      console.warn('Registro administrativo indisponível:', logError.message);
    }

    return res.status(200).json({ id, ok: true, persisted: true, expiraEm });
  } catch (error) {
    console.error('Exceção ao persistir avaliação:', error.message);
    return localFallback(res);
  }
};
