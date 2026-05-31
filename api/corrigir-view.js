module.exports = async function handler(req, res) {
  const rawId = req.query.id || '';
  const id = rawId.replace(/[^A-Za-z0-9\-]/g, '');

  const css = [
    ':root{--bg:#f4f6fb;--surface:#fff;--surface2:#f0f3fa;--border:#e2e8f4;',
    '--accent:#2563eb;--text:#1e2433;--muted:#7c8499;--green:#059669;--red:#dc2626;}',
    '*{box-sizing:border-box;margin:0;padding:0;}',
    'body{font-family:sans-serif;background:var(--bg);color:var(--text);min-height:100vh;}',
    '.hdr{display:flex;height:52px;}',
    '.h1{flex:1;background:rgb(31,119,150);display:flex;align-items:center;padding:0 16px;}',
    '.h1 b{color:#fff;font-size:15px;margin-right:8px;}.h1 span{color:rgba(255,255,255,.8);font-size:11px;}',
    '.h2{width:80px;background:rgb(230,185,55);}',
    '.h3{width:80px;background:rgb(214,120,40);display:flex;align-items:center;justify-content:center;}',
    '.h3 a{color:#fff;font-size:12px;text-decoration:none;padding:6px 10px;background:rgba(0,0,0,.15);border-radius:6px;}',
    '.main{max-width:500px;margin:0 auto;padding:16px 16px 80px;}',
    '.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px;margin-bottom:14px;}',
    '.info{background:var(--surface2);border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.8;margin-bottom:14px;color:var(--muted);}',
    '.gr{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;margin-bottom:6px;}',
    '.gr.ok{background:rgba(5,150,105,.06);border-color:rgba(5,150,105,.3);}',
    '.gr.no{background:rgba(220,38,38,.06);border-color:rgba(220,38,38,.2);}',
    '.qn{font-size:12px;font-weight:700;color:var(--muted);width:22px;flex-shrink:0;}',
    '.ops{display:flex;gap:5px;flex:1;}',
    '.b{width:36px;height:36px;border-radius:50%;border:2px solid var(--border);background:var(--surface2);',
    'display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;',
    'color:var(--muted);cursor:pointer;-webkit-tap-highlight-color:transparent;user-select:none;}',
    '.b.m{background:var(--text);border-color:var(--text);color:#fff;}',
    '.b.c{background:var(--green);border-color:var(--green);color:#fff;}',
    '.b.e{background:var(--red);border-color:var(--red);color:#fff;}',
    '.st{font-size:18px;width:24px;text-align:center;}',
    '.res{background:linear-gradient(135deg,var(--accent),#1d4ed8);color:#fff;border-radius:16px;',
    'padding:24px;text-align:center;margin-top:14px;display:none;}',
    '.rn{font-size:52px;font-weight:700;line-height:1;}',
    '.rl{font-size:13px;opacity:.85;margin-top:4px;}',
    '.nb{margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.2);}',
    '.nb label{font-size:11px;opacity:.8;display:block;margin-bottom:8px;}',
    '.ni{display:flex;align-items:center;justify-content:center;gap:10px;}',
    '.ni input{width:80px;padding:8px;border:none;border-radius:8px;text-align:center;font-size:16px;font-weight:700;color:var(--text);}',
    '.nv{font-size:30px;font-weight:700;}',
    '.bp{margin-top:16px;padding:12px 24px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.4);',
    'color:#fff;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;}',
    '.ld{text-align:center;padding:60px 20px;}',
    '.sp{width:44px;height:44px;border:4px solid var(--border);border-top-color:var(--accent);',
    'border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 14px;}',
    '@keyframes spin{to{transform:rotate(360deg)}}',
    '.er{text-align:center;padding:40px 20px;color:var(--muted);}'
  ].join('');

  const js = [
    'var L=["A","B","C","D","E"],av=null,rs=[],ID="' + id + '";',
    'function err(m){document.getElementById("ld").style.display="none";',
    'document.getElementById("em").textContent=m||"Avaliacao nao encontrada";',
    'document.getElementById("er").style.display="block";}',
    'function ok(){document.getElementById("ld").style.display="none";',
    'document.getElementById("ct").style.display="block";ri();rg();}',
    'function ri(){var c=av.config,h="";',
    'if(c.comp)h+="<b>"+c.comp+"</b> &middot; "+c.ano;',
    'if(c.turma)h+=" &middot; "+c.turma;',
    'h+=" &middot; "+av.questoes.length+" questoes";',
    'if(c.conteudo)h+="<br><small>"+c.conteudo+"</small>";',
    'document.getElementById("ib").innerHTML=h;}',
    'function rg(){var g=document.getElementById("gd");g.innerHTML="";',
    'av.questoes.forEach(function(q,i){',
    'var r=rs[i],rd=r!=="",ac=r===q.gabarito,row=document.createElement("div");',
    'row.className="gr"+(rd?(ac?" ok":" no"):"");',
    'var bs=L.map(function(l){var c="b";if(r===l)c+=" "+(rd?(ac?"c":"e"):"m");',
    'return"<div class=\\""+c+"\\" onclick=\\"mk("+i+",\'"+l+"\')\\">"+l+"</div>";}).join("");',
    'row.innerHTML="<div class=\\"qn\\">"+(i+1)+"</div><div class=\\"ops\\">"+bs+"</div>",',
    '<div class=\\"st\\">"+(rd?ac?"&#x2705;":"&#x274C;":"")+"</div>";',
    'g.appendChild(row);});}',
    'function mk(i,l){rs[i]=rs[i]===l?"":l;rg();',
    'if(rs.every(function(r){return r!==""}))mr();}',
    'function mr(){var t=av.questoes.length,',
    'a=av.questoes.filter(function(q,i){return rs[i]===q.gabarito;}).length;',
    'document.getElementById("na").textContent=a;',
    'document.getElementById("la").textContent="acertos de "+t;',
    'document.getElementById("res").style.display="block";cn();',
    'document.getElementById("res").scrollIntoView({behavior:"smooth"});}',
    'function cn(){var t=av.questoes.length,',
    'a=av.questoes.filter(function(q,i){return rs[i]===q.gabarito;}).length,',
    'v=parseFloat(document.getElementById("vp").value)||10;',
    'document.getElementById("nf").textContent=((a/t)*v).toFixed(1).replace(".",",");}',
    'function np(){rs=new Array(av.questoes.length).fill("");',
    'document.getElementById("res").style.display="none";rg();window.scrollTo({top:0});}',
    'function load(){',
    'if(!ID){err("ID nao encontrado na URL.");return;}',
    'if(ID.indexOf("LOCAL-")===0){',
    'var g=ID.replace("LOCAL-",""),',
    'qs=g.split("").map(function(x,i){return{enunciado:"Questao "+(i+1),gabarito:x};});',
    'av={id:ID,config:{comp:"",ano:"",turma:"",conteudo:"",qtd:qs.length},questoes:qs};',
    'rs=new Array(qs.length).fill("");ok();return;}',
    'fetch("/api/avaliacao-buscar?id="+encodeURIComponent(ID))',
    '.then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();})',
    '.then(function(d){av=d;rs=new Array(av.questoes.length).fill("");ok();})',
    '.catch(function(e){err("Erro: "+e.message);});}',
    'load();'
  ].join('\n');

  const html = '<!DOCTYPE html><html lang="pt-BR"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">' +
    '<title>Aprende+ | Corrigir Prova</title>' +
    '<style>' + css + '</style></head><body>' +
    '<div class="hdr"><div class="h1"><b>APRENDE+</b><span>Corrigir Prova</span></div>' +
    '<div class="h2"></div><div class="h3"><a href="/avaliacao">Inicio</a></div></div>' +
    '<div class="main">' +
    '<div id="ld" class="ld"><div class="sp"></div><p style="color:var(--muted);font-size:14px;">Carregando...</p></div>' +
    '<div id="er" class="er" style="display:none"><p style="font-size:48px;margin-bottom:12px;">404</p><p id="em">Erro</p></div>' +
    '<div id="ct" style="display:none">' +
    '<div class="info" id="ib"></div>' +
    '<div class="card"><p style="font-size:12px;color:var(--muted);margin-bottom:12px;">Toque na resposta do aluno. Toque novamente para desmarcar.</p>' +
    '<div id="gd"></div></div>' +
    '<div class="res" id="res">' +
    '<div class="rn" id="na">0</div><div class="rl" id="la">acertos</div>' +
    '<div class="nb"><label>Prova vale quantos pontos?</label>' +
    '<div class="ni"><input type="number" id="vp" value="10" min="1" oninput="cn()">' +
    '<span style="opacity:.7;font-size:13px;">pontos</span>' +
    '<div class="nv" id="nf">10,0</div></div></div>' +
    '<button class="bp" onclick="np()">+ Proxima prova</button>' +
    '</div></div></div>' +
    '<script>' + js + '<\/script>' +
    '</body></html>';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
