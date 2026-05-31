const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID obrigatório' });

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  const { data, error } = await supabase
    .from('avaliacoes')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Avaliação não encontrada' });

  return res.status(200).json({
    id: data.id,
    config: {
      comp: data.componente,
      ano: data.ano,
      turma: data.turma,
      nivel: data.nivel,
      conteudo: data.conteudo,
      qtd: data.qtd,
      geradaEm: new Date(data.criado_em).toLocaleDateString('pt-BR')
    },
    questoes: JSON.parse(data.questoes)
  });
};
