const { createClient } = require('@supabase/supabase-js');

const ID_RE = /^AV-\d{4}-[A-Z0-9]{4,8}$/;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const rawId = typeof req.query?.id === 'string' ? req.query.id.trim().toUpperCase() : '';
  if (!ID_RE.test(rawId)) return res.status(400).json({ error: 'ID de avaliação inválido' });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return res.status(503).json({ error: 'Persistência de avaliações indisponível' });
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data, error } = await supabase
      .from('avaliacoes')
      .select('*')
      .eq('id', rawId)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Avaliação não encontrada' });
    if (data.expira_em && new Date(data.expira_em).getTime() <= Date.now()) {
      return res.status(404).json({ error: 'Esta avaliação expirou' });
    }

    let questoes;
    try {
      questoes = typeof data.questoes === 'string' ? JSON.parse(data.questoes) : data.questoes;
    } catch (parseError) {
      console.error('JSON de avaliação corrompido:', parseError.message);
      return res.status(500).json({ error: 'Dados da avaliação corrompidos' });
    }
    if (!Array.isArray(questoes) || questoes.length === 0 || questoes.length > 20) {
      return res.status(500).json({ error: 'Dados da avaliação inválidos' });
    }

    return res.status(200).json({
      id: data.id,
      config: {
        comp: data.componente,
        ano: data.ano,
        turma: data.turma,
        nivel: data.nivel,
        conteudo: data.conteudo,
        qtd: data.qtd,
        geradaEm: data.criado_em ? new Date(data.criado_em).toLocaleDateString('pt-BR') : '',
      },
      questoes,
    });
  } catch (error) {
    console.error('Falha ao buscar avaliação:', error.message);
    return res.status(500).json({ error: 'Não foi possível carregar a avaliação' });
  }
};
