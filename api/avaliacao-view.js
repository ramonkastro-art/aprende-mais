module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Aprende+ | Gerador de Avaliações</title>
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<style>
:root{
  --bg:#f4f6fb;--surface:#fff;--surface2:#f0f3fa;--border:#e2e8f4;
  --accent:#2563eb;--accent2:#1d4ed8;--text:#1e2433;--muted:#7c8499;
  --green:#059669;--orange:#d97706;--red:#dc2626;
  --tricolor1:rgb(31,119,150);--tricolor2:rgb(230,185,55);--tricolor3:rgb(214,120,40);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}

/* HEADER */
.header{background:var(--accent);color:#fff;padding:0;}
.header-bar{display:flex;height:52px;}
.header-bar .seg{flex:1;display:flex;align-items:center;padding:0 16px;}
.header-bar .seg:nth-child(1){background:var(--tricolor1);}
.header-bar .seg:nth-child(2){background:var(--tricolor2);}
.header-bar .seg:nth-child(3){background:var(--tricolor3);}
.header-bar .seg:nth-child(1) .brand{display:flex;align-items:center;gap:10px;}
.header-bar .seg:nth-child(1) .brand strong{font-size:16px;font-weight:700;color:#fff;}
.header-bar .seg:nth-child(1) .brand span{font-size:10px;color:rgba(255,255,255,.8);}
.header-bar .seg:nth-child(2),.header-bar .seg:nth-child(3){justify-content:flex-end;}
.back-btn{background:rgba(255,255,255,.2);border:none;color:#fff;padding:6px 14px;border-radius:8px;font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;text-decoration:none;}
.back-btn:hover{background:rgba(255,255,255,.3);}

/* NAV TABS */
.nav-tabs{display:flex;background:var(--surface);border-bottom:2px solid var(--border);overflow-x:auto;}
.nav-tab{flex:none;padding:14px 20px;background:none;border:none;border-bottom:3px solid transparent;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;white-space:nowrap;margin-bottom:-2px;transition:all .2s;}
.nav-tab.active{color:var(--accent);border-bottom-color:var(--accent);font-weight:600;}

/* MAIN */
.main{max-width:700px;margin:0 auto;padding:20px 16px 100px;}

/* CARDS */
.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px;}
.card-title{font-size:13px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin-bottom:16px;display:flex;align-items:center;gap:8px;}
.card-title::before{content:'';display:block;width:3px;height:16px;background:var(--accent);border-radius:2px;}

/* FORM */
.field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
.field label{font-size:13px;font-weight:600;color:var(--muted);}
.field select,.field input,.field textarea{
  width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;
  font-family:'DM Sans',sans-serif;font-size:14px;color:var(--text);background:var(--surface);
  transition:border .2s;outline:none;
}
.field select:focus,.field input:focus,.field textarea:focus{border-color:var(--accent);}
.field textarea{resize:vertical;min-height:80px;line-height:1.5;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}

/* BOTÃO GERAR */
.btn-gerar{
  width:100%;padding:16px;background:linear-gradient(135deg,var(--accent),var(--accent2));
  color:#fff;border:none;border-radius:14px;font-family:'DM Sans',sans-serif;
  font-size:16px;font-weight:700;cursor:pointer;
  box-shadow:0 4px 20px rgba(37,99,235,.35);transition:all .2s;
}
.btn-gerar:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(37,99,235,.45);}
.btn-gerar:disabled{opacity:.6;transform:none;cursor:not-allowed;}

/* LOADING */
.loading{text-align:center;padding:40px 20px;display:none;}
.loading-spinner{width:48px;height:48px;border:4px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px;}
@keyframes spin{to{transform:rotate(360deg);}}
.loading p{color:var(--muted);font-size:14px;}

/* QUESTÕES GERADAS */
.questoes-container{display:none;}
.questao-card{background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:18px;margin-bottom:14px;transition:border .2s;}
.questao-card:hover{border-color:var(--accent);}
.questao-num{font-size:12px;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px;}
.questao-enunciado{font-size:14px;line-height:1.6;color:var(--text);margin-bottom:14px;border:none;width:100%;font-family:'DM Sans',sans-serif;resize:vertical;background:transparent;outline:none;padding:0;}
.questao-enunciado:focus{background:var(--surface2);padding:8px;border-radius:8px;}
.alternativas{display:flex;flex-direction:column;gap:6px;}
.alt-row{display:flex;align-items:center;gap:8px;}
.alt-letra{width:28px;height:28px;border-radius:50%;background:var(--surface2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--muted);flex-shrink:0;cursor:pointer;transition:all .2s;}
.alt-letra.correta{background:var(--green);border-color:var(--green);color:#fff;}
.alt-input{flex:1;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);outline:none;padding:4px 0;border-bottom:1px dashed transparent;}
.alt-input:focus{border-bottom-color:var(--border);}
.gabarito-hint{font-size:11px;color:var(--muted);margin-top:10px;display:flex;align-items:center;gap:6px;}
.gabarito-hint span{background:var(--green);color:#fff;border-radius:50%;width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;}

/* ACTIONS */
.actions-bar{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;}
.btn-action{flex:1;min-width:120px;padding:12px 16px;border:none;border-radius:12px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;}
.btn-pdf{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;box-shadow:0 3px 12px rgba(220,38,38,.3);}
.btn-pdf:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(220,38,38,.4);}
.btn-corrigir{background:linear-gradient(135deg,var(--green),#047857);color:#fff;box-shadow:0 3px 12px rgba(5,150,105,.3);}
.btn-corrigir:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(5,150,105,.4);}
.btn-nova{background:var(--surface2);color:var(--muted);border:1.5px solid var(--border);}
.btn-nova:hover{background:var(--border);}

/* TOAST */
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:#1e2433;color:#fff;padding:12px 20px;border-radius:12px;font-size:13px;z-index:999;transition:transform .3s;white-space:nowrap;}
.toast.show{transform:translateX(-50%) translateY(0);}

/* ── ABA CORREÇÃO ── */
.correcao-panel{display:none;}
.info-avaliacao{background:var(--surface2);border-radius:12px;padding:14px 16px;margin-bottom:16px;font-size:13px;color:var(--muted);line-height:1.8;}
.info-avaliacao strong{color:var(--text);}

/* Grade de bolinhas */
.grade-header{display:grid;gap:6px;margin-bottom:8px;}
.grade-row{display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;transition:background .15s;}
.grade-row.acertou{background:rgba(5,150,105,.06);border-color:rgba(5,150,105,.3);}
.grade-row.errou{background:rgba(220,38,38,.06);border-color:rgba(220,38,38,.2);}
.grade-qnum{font-size:12px;font-weight:700;color:var(--muted);width:24px;flex-shrink:0;}
.grade-opcoes{display:flex;gap:6px;flex:1;}
.bolinha{width:34px;height:34px;border-radius:50%;border:2px solid var(--border);background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--muted);cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent;}
.bolinha.marcada{background:var(--text);border-color:var(--text);color:#fff;}
.bolinha.certa{background:var(--green);border-color:var(--green);color:#fff;}
.bolinha.errada{background:var(--red);border-color:var(--red);color:#fff;}
.grade-status{font-size:16px;width:24px;text-align:center;}

/* Resultado */
.resultado-box{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border-radius:16px;padding:24px;text-align:center;margin-top:16px;}
.resultado-acertos{font-size:48px;font-weight:700;line-height:1;}
.resultado-label{font-size:14px;opacity:.85;margin-top:4px;}
.resultado-nota{margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.2);}
.resultado-nota label{font-size:12px;opacity:.8;display:block;margin-bottom:6px;}
.nota-inputs{display:flex;align-items:center;gap:10px;justify-content:center;}
.nota-inputs input{width:80px;padding:8px;border:none;border-radius:8px;text-align:center;font-family:'DM Sans',sans-serif;font-size:16px;font-weight:700;color:var(--text);}
.nota-calculada{font-size:28px;font-weight:700;color:#fff;min-width:80px;}
.btn-nova-correcao{margin-top:16px;padding:12px 24px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.4);color:#fff;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;}
.btn-nova-correcao:hover{background:rgba(255,255,255,.3);}

/* LOADING OVERLAY CORREÇÃO */
.correcao-loading{display:none;text-align:center;padding:32px 16px;}
.correcao-loading.show{display:block;}
.dots{display:inline-flex;gap:6px;margin-top:10px;}
.dots span{width:10px;height:10px;border-radius:50%;background:var(--accent);animation:bounce .8s infinite;}
.dots span:nth-child(2){animation-delay:.15s;}
.dots span:nth-child(3){animation-delay:.3s;}
@keyframes bounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}

/* FOLHA RESPOSTA (impressão) */
@media print{
  body *{visibility:hidden;}
  .print-area,.print-area *{visibility:visible;}
  .print-area{position:absolute;top:0;left:0;width:100%;}
}
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="header-bar">
    <div class="seg">
      <div class="brand">
        <div>
          <strong>APRENDE+</strong><br>
          <span>Gerador de Avaliações</span>
        </div>
      </div>
    </div>
    <div class="seg"></div>
    <div class="seg">
      <a href="/" class="back-btn">← Voltar ao início</a>
    </div>
  </div>
</div>

<!-- NAV TABS -->
<div class="nav-tabs">
  <button class="nav-tab active" onclick="showTab('gerar')">📝 Gerar Avaliação</button>
  <button class="nav-tab" id="tabCorrigir" onclick="showTab('corrigir')">✅ Corrigir pelo Celular</button>
</div>

<div class="main">

  <!-- ══════════ ABA GERAR ══════════ -->
  <div id="tab-gerar">

    <div class="card">
      <div class="card-title">Configurar avaliação</div>

      <div class="grid2">
        <div class="field">
          <label>Ano</label>
          <select id="av-ano">
            <option value="">Selecione...</option>
            <option>1º ano</option><option>2º ano</option><option>3º ano</option>
            <option>4º ano</option><option>5º ano</option><option>6º ano</option>
            <option>7º ano</option><option>8º ano</option><option>9º ano</option>
          </select>
        </div>
        <div class="field">
          <label>Componente</label>
          <select id="av-componente">
            <option value="">Selecione...</option>
            <option>Língua Portuguesa</option><option>Matemática</option>
            <option>Ciências</option><option>História</option><option>Geografia</option>
            <option>Arte</option><option>Educação Física</option>
            <option>Ensino Religioso</option><option>Língua Inglesa</option>
            <option>Filosofia</option>
          </select>
        </div>
      </div>

      <div class="grid2">
        <div class="field">
          <label>Nº de questões</label>
          <select id="av-qtd">
            <option value="10">10 questões</option>
            <option value="20">20 questões</option>
          </select>
        </div>
        <div class="field">
          <label>Nível de dificuldade</label>
          <select id="av-nivel">
            <option value="fácil">Fácil</option>
            <option value="médio" selected>Médio</option>
            <option value="difícil">Difícil</option>
            <option value="misto">Misto</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>Conteúdo / Tópicos avaliados</label>
        <textarea id="av-conteudo" placeholder="Ex: frações, divisão, números decimais... ou cole o título do capítulo do livro"></textarea>
      </div>

      <div class="grid2">
        <div class="field">
          <label>Turma (opcional)</label>
          <input type="text" id="av-turma" placeholder="Ex: 6º ano A">
        </div>
        <div class="field">
          <label>Data da prova (opcional)</label>
          <input type="date" id="av-data">
        </div>
      </div>
    </div>

    <button class="btn-gerar" id="btnGerar" onclick="gerarAvaliacao()">
      ✨ Gerar Avaliação com IA
    </button>

    <!-- LOADING -->
    <div class="loading" id="loading">
      <div class="loading-spinner"></div>
      <p id="loading-msg">A IA está elaborando as questões...</p>
    </div>

    <!-- QUESTÕES -->
    <div class="questoes-container" id="questoesContainer">
      <div class="card" style="margin-top:16px;">
        <div class="card-title">✏️ Revise e edite antes de imprimir</div>
        <p style="font-size:13px;color:var(--muted);margin-bottom:8px;">Clique no enunciado ou nas alternativas para editar. Clique na bolinha da letra para marcar/desmarcar o gabarito.</p>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span id="avIdBadge" style="display:none;background:rgba(37,99,235,.1);color:var(--accent);border-radius:8px;padding:4px 12px;font-size:12px;font-weight:700;"></span>
          <span style="font-size:12px;color:var(--muted);">O QR Code para correção será impresso na folha de respostas.</span>
        </div>
      </div>

      <div id="questoesList"></div>

      <div class="actions-bar">
        <button class="btn-action btn-pdf" onclick="exportarPDF()">📄 Exportar PDF</button>
        <button class="btn-action btn-corrigir" onclick="irParaCorrecao()">✅ Corrigir Provas</button>
        <button class="btn-action btn-nova" onclick="novaAvaliacao()">🔄 Nova Avaliação</button>
      </div>
    </div>

  </div><!-- /tab-gerar -->

  <!-- ══════════ ABA CORRIGIR ══════════ -->
  <div id="tab-corrigir" style="display:none;">

    <div id="semAvaliacao" class="card" style="text-align:center;padding:40px 20px;">
      <div style="font-size:48px;margin-bottom:12px;">📋</div>
      <p style="color:var(--muted);font-size:14px;">Gere uma avaliação primeiro para poder corrigir.</p>
      <button class="btn-action btn-pdf" style="margin-top:16px;max-width:200px;" onclick="showTab('gerar')">← Gerar avaliação</button>
    </div>

    <div id="painelCorrecao" style="display:none;">
      <div class="info-avaliacao" id="infoAvaliacao"></div>

      <div class="card">
        <div class="card-title">Respostas do aluno</div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:14px;">Toque na bolinha da resposta dada pelo aluno. Toque novamente para desmarcar.</p>
        <div id="gradeCorrecao"></div>
      </div>

      <div id="resultadoBox" style="display:none;" class="resultado-box">
        <div class="resultado-acertos" id="numAcertos">0</div>
        <div class="resultado-label" id="labelAcertos">acertos de 10</div>
        <div class="resultado-nota">
          <label>Calcular nota: prova vale</label>
          <div class="nota-inputs">
            <input type="number" id="valorProva" value="10" min="1" max="100" oninput="calcularNota()">
            <span style="opacity:.8;font-size:14px;">pontos →</span>
            <div class="nota-calculada" id="notaFinal">10,0</div>
          </div>
        </div>
        <button class="btn-nova-correcao" onclick="novaCorrecao()">+ Corrigir próxima prova</button>
      </div>
    </div>

  </div><!-- /tab-corrigir -->

</div><!-- /main -->

<div class="toast" id="toast"></div>

<!-- ÁREA DE IMPRESSÃO OCULTA -->
<div id="printArea" style="display:none;"></div>

<script>
// ══════════════════════════════════════════════
// ESTADO GLOBAL
// ══════════════════════════════════════════════
const LETRAS = ['A','B','C','D','E'];
let avaliacaoAtual = null; // { questoes, gabarito, config }
let avaliacaoId = null;    // ID salvo no Supabase ex: AV-2505-X3K2
let respostasAluno = [];   // ['A','','C',...]

// ══════════════════════════════════════════════
// TABS
// ══════════════════════════════════════════════
function showTab(tab) {
  document.getElementById('tab-gerar').style.display = tab === 'gerar' ? '' : 'none';
  document.getElementById('tab-corrigir').style.display = tab === 'corrigir' ? '' : 'none';
  document.querySelectorAll('.nav-tab').forEach((b,i) => {
    b.classList.toggle('active', (tab === 'gerar' && i===0) || (tab === 'corrigir' && i===1));
  });
  if (tab === 'corrigir') setupCorrecao();
}

// ══════════════════════════════════════════════
// GERAR AVALIAÇÃO
// ══════════════════════════════════════════════
async function gerarAvaliacao() {
  const ano = document.getElementById('av-ano').value;
  const comp = document.getElementById('av-componente').value;
  const qtd = document.getElementById('av-qtd').value;
  const nivel = document.getElementById('av-nivel').value;
  const conteudo = document.getElementById('av-conteudo').value.trim();

  if (!ano) { showToast('Selecione o ano'); return; }
  if (!comp) { showToast('Selecione o componente'); return; }
  if (!conteudo) { showToast('Descreva o conteúdo a ser avaliado'); return; }

  document.getElementById('btnGerar').disabled = true;
  document.getElementById('loading').style.display = 'block';
  document.getElementById('questoesContainer').style.display = 'none';

  const msgs = [
    'A IA está elaborando as questões...',
    'Formulando alternativas e gabarito...',
    'Revisando nível de dificuldade...',
    'Finalizando a avaliação...'
  ];
  let mi = 0;
  const msgInterval = setInterval(() => {
    mi = (mi+1) % msgs.length;
    document.getElementById('loading-msg').textContent = msgs[mi];
  }, 2500);

  try {
    const systemPrompt = \`Você é um professor experiente do Ensino Fundamental brasileiro, especialista em elaborar avaliações pedagógicas alinhadas à BNCC.

TAREFA: Gere exatamente \${qtd} questões de múltipla escolha para \${comp} - \${ano} - nível \${nivel}.

REGRAS PEDAGÓGICAS:
- Questões claras, objetivas e adequadas à faixa etária do \${ano}
- Cada questão avalia UMA habilidade específica do conteúdo
- Alternativas incorretas devem ser plausíveis (erros comuns dos alunos)
- Distribua o gabarito: no máximo 25% em cada letra (A/B/C/D/E)
- Nunca repita o gabarito mais de 2 vezes seguidas
- Linguagem simples para anos iniciais (1º-5º), mais técnica para finais (6º-9º)

REGRAS DE FORMATO — CRÍTICO:
- Responda SOMENTE com o JSON abaixo, sem nenhum texto antes ou depois
- Não use markdown, não use blocos de código, não use \\\`\\\`\\\`
- Todas as strings devem usar aspas duplas
- Não deixe vírgula após o último elemento de arrays/objetos
- O campo "gabarito" deve conter APENAS uma letra maiúscula: A, B, C, D ou E

JSON ESPERADO (siga exatamente esta estrutura):
{"questoes":[{"enunciado":"texto da questao","alternativas":{"A":"texto A","B":"texto B","C":"texto C","D":"texto D","E":"texto E"},"gabarito":"C"}]}\`;

    const userContent = \`DADOS DA AVALIAÇÃO:
- Componente: \${comp}
- Ano/Série: \${ano}
- Quantidade de questões: \${qtd}
- Nível de dificuldade: \${nivel}
- Conteúdo/tópicos: \${conteudo}

Gere exatamente \${qtd} questões seguindo as regras. Responda APENAS com o JSON, nenhum texto adicional.\`;

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userContent, systemPrompt })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    // Parse JSON — robusto para Groq (LLaMA) e Gemini
    let parsed;
    try {
      let raw = data.text.trim();
      // Remove markdown code blocks
      raw = raw.replace(/^\`\`\`json\\s*/i,'').replace(/^\`\`\`\\s*/,'').replace(/\\s*\`\`\`$/,'').trim();
      // Extrai só o objeto JSON caso venha com texto ao redor
      const jsonMatch = raw.match(/\\{[\\s\\S]*\\}/);
      if (jsonMatch) raw = jsonMatch[0];
      parsed = JSON.parse(raw);
    } catch(e) {
      // Segunda tentativa: corrige JSON levemente malformado
      try {
        let raw2 = data.text;
        raw2 = raw2.replace(/,\\s*\\}/g,'}').replace(/,\\s*\\]/g,']');
        const m = raw2.match(/\\{[\\s\\S]*\\}/);
        if (!m) throw new Error();
        parsed = JSON.parse(m[0]);
      } catch(e2) {
        throw new Error('A IA não retornou o formato esperado. Tente novamente.');
      }
    }

    if (!parsed.questoes || !Array.isArray(parsed.questoes)) {
      throw new Error('Formato inválido. Tente novamente.');
    }

    avaliacaoAtual = {
      questoes: parsed.questoes,
      config: {
        ano, comp, qtd: parseInt(qtd), nivel, conteudo,
        turma: document.getElementById('av-turma').value,
        data: document.getElementById('av-data').value,
        geradaEm: new Date().toLocaleDateString('pt-BR')
      }
    };

    renderizarQuestoes();
    // Salva no Supabase em background e armazena o ID
    salvarAvaliacao(parsed.questoes, avaliacaoAtual.config);

  } catch(err) {
    showToast('Erro: ' + err.message);
  } finally {
    clearInterval(msgInterval);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('btnGerar').disabled = false;
  }
}

// ══════════════════════════════════════════════
// RENDERIZAR QUESTÕES
// ══════════════════════════════════════════════
function renderizarQuestoes() {
  const list = document.getElementById('questoesList');
  list.innerHTML = '';

  avaliacaoAtual.questoes.forEach((q, qi) => {
    // letras = LETRAS (global)
    const altsHTML = LETRAS.map(l => \`
      <div class="alt-row">
        <div class="alt-letra \${q.gabarito===l ? 'correta':''}" 
             onclick="toggleGabarito(\${qi},'\${l}')" 
             title="Clique para marcar como gabarito">
          \${l}
        </div>
        <input class="alt-input" 
               value="\${(q.alternativas[l]||'').replace(/"/g,'&quot;')}" 
               oninput="avaliacaoAtual.questoes[\${qi}].alternativas['\${l}']=this.value"
               placeholder="Alternativa \${l}">
      </div>
    \`).join('');

    const card = document.createElement('div');
    card.className = 'questao-card';
    card.innerHTML = \`
      <div class="questao-num">Questão \${qi+1}</div>
      <textarea class="questao-enunciado" rows="3"
        oninput="avaliacaoAtual.questoes[\${qi}].enunciado=this.value"
      >\${q.enunciado}</textarea>
      <div class="alternativas">\${altsHTML}</div>
      <div class="gabarito-hint">
        <span>✓</span> Gabarito: <strong>\${q.gabarito}</strong> &nbsp;(clique na letra para alterar)
      </div>
    \`;
    list.appendChild(card);
  });

  document.getElementById('questoesContainer').style.display = 'block';
  document.getElementById('questoesContainer').scrollIntoView({behavior:'smooth',block:'start'});
}

function toggleGabarito(qi, letra) {
  avaliacaoAtual.questoes[qi].gabarito = letra;
  renderizarQuestoes();
}

// ══════════════════════════════════════════════
// CORREÇÃO
// ══════════════════════════════════════════════
function irParaCorrecao() {
  showTab('corrigir');
}

function setupCorrecao() {
  if (!avaliacaoAtual) {
    document.getElementById('semAvaliacao').style.display = 'block';
    document.getElementById('painelCorrecao').style.display = 'none';
    return;
  }
  document.getElementById('semAvaliacao').style.display = 'none';
  document.getElementById('painelCorrecao').style.display = 'block';

  const c = avaliacaoAtual.config;
  document.getElementById('infoAvaliacao').innerHTML = \`
    <strong>\${c.comp}</strong> · \${c.ano}\${c.turma ? ' · '+c.turma:''} · \${c.qtd} questões<br>
    \${c.conteudo}
  \`;

  respostasAluno = new Array(avaliacaoAtual.questoes.length).fill('');
  document.getElementById('resultadoBox').style.display = 'none';
  renderizarGrade();
}

function renderizarGrade() {
  const grade = document.getElementById('gradeCorrecao');
  // Mostra loading brevemente para feedback visual
  grade.innerHTML = '<div class="correcao-loading show"><p style="color:var(--muted);font-size:14px;">Carregando gabarito...</p><div class="dots"><span></span><span></span><span></span></div></div>';
  setTimeout(() => {
    grade.innerHTML = '';
    _renderizarGradeInterno(grade);
  }, 400);
}

function _renderizarGradeInterno(grade) {
  const qtd = avaliacaoAtual.questoes.length;

  avaliacaoAtual.questoes.forEach((q, qi) => {
    // letras = LETRAS (global)
    const resp = respostasAluno[qi];
    const respondeu = resp !== '';
    const acertou = resp === q.gabarito;

    const bolinhas = LETRAS.map(l => {
      let cls = 'bolinha';
      if (resp === l) cls += respondeu ? (acertou ? ' certa' : ' errada') : ' marcada';
      return \`<div class="\${cls}" onclick="marcarResposta(\${qi},'\${l}')">\${l}</div>\`;
    }).join('');

    const status = !respondeu ? '' : acertou ? '✅' : '❌';

    const row = document.createElement('div');
    row.className = \`grade-row\${respondeu ? (acertou?' acertou':' errou') : ''}\`;
    row.id = \`row-\${qi}\`;
    row.innerHTML = \`
      <div class="grade-qnum">\${qi+1}</div>
      <div class="grade-opcoes">\${bolinhas}</div>
      <div class="grade-status">\${status}</div>
    \`;
    grade.appendChild(row);
  });
}

function marcarResposta(qi, letra) {
  // Toggle: se já marcou a mesma, desmarca
  respostasAluno[qi] = respostasAluno[qi] === letra ? '' : letra;
  renderizarGrade();
  verificarCompleto();
}

function verificarCompleto() {
  const respondidas = respostasAluno.filter(r => r !== '').length;
  const total = avaliacaoAtual.questoes.length;
  if (respondidas === total) mostrarResultado();
}

function mostrarResultado() {
  const total = avaliacaoAtual.questoes.length;
  const acertos = avaliacaoAtual.questoes.filter((q,i) => respostasAluno[i] === q.gabarito).length;

  document.getElementById('numAcertos').textContent = acertos;
  document.getElementById('labelAcertos').textContent = \`acertos de \${total}\`;
  document.getElementById('resultadoBox').style.display = 'block';
  calcularNota();
  document.getElementById('resultadoBox').scrollIntoView({behavior:'smooth'});
}

function calcularNota() {
  const total = avaliacaoAtual.questoes.length;
  const acertos = avaliacaoAtual.questoes.filter((q,i) => respostasAluno[i] === q.gabarito).length;
  const valor = parseFloat(document.getElementById('valorProva').value) || 10;
  const nota = (acertos / total) * valor;
  document.getElementById('notaFinal').textContent = nota.toFixed(1).replace('.',',');
}

function novaCorrecao() {
  respostasAluno = new Array(avaliacaoAtual.questoes.length).fill('');
  document.getElementById('resultadoBox').style.display = 'none';
  renderizarGrade();
  window.scrollTo({top:0,behavior:'smooth'});
}

// ══════════════════════════════════════════════
// SALVAR NO SUPABASE
// ══════════════════════════════════════════════
async function salvarAvaliacao(questoes, config) {
  try {
    const res = await fetch('/api/avaliacao-salvar', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ questoes, config })
    });
    const data = await res.json();
    if (data.id) {
      avaliacaoId = data.id;
      // Atualiza badge com o ID
      const badge = document.getElementById('avIdBadge');
      if (badge) { badge.textContent = '🔑 ' + avaliacaoId; badge.style.display = 'inline-flex'; }
      console.log('Avaliação salva:', avaliacaoId);
    }
  } catch(e) { console.warn('Erro ao salvar avaliação:', e); }
}

// ══════════════════════════════════════════════
// EXPORT PDF
// ══════════════════════════════════════════════
async function exportarPDF() {
  if (!avaliacaoAtual) return;
  if (!avaliacaoId) {
    showToast('Aguarde... salvando avaliação');
    await new Promise(r => setTimeout(r, 1500));
    if (!avaliacaoId) { showToast('Erro ao salvar. Tente novamente.'); return; }
  }
  showToast('Gerando PDF...');

  const { jsPDF } = window.jspdf;
  const c = avaliacaoAtual.config;
  const questoes = avaliacaoAtual.questoes;

  // ── PROVA ──
  const doc = new jsPDF({ orientation:'p', unit:'mm', format:'a4' });
  const W = 210, M = 15, cW = W - M*2;
  let y = 0;
  const PAGE_H = 297;
  const FOOTER_H = 18;

  function drawPageHeader(doc, isFirst) {
    const third = W / 3;
    doc.setFillColor(31,119,150);  doc.rect(0,0,third,isFirst?28:14,'F');
    doc.setFillColor(230,185,55);  doc.rect(third,0,third,isFirst?28:14,'F');
    doc.setFillColor(214,120,40);  doc.rect(third*2,0,third+1,isFirst?28:14,'F');
    if (isFirst) {
      doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
      doc.text('APRENDE+ · AVALIAÇÃO', M, 11);
      doc.setFontSize(9); doc.setFont('helvetica','normal');
      doc.text(\`\${c.comp} · \${c.ano}\${c.turma?' · '+c.turma:''} · \${c.qtd} questões · Nível: \${c.nivel}\`, M, 18);
      doc.setFontSize(8);
      doc.text(\`Conteúdo: \${c.conteudo.substring(0,80)}\${c.conteudo.length>80?'...':''}\`, M, 24);
      return 32;
    } else {
      doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(255,255,255);
      doc.text(\`APRENDE+ · \${c.comp} · \${c.ano}\`, M, 9);
      return 18;
    }
  }

  function drawFooter(doc, pg) {
    doc.setFillColor(248,249,252);
    doc.rect(0, PAGE_H-FOOTER_H, W, FOOTER_H, 'F');
    doc.setDrawColor(220,225,235); doc.setLineWidth(0.3);
    doc.line(M, PAGE_H-FOOTER_H, W-M, PAGE_H-FOOTER_H);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(140,148,170);
    doc.text(\`Aprende+ · Rede Municipal de Vacaria-RS · \${c.geradaEm}\`, M, PAGE_H-FOOTER_H+6);
    doc.text(\`Página \${pg}\`, W-M, PAGE_H-FOOTER_H+6, {align:'right'});
  }

  // Cabeçalho identificação do aluno
  y = drawPageHeader(doc, true);
  doc.setDrawColor(200,210,230); doc.setLineWidth(0.3);
  doc.rect(M, y, cW, 16, 'S');
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,110,130);
  doc.text('Nome: _______________________________________________', M+4, y+7);
  doc.text(\`Turma: ________________  Data: \${c.data || '____/____/______'}  Nota: _______\`, M+4, y+13);
  y += 22;

  let pageNum = 1;
  drawFooter(doc, pageNum);

  // letras = LETRAS (global)

  for (let qi = 0; qi < questoes.length; qi++) {
    const q = questoes[qi];
    // Estima altura necessária
    const enuncLines = doc.setFontSize(11) || doc.splitTextToSize(\`\${qi+1}. \${q.enunciado}\`, cW);
    const altLines = LETRAS.reduce((acc,l) => acc + doc.splitTextToSize(\`    \${l}) \${q.alternativas[l]||''}\`, cW-6).length, 0);
    const needed = (enuncLines.length * 5.5) + (altLines * 5) + 12;

    if (y + needed > PAGE_H - FOOTER_H - 5) {
      doc.addPage();
      pageNum++;
      y = drawPageHeader(doc, false);
      drawFooter(doc, pageNum);
    }

    // Enunciado
    doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.setTextColor(25,55,140);
    const numText = \`\${qi+1}.\`;
    doc.text(numText, M, y);
    doc.setFont('helvetica','normal'); doc.setTextColor(30,36,51);
    const enuncText = doc.splitTextToSize(q.enunciado, cW - 8);
    doc.text(enuncText, M+7, y);
    y += enuncText.length * 5.5 + 2;

    // Alternativas
    LETRAS.forEach(l => {
      doc.setFontSize(10); doc.setFont('helvetica','normal'); doc.setTextColor(50,60,80);
      const altText = doc.splitTextToSize(\`\${l}) \${q.alternativas[l]||''}\`, cW-8);
      if (y + altText.length*5 > PAGE_H - FOOTER_H - 5) {
        doc.addPage(); pageNum++;
        y = drawPageHeader(doc, false);
        drawFooter(doc, pageNum);
      }
      doc.text(altText, M+6, y);
      y += altText.length * 5 + 1;
    });
    y += 5;
  }

  // ── Gera QR Code como imagem base64 ──
  let qrDataUrl = null;
  try {
    const qrUrl = 'https://aprendemaisvac.vercel.app/corrigir/' + avaliacaoId;
    const qrCanvas = document.createElement('canvas');
    await new Promise((resolve, reject) => {
      new QRCode(qrCanvas, {
        text: qrUrl, width: 128, height: 128,
        colorDark:'#1e2433', colorLight:'#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
      setTimeout(() => {
        try { qrDataUrl = qrCanvas.toDataURL('image/png'); resolve(); }
        catch(e) { reject(e); }
      }, 300);
    });
  } catch(e) { console.warn('QR Code error:', e); }

  // ── FOLHA DE RESPOSTAS (nova página) ──
  doc.addPage();
  pageNum++;
  y = drawPageHeader(doc, false);
  drawFooter(doc, pageNum);

  // Título
  doc.setFontSize(13); doc.setFont('helvetica','bold'); doc.setTextColor(25,55,140);
  doc.text('FOLHA DE RESPOSTAS', M, y+5);
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(80,90,110);
  doc.text(\`\${c.comp} · \${c.ano} · \${c.qtd} questões\`, M, y+11);
  y += 18;

  // Campo identificação do aluno
  doc.setDrawColor(200,210,230); doc.setLineWidth(0.3);
  doc.rect(M, y, cW, 20, 'S');
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(100,110,130);
  doc.text('Nome: ___________________________________________________', M+4, y+7);
  doc.text(\`Turma: _________________   Data: \${c.data || '____/____/______'}\`, M+4, y+15);
  y += 26;

  // Instrução
  doc.setFontSize(8); doc.setFont('helvetica','italic'); doc.setTextColor(120,130,150);
  doc.text('Instrução: Preencha completamente a bolinha correspondente à sua resposta. Use caneta ou lápis.', M, y);
  y += 8;

  // Grade de bolinhas — layout compacto em 2 colunas
  // letras = LETRAS (global)
  const colW = cW / 2 - 4;
  const rowH = 10;
  const bSize = 5.5; // diâmetro da bolinha
  const bSpacing = 10;

  questoes.forEach((q, qi) => {
    const col = qi % 2;
    const row = Math.floor(qi / 2);
    const bx = M + col * (colW + 8);
    const by = y + row * rowH;

    // Fundo alternado
    doc.setFillColor(col===0 ? 248:252, 249, 254);
    doc.rect(bx, by, colW, rowH-1, 'F');

    // Número da questão
    doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.setTextColor(25,55,140);
    doc.text(\`\${qi+1}\`, bx+2, by+6.8);

    // Bolinhas A-E
    LETRAS.forEach((l, li) => {
      const cx = bx + 14 + li * bSpacing;
      const cy = by + rowH/2;

      // Círculo vazio
      doc.setDrawColor(100,120,160); doc.setLineWidth(0.5);
      doc.setFillColor(255,255,255);
      doc.circle(cx, cy, bSize/2, 'FD');

      // Letra dentro
      doc.setFontSize(6); doc.setFont('helvetica','bold'); doc.setTextColor(80,100,140);
      doc.text(l, cx, cy+2, {align:'center'});
    });
  });

  // Calcula altura total da grade
  const totalRows = Math.ceil(questoes.length / 2);
  y += totalRows * rowH + 10;

  // Legenda
  doc.setFontSize(7); doc.setFont('helvetica','normal'); doc.setTextColor(150,160,180);
  doc.text('● Preencha completamente    ○ Não rasure    ✗ Marque apenas UMA alternativa por questão', M, y);
  y += 10;

  // QR Code + instruções de correção
  if (qrDataUrl) {
    const qrSize = 28;
    const qrX = W - M - qrSize;
    const qrY = y;
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(25,55,140);
    doc.text('Correção pelo celular:', M, qrY + 6);
    doc.setFont('helvetica','normal'); doc.setTextColor(80,90,110);
    doc.text('1. Abra a câmera ou leitor de QR Code', M, qrY + 12);
    doc.text('2. Aponte para o código ao lado', M, qrY + 18);
    doc.text('3. Marque as respostas e calcule a nota', M, qrY + 24);
    doc.setFontSize(7); doc.setTextColor(150,160,180);
    doc.text('Código: ' + avaliacaoId, M, qrY + 30);
  }

  doc.save(\`Avaliacao_\${c.comp.replace(/\\s/g,'_')}_\${c.ano}_\${c.geradaEm.replace(/\\//g,'-')}.pdf\`);
  showToast('PDF gerado com sucesso!');
}

// ══════════════════════════════════════════════
// UTILITÁRIOS
// ══════════════════════════════════════════════
function novaAvaliacao() {
  avaliacaoAtual = null;
  document.getElementById('questoesContainer').style.display = 'none';
  document.getElementById('av-conteudo').value = '';
  window.scrollTo({top:0,behavior:'smooth'});
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
</script>
</body>
</html>
`);
};
