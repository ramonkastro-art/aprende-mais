module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel SMED — Aprende+</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
:root{--bg:#f5f3ee;--surface:#fff;--border:#e0d9d0;--accent:#2563eb;--accent2:#7c3aed;--text:#1a1814;--muted:#78716c;--shadow:0 2px 12px rgba(0,0,0,.07);}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}
header{padding:18px 40px;display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--border);background:rgba(245,243,238,.95);backdrop-filter:blur(12px);position:sticky;top:0;z-index:10;}
.logo-text{font-family:'Fraunces',serif;font-size:22px;font-weight:900;letter-spacing:-1px;}
.logo-text span{color:var(--accent);}
.logo-sub{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:2px;}
.badge-smed{margin-left:auto;padding:5px 14px;background:rgba(37,99,235,.07);border:1px solid rgba(37,99,235,.2);border-radius:20px;font-size:12px;color:var(--accent);font-weight:500;}

/* LOGIN */
#loginScreen{display:flex;align-items:center;justify-content:center;min-height:80vh;}
.login-card{background:#fff;border:1px solid var(--border);border-radius:20px;padding:40px;width:100%;max-width:380px;box-shadow:var(--shadow);text-align:center;}
.login-card h2{font-family:'Fraunces',serif;font-size:24px;font-weight:900;margin-bottom:8px;}
.login-card p{color:var(--muted);font-size:14px;margin-bottom:28px;}
.login-card input{width:100%;padding:14px 16px;border:1px solid var(--border);border-radius:10px;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;background:var(--bg);margin-bottom:14px;transition:border-color .2s;}
.login-card input:focus{border-color:var(--accent);}
.login-card button{width:100%;padding:14px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border:none;border-radius:10px;font-size:16px;font-family:'Fraunces',serif;font-weight:700;cursor:pointer;}
.login-error{color:#dc2626;font-size:13px;margin-top:10px;display:none;}

/* PAINEL */
#painelScreen{display:none;padding:36px 40px 80px;max-width:1100px;margin:0 auto;}
.painel-title{font-family:'Fraunces',serif;font-size:32px;font-weight:900;letter-spacing:-1px;margin-bottom:6px;}
.painel-title span{color:var(--accent);}
.painel-sub{color:var(--muted);font-size:14px;margin-bottom:32px;}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:32px;}
.stat-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:22px 24px;box-shadow:var(--shadow);}
.stat-value{font-family:'Fraunces',serif;font-size:36px;font-weight:900;color:var(--accent);line-height:1;}
.stat-label{font-size:13px;color:var(--muted);margin-top:6px;}
.charts-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:32px;}
.chart-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--shadow);}
.chart-card h3{font-family:'Fraunces',serif;font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text);}
.chart-wrap{position:relative;height:260px;}
.full-width{grid-column:1/-1;}
.table-card{background:#fff;border:1px solid var(--border);border-radius:16px;padding:24px;box-shadow:var(--shadow);margin-bottom:20px;}
.table-card h3{font-family:'Fraunces',serif;font-size:16px;font-weight:700;margin-bottom:16px;}
table{width:100%;border-collapse:collapse;font-size:13px;}
th{text-align:left;padding:10px 14px;background:var(--bg);color:var(--muted);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid var(--border);}
td{padding:10px 14px;border-bottom:1px solid var(--border);color:var(--text);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(37,99,235,.02);}
.loading-painel{text-align:center;padding:60px;color:var(--muted);}
.spinner-sm{width:32px;height:32px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px;}
@keyframes spin{to{transform:rotate(360deg)}}
.periodo-btns{display:flex;gap:8px;margin-bottom:24px;}
.periodo-btn{padding:7px 16px;border:1px solid var(--border);border-radius:20px;background:#fff;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .2s;}
.periodo-btn.active{background:var(--accent);color:#fff;border-color:var(--accent);}
@media(max-width:700px){
  .charts-grid{grid-template-columns:1fr;}
  header{padding:14px 16px;}
  #painelScreen{padding:24px 16px 60px;}
}
</style>
</head>
<body>

<header>
  <div style="display:flex;align-items:center;gap:12px;">
    <img src="data:image/png;base64,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" style="width:48px;height:48px;object-fit:contain;" alt="Aprende+">
    <div>
      <div class="logo-text">Aprende<span>+</span></div>
      <div class="logo-sub">Apoio Pedagógico — Vacaria RS</div>
    </div>
  </div>
  <div class="badge-smed">📊 Painel SMED</div>
</header>

<!-- LOGIN -->
<div id="loginScreen">
  <div class="login-card">
    <h2>Painel de Uso</h2>
    <p>Acesso restrito à Secretaria Municipal de Educação</p>
    <input type="password" id="senhaInput" placeholder="Digite a senha" onkeydown="if(event.key==='Enter')entrar()">
    <button onclick="entrar()">Entrar →</button>
    <div class="login-error" id="loginError">Senha incorreta. Tente novamente.</div>
  </div>
</div>

<!-- PAINEL -->
<div id="painelScreen">
  <div class="loading-painel" id="loadingPainel">
    <div class="spinner-sm"></div>
    Carregando dados...
  </div>

  <div id="painelContent" style="display:none">
    <div class="painel-title">Painel de <span>Uso</span></div>
    <div class="painel-sub" id="painelSub"></div>

    <div class="periodo-btns">
      <button class="periodo-btn active" onclick="setPeriodo(7,this)">7 dias</button>
      <button class="periodo-btn" onclick="setPeriodo(30,this)">30 dias</button>
      <button class="periodo-btn" onclick="setPeriodo(90,this)">3 meses</button>
      <button class="periodo-btn" onclick="setPeriodo(0,this)">Tudo</button>
    </div>

    <div class="stats-grid" id="statsGrid"></div>

    <div class="charts-grid">
      <div class="chart-card">
        <h3>Componentes mais consultados</h3>
        <div class="chart-wrap"><canvas id="chartComponentes"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>Anos / Séries</h3>
        <div class="chart-wrap"><canvas id="chartAnos"></canvas></div>
      </div>
      <div class="chart-card full-width">
        <h3>Consultas por dia</h3>
        <div class="chart-wrap"><canvas id="chartDias"></canvas></div>
      </div>
    </div>

    <div class="table-card">
      <h3>Últimas consultas</h3>
      <table>
        <thead><tr><th>Data</th><th>Componente</th><th>Ano</th><th>Volume</th><th>Página</th></tr></thead>
        <tbody id="tabelaConsultas"></tbody>
      </table>
    </div>
  </div>
</div>

<script>
let allData = [];
let charts = {};
let periodoAtivo = 7;

async function entrar() {
  const senha = document.getElementById('senhaInput').value;
  document.getElementById('loginError').style.display = 'none';

  const res = await fetch('/api/painel?senha=' + encodeURIComponent(senha));
  if (res.status === 401) {
    document.getElementById('loginError').style.display = 'block';
    return;
  }

  allData = await res.json();
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('painelScreen').style.display = 'block';
  renderPainel(periodoAtivo);
}

function setPeriodo(dias, btn) {
  periodoAtivo = dias;
  document.querySelectorAll('.periodo-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPainel(dias);
}

function filtrarPorPeriodo(dados, dias) {
  if (!dias) return dados;
  const limite = new Date();
  limite.setDate(limite.getDate() - dias);
  return dados.filter(d => new Date(d.created_at) >= limite);
}

function renderPainel(dias) {
  const data = filtrarPorPeriodo(allData, dias);
  document.getElementById('loadingPainel').style.display = 'none';
  document.getElementById('painelContent').style.display = 'block';

  const label = dias ? \`Últimos \${dias} dias\` : 'Todo o período';
  document.getElementById('painelSub').textContent = \`\${label} · \${data.length} consultas registradas\`;

  // Stats
  const componentes = [...new Set(data.map(d => d.componente))];
  const hoje = data.filter(d => new Date(d.created_at).toDateString() === new Date().toDateString());
  const semana = filtrarPorPeriodo(allData, 7);

  document.getElementById('statsGrid').innerHTML = \`
    <div class="stat-card"><div class="stat-value">\${data.length}</div><div class="stat-label">Total de consultas</div></div>
    <div class="stat-card"><div class="stat-value">\${hoje.length}</div><div class="stat-label">Consultas hoje</div></div>
    <div class="stat-card"><div class="stat-value">\${semana.length}</div><div class="stat-label">Últimos 7 dias</div></div>
    <div class="stat-card"><div class="stat-value">\${componentes.length}</div><div class="stat-label">Componentes usados</div></div>
  \`;

  // Chart componentes
  const countComp = {};
  data.forEach(d => { countComp[d.componente] = (countComp[d.componente] || 0) + 1; });
  const compSorted = Object.entries(countComp).sort((a,b) => b[1]-a[1]);
  renderChart('chartComponentes', 'bar', compSorted.map(c=>c[0]), compSorted.map(c=>c[1]),
    ['#2563eb','#3b82f6','#60a5fa','#93c5fd','#7c3aed','#a78bfa','#059669','#10b981','#f59e0b','#ef4444']);

  // Chart anos
  const countAnos = {};
  data.forEach(d => { countAnos[d.ano] = (countAnos[d.ano] || 0) + 1; });
  const anosSorted = Object.entries(countAnos).sort((a,b) => a[0].localeCompare(b[0]));
  renderChart('chartAnos', 'doughnut', anosSorted.map(a=>a[0]), anosSorted.map(a=>a[1]),
    ['#2563eb','#7c3aed','#059669','#f59e0b']);

  // Chart dias
  const countDias = {};
  const hoje2 = new Date();
  const numDias = dias || 30;
  for (let i = numDias - 1; i >= 0; i--) {
    const d = new Date(hoje2); d.setDate(d.getDate() - i);
    countDias[d.toLocaleDateString('pt-BR')] = 0;
  }
  data.forEach(d => {
    const key = new Date(d.created_at).toLocaleDateString('pt-BR');
    if (countDias[key] !== undefined) countDias[key]++;
  });
  renderChart('chartDias', 'line', Object.keys(countDias), Object.values(countDias), ['#2563eb']);

  // Tabela
  const tbody = document.getElementById('tabelaConsultas');
  tbody.innerHTML = data.slice(0,50).map(d => \`
    <tr>
      <td>\${new Date(d.created_at).toLocaleString('pt-BR')}</td>
      <td>\${d.componente || '-'}</td>
      <td>\${d.ano || '-'}</td>
      <td>\${d.volume || '-'}</td>
      <td>\${d.pagina || '-'}</td>
    </tr>
  \`).join('');
}

function renderChart(id, type, labels, values, colors) {
  if (charts[id]) charts[id].destroy();
  const ctx = document.getElementById(id).getContext('2d');
  const isLine = type === 'line';
  charts[id] = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: isLine ? 'rgba(37,99,235,.1)' : colors,
        borderColor: isLine ? '#2563eb' : colors,
        borderWidth: isLine ? 2 : 1,
        fill: isLine,
        tension: isLine ? 0.4 : 0,
        pointBackgroundColor: isLine ? '#2563eb' : undefined,
        pointRadius: isLine ? 3 : undefined,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: type === 'doughnut' } },
      scales: type !== 'doughnut' ? {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f0ede8' } },
        x: { grid: { display: false }, ticks: { maxRotation: 45, font: { size: 11 } } }
      } : {}
    }
  });
}
</script>
</body>
</html>
`);
};
