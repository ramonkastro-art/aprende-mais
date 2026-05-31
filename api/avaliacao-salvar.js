const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // Verifica variáveis de ambiente
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    return res.status(500).json({ error: 'Variáveis SUPABASE_URL ou SUPABASE_KEY não configuradas no Vercel' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  const { questoes, config } = req.body;

  if (!questoes || !config) return res.status(400).json({ error: 'Dados inválidos' });

  const now = new Date();
  const aamm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth()+1).padStart(2,'0')}`;
  const rand = Math.random().toString(36).substring(2,6).toUpperCase();
  const id = `AV-${aamm}-${rand}`;

  try {
    const { data, error } = await supabase
      .from('avaliacoes')
      .insert([{
        id,
        componente: config.comp,
        ano: config.ano,
        turma: config.turma || null,
        nivel: config.nivel,
        conteudo: config.conteudo,
        qtd: config.qtd,
        questoes: JSON.stringify(questoes),
        criado_em: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Supabase insert error:', JSON.stringify(error));
      return res.status(500).json({ error: `Supabase: ${error.message}`, details: error });
    }

    return res.status(200).json({ id, ok: true });

  } catch (e) {
    console.error('Exception:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
