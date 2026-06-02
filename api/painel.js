const dotenv = require('dotenv');
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const PAINEL_SENHA = process.env.PAINEL_SENHA || 'smed2025';

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    // Verificar senha via query param
    const { senha } = req.query;
    if (senha !== PAINEL_SENHA) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    // Buscar planos de aula
    const r1 = await fetch(
      `${SUPABASE_URL}/rest/v1/consultas?select=componente,ano,volume,pagina,created_at,recursos,tipo&order=created_at.desc&limit=500`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const consultas = await r1.json();

    // Buscar avaliações
    const r2 = await fetch(
      `${SUPABASE_URL}/rest/v1/avaliacoes?select=id,componente,ano,turma,conteudo,qtd,criado_em,expira_em&order=criado_em.desc&limit=500`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const avaliacoes = await r2.json();

    return res.status(200).json({ consultas: Array.isArray(consultas) ? consultas : [], avaliacoes: Array.isArray(avaliacoes) ? avaliacoes : [] });
  }

  if (req.method === 'POST') {
    // Registrar nova consulta
    const { componente, ano, volume, pagina, recursos, tipo } = req.body;
    if (!componente || !ano) return res.status(400).json({ error: 'Dados inválidos' });

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/consultas`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ componente, ano, volume, pagina, recursos, tipo: tipo || 'plano' })
      }
    );
    return res.status(response.ok ? 200 : 500).json({ ok: response.ok });
  }

  res.status(405).json({ error: 'Método não permitido' });
};
