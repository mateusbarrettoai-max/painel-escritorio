/* Painel do Escritório — versão preliminar
   Integra: Projetos · Financeiro · Instagram · Mídia
   Os dados ficam no localStorage do navegador (exportáveis em JSON). */

const KEY = 'painel-escritorio-v1';
const uid = () => Math.random().toString(36).slice(2, 10);
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (n, base = new Date()) => { const d = new Date(base); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fmtDate = s => s ? new Date(s + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—';
const daysUntil = s => Math.round((new Date(s + 'T12:00') - new Date(today() + 'T12:00')) / 864e5);

/* ---------- Estado ---------- */
const STAGES = { ideia: 'Ideia', aFazer: 'A fazer', andamento: 'Em andamento', revisao: 'Revisão', concluido: 'Concluído' };
const PROJ_COLS = ['aFazer', 'andamento', 'revisao', 'concluido'];
const POST_STATUS = { ideia: ['Ideia', ''], producao: ['Em produção', 'amber'], agendado: ['Agendado', 'accent'], publicado: ['Publicado', 'green'] };
const POST_TYPES = ['Feed', 'Carrossel', 'Reels', 'Stories'];
const MEDIA_TYPES = { imagem: '🖼️', video: '🎬', documento: '📄', logo: '✨', outro: '📁' };
const FIN_CATS = ['Honorários', 'Consultoria', 'Anúncios', 'Software', 'Aluguel', 'Equipe', 'Impostos', 'Material', 'Outros'];

function seed() {
  const p1 = uid(), p2 = uid(), p3 = uid(), m1 = uid(), m2 = uid(), m3 = uid();
  return {
    settings: { name: 'Painel do Escritório', currency: 'BRL', instagram: '@seuescritorio', demo: true },
    projects: [
      { id: p1, title: 'Identidade visual — Café Aurora', client: 'Café Aurora', status: 'andamento', due: addDays(6), value: 4800, progress: 60, notes: 'Entregar 3 propostas de logo.' },
      { id: p2, title: 'Campanha de lançamento', client: 'Studio Lume', status: 'aFazer', due: addDays(14), value: 3200, progress: 0, notes: '' },
      { id: p3, title: 'Gestão de redes — mensal', client: 'Clínica Viva', status: 'revisao', due: addDays(2), value: 1800, progress: 90, notes: 'Relatório do mês.' },
      { id: uid(), title: 'Site institucional', client: 'Marcenaria Pinho', status: 'concluido', due: addDays(-5), value: 6500, progress: 100, notes: '' },
    ],
    finance: [
      { id: uid(), type: 'entrada', desc: 'Sinal — identidade visual', amount: 2400, date: addDays(-8), category: 'Honorários', paid: true, projectId: p1 },
      { id: uid(), type: 'entrada', desc: 'Parcela final — identidade visual', amount: 2400, date: addDays(7), category: 'Honorários', paid: false, projectId: p1 },
      { id: uid(), type: 'entrada', desc: 'Mensalidade redes sociais', amount: 1800, date: addDays(3), category: 'Consultoria', paid: false, projectId: p3 },
      { id: uid(), type: 'saida', desc: 'Aluguel do escritório', amount: 1500, date: addDays(-12), category: 'Aluguel', paid: true, projectId: '' },
      { id: uid(), type: 'saida', desc: 'Assinatura Canva / Adobe', amount: 180, date: addDays(-3), category: 'Software', paid: true, projectId: '' },
      { id: uid(), type: 'saida', desc: 'Impulsionamento Instagram', amount: 250, date: addDays(5), category: 'Anúncios', paid: false, projectId: p2 },
    ],
    posts: [
      { id: uid(), title: 'Bastidores do projeto Café Aurora', date: addDays(1), type: 'Reels', status: 'producao', caption: 'Um pouco do processo criativo ☕', hashtags: '#design #branding', projectId: p1, mediaIds: [m2] },
      { id: uid(), title: 'Dica da semana', date: addDays(3), type: 'Carrossel', status: 'agendado', caption: '5 erros comuns na identidade visual', hashtags: '#dicas #marketing', projectId: '', mediaIds: [m1] },
      { id: uid(), title: 'Depoimento de cliente', date: addDays(8), type: 'Feed', status: 'ideia', caption: '', hashtags: '', projectId: p3, mediaIds: [] },
      { id: uid(), title: 'Entrega: site Marcenaria Pinho', date: addDays(-4), type: 'Carrossel', status: 'publicado', caption: 'Site novo no ar! 🌲', hashtags: '#webdesign', projectId: '', mediaIds: [m3] },
    ],
    media: [
      { id: m1, name: 'Capa carrossel dicas', type: 'imagem', url: '', tags: 'instagram, dicas', projectId: '' },
      { id: m2, name: 'Vídeo bastidores', type: 'video', url: '', tags: 'reels, bastidores', projectId: p1 },
      { id: m3, name: 'Prints do site', type: 'imagem', url: '', tags: 'portfólio', projectId: '' },
      { id: uid(), name: 'Logo do escritório', type: 'logo', url: '', tags: 'marca', projectId: '' },
    ],
  };
}

let db;
try { db = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { db = seed(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { alert('Não foi possível guardar (armazenamento cheio?). Use links em vez de enviar imagens grandes.'); } };
save();

const money = v => new Intl.NumberFormat(db.settings.currency === 'EUR' ? 'pt-PT' : 'pt-BR', { style: 'currency', currency: db.settings.currency }).format(v || 0);
const projName = id => db.projects.find(p => p.id === id)?.title || '';
const projOptions = sel => `<option value="">— nenhum —</option>` + db.projects.map(p => `<option value="${p.id}" ${p.id === sel ? 'selected' : ''}>${esc(p.title)}</option>`).join('');

/* ---------- Navegação ---------- */
let current = 'inicio';
let calMonth = new Date(); calMonth.setDate(1);
let finFilter = { month: today().slice(0, 7), type: '', status: '' };
let mediaFilter = '';

document.querySelectorAll('nav button').forEach(b => b.onclick = () => go(b.dataset.view));
$('#menuBtn').onclick = () => $('.sidebar').classList.toggle('open');

function go(v) {
  current = v;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  $('.sidebar').classList.remove('open');
  render();
}

function render() {
  $('#brandName').textContent = db.settings.name;
  document.title = db.settings.name;
  const views = { inicio: viewInicio, projetos: viewProjetos, financeiro: viewFinanceiro, instagram: viewInstagram, midia: viewMidia, config: viewConfig };
  views[current]();
}

const setHeader = (title, actions = '') => { $('#viewTitle').textContent = title; $('#viewActions').innerHTML = actions; };

/* ---------- Início (visão integrada) ---------- */
function monthTotals(ym) {
  const items = db.finance.filter(f => f.date.startsWith(ym));
  const inn = items.filter(f => f.type === 'entrada').reduce((s, f) => s + +f.amount, 0);
  const out = items.filter(f => f.type === 'saida').reduce((s, f) => s + +f.amount, 0);
  return { inn, out, bal: inn - out };
}

function viewInicio() {
  setHeader('Início', `<button class="primary" onclick="quickAdd()">＋ Adicionar</button>`);
  const t = monthTotals(today().slice(0, 7));
  const receber = db.finance.filter(f => f.type === 'entrada' && !f.paid).sort((a, b) => a.date.localeCompare(b.date));
  const pagar = db.finance.filter(f => f.type === 'saida' && !f.paid).sort((a, b) => a.date.localeCompare(b.date));
  const ativos = db.projects.filter(p => p.status !== 'concluido').sort((a, b) => (a.due || '9').localeCompare(b.due || '9'));
  const proxPosts = db.posts.filter(p => p.date >= today() && p.status !== 'publicado').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  const semMidia = db.posts.filter(p => p.status !== 'publicado' && !(p.mediaIds || []).length);

  const alertas = [];
  ativos.filter(p => p.due && daysUntil(p.due) <= 3).forEach(p => alertas.push(`📋 Prazo de <b>${esc(p.title)}</b> ${daysUntil(p.due) < 0 ? 'atrasado' : 'em ' + daysUntil(p.due) + ' dia(s)'}`));
  receber.filter(f => daysUntil(f.date) < 0).forEach(f => alertas.push(`💰 Recebimento atrasado: <b>${esc(f.desc)}</b> (${money(f.amount)})`));
  pagar.filter(f => daysUntil(f.date) <= 3).forEach(f => alertas.push(`💸 Conta a pagar ${daysUntil(f.date) < 0 ? 'atrasada' : 'em breve'}: <b>${esc(f.desc)}</b> (${money(f.amount)})`));
  semMidia.filter(p => daysUntil(p.date) <= 5 && daysUntil(p.date) >= 0).forEach(p => alertas.push(`📸 Post <b>${esc(p.title)}</b> (${fmtDate(p.date)}) ainda sem mídia anexada`));

  $('#view').innerHTML = `
  ${db.settings.demo ? `<div class="card" style="margin-bottom:16px;background:var(--accent-soft);border-color:transparent">👋 Estes são <b>dados de exemplo</b> para mostrar como funciona. Quando quiser começar, vá a <a href="#" onclick="go('config');return false">Configurações</a> e clique em “Apagar dados de exemplo”.</div>` : ''}
  <div class="grid kpis">
    <div class="card kpi"><small>Entradas do mês</small><strong class="pos">${money(t.inn)}</strong></div>
    <div class="card kpi"><small>Saídas do mês</small><strong class="neg">${money(t.out)}</strong></div>
    <div class="card kpi"><small>Saldo do mês</small><strong class="${t.bal >= 0 ? 'pos' : 'neg'}">${money(t.bal)}</strong></div>
    <div class="card kpi"><small>A receber (em aberto)</small><strong>${money(receber.reduce((s, f) => s + +f.amount, 0))}</strong></div>
    <div class="card kpi"><small>Projetos ativos</small><strong>${ativos.length}</strong></div>
    <div class="card kpi"><small>Posts nos próximos 7 dias</small><strong>${db.posts.filter(p => daysUntil(p.date) >= 0 && daysUntil(p.date) <= 7).length}</strong></div>
  </div>
  <div class="grid two" style="margin-top:16px">
    <div class="card"><h3>⚠️ Atenção</h3>${alertas.length ? `<ul class="list">${alertas.map(a => `<li style="cursor:default"><span class="grow">${a}</span></li>`).join('')}</ul>` : '<p class="empty">Tudo em dia 🎉</p>'}</div>
    <div class="card"><h3>📋 Projetos por prazo</h3>${listProjects(ativos.slice(0, 6))}</div>
    <div class="card"><h3>📸 Próximas postagens</h3>${listPosts(proxPosts)}</div>
    <div class="card"><h3>💰 Contas em aberto</h3>${listFinance([...receber, ...pagar].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 7))}</div>
  </div>`;
}

const listProjects = arr => arr.length ? `<ul class="list">${arr.map(p => `<li onclick="editProject('${p.id}')"><span class="grow"><b>${esc(p.title)}</b><div class="sub">${esc(p.client)} · ${STAGES[p.status]}</div></span>${dueTag(p)}</li>`).join('')}</ul>` : '<p class="empty">Nenhum projeto.</p>';
const listPosts = arr => arr.length ? `<ul class="list">${arr.map(p => `<li onclick="editPost('${p.id}')"><span class="tag pink">${fmtDate(p.date)}</span><span class="grow"><b>${esc(p.title)}</b><div class="sub">${p.type}${p.projectId ? ' · ' + esc(projName(p.projectId)) : ''}</div></span>${statusTag(p.status)}</li>`).join('')}</ul>` : '<p class="empty">Nada agendado.</p>';
const listFinance = arr => arr.length ? `<ul class="list">${arr.map(f => `<li onclick="editFinance('${f.id}')"><span class="tag ${daysUntil(f.date) < 0 && !f.paid ? 'red' : ''}">${fmtDate(f.date)}</span><span class="grow"><b>${esc(f.desc)}</b><div class="sub">${f.category}${f.projectId ? ' · ' + esc(projName(f.projectId)) : ''}</div></span><b class="${f.type === 'entrada' ? 'pos' : 'neg'}">${f.type === 'entrada' ? '+' : '−'}${money(f.amount)}</b></li>`).join('')}</ul>` : '<p class="empty">Sem lançamentos.</p>';
const statusTag = s => `<span class="tag ${POST_STATUS[s][1]}">${POST_STATUS[s][0]}</span>`;
function dueTag(p) {
  if (!p.due) return '';
  if (p.status === 'concluido') return `<span class="tag green">entregue</span>`;
  const d = daysUntil(p.due);
  return `<span class="tag ${d < 0 ? 'red' : d <= 3 ? 'amber' : ''}">${d < 0 ? 'atrasado' : fmtDate(p.due)}</span>`;
}

window.quickAdd = () => openModal('O que quer adicionar?', `
  <div class="grid" style="grid-template-columns:1fr 1fr">
    <button type="button" class="ghost" onclick="closeModal();editProject()">📋 Projeto</button>
    <button type="button" class="ghost" onclick="closeModal();editFinance()">💰 Lançamento</button>
    <button type="button" class="ghost" onclick="closeModal();editPost()">📸 Post</button>
    <button type="button" class="ghost" onclick="closeModal();editMedia()">🎞️ Mídia</button>
  </div>`, null, null, true);

/* ---------- Projetos (Kanban) ---------- */
function viewProjetos() {
  setHeader('Projetos', `<button class="primary" onclick="editProject()">＋ Novo projeto</button>`);
  $('#view').innerHTML = `<div class="kanban">${PROJ_COLS.map(c => {
    const items = db.projects.filter(p => p.status === c);
    return `<div class="col" data-col="${c}"><h3>${STAGES[c]}<span class="tag">${items.length}</span></h3>
      ${items.map(p => {
        const posts = db.posts.filter(x => x.projectId === p.id).length;
        const rec = db.finance.filter(f => f.projectId === p.id && f.type === 'entrada' && f.paid).reduce((s, f) => s + +f.amount, 0);
        return `<div class="kcard" draggable="true" data-id="${p.id}" onclick="editProject('${p.id}')">
          <b>${esc(p.title)}</b><div class="sub" style="color:var(--muted);font-size:13px">${esc(p.client)}</div>
          <div class="meta">${dueTag(p)}${p.value ? `<span class="tag">${money(rec)} / ${money(p.value)}</span>` : ''}${posts ? `<span class="tag pink">📸 ${posts}</span>` : ''}</div>
          <div class="progress"><span style="width:${p.progress || 0}%"></span></div></div>`;
      }).join('')}</div>`;
  }).join('')}</div>
  <p class="empty">Dica: arraste os cartões entre colunas para mudar o estado.</p>`;

  document.querySelectorAll('.kcard').forEach(k => k.ondragstart = e => e.dataTransfer.setData('text', k.dataset.id));
  document.querySelectorAll('.col').forEach(col => {
    col.ondragover = e => { e.preventDefault(); col.classList.add('drag-over'); };
    col.ondragleave = () => col.classList.remove('drag-over');
    col.ondrop = e => {
      e.preventDefault();
      const p = db.projects.find(x => x.id === e.dataTransfer.getData('text'));
      if (p) { p.status = col.dataset.col; if (p.status === 'concluido') p.progress = 100; save(); render(); }
    };
  });
}

window.editProject = id => {
  const p = db.projects.find(x => x.id === id) || { status: 'aFazer', progress: 0 };
  const fin = id ? db.finance.filter(f => f.projectId === id) : [];
  const posts = id ? db.posts.filter(x => x.projectId === id) : [];
  const media = id ? db.media.filter(x => x.projectId === id) : [];
  const rec = fin.filter(f => f.type === 'entrada' && f.paid).reduce((s, f) => s + +f.amount, 0);
  const gastos = fin.filter(f => f.type === 'saida').reduce((s, f) => s + +f.amount, 0);
  openModal(id ? 'Editar projeto' : 'Novo projeto', `
    ${field('Título', `<input name="title" required value="${esc(p.title)}">`)}
    <div class="row">${field('Cliente', `<input name="client" value="${esc(p.client)}">`)}${field('Prazo', `<input type="date" name="due" value="${p.due || ''}">`)}</div>
    <div class="row">${field('Estado', `<select name="status">${PROJ_COLS.map(c => `<option value="${c}" ${c === p.status ? 'selected' : ''}>${STAGES[c]}</option>`).join('')}</select>`)}${field('Valor do projeto', `<input type="number" step="0.01" name="value" value="${p.value || ''}">`)}</div>
    ${field(`Progresso: <span id="pv">${p.progress || 0}</span>%`, `<input type="range" name="progress" min="0" max="100" step="5" value="${p.progress || 0}" oninput="pv.textContent=this.value">`)}
    ${field('Notas', `<textarea name="notes">${esc(p.notes)}</textarea>`)}
    ${id ? `<div class="linked"><b>🔗 Ligado a este projeto</b>
      💰 Recebido ${money(rec)} de ${money(p.value)} · gastos ${money(gastos)} · ${fin.length} lançamento(s)<br>
      📸 ${posts.length} post(s): ${posts.map(x => esc(x.title)).join(', ') || '—'}<br>
      🎞️ ${media.length} arquivo(s) de mídia</div>` : ''}
  `, data => {
    Object.assign(p, data, { value: +data.value || 0, progress: +data.progress });
    if (!id) db.projects.push({ id: uid(), ...p });
    save(); render();
  }, id ? () => { db.projects = db.projects.filter(x => x.id !== id); save(); render(); } : null);
};

/* ---------- Financeiro ---------- */
function viewFinanceiro() {
  setHeader('Financeiro', `<button class="ghost" onclick="exportCSV()">⬇ CSV</button><button class="primary" onclick="editFinance()">＋ Lançamento</button>`);
  const months = [...new Set([today().slice(0, 7), ...db.finance.map(f => f.date.slice(0, 7))])].sort().reverse();
  let items = db.finance.filter(f => (!finFilter.month || f.date.startsWith(finFilter.month)) && (!finFilter.type || f.type === finFilter.type) && (!finFilter.status || (finFilter.status === 'pago') === !!f.paid));
  items.sort((a, b) => b.date.localeCompare(a.date));
  const t = monthTotals(finFilter.month || '');
  // últimos 6 meses
  const last = [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); return d.toISOString().slice(0, 7); });
  const tots = last.map(m => ({ m, ...monthTotals(m) }));
  const max = Math.max(1, ...tots.map(x => Math.max(x.inn, x.out)));
  const byCat = {};
  db.finance.filter(f => f.type === 'saida' && (!finFilter.month || f.date.startsWith(finFilter.month))).forEach(f => byCat[f.category] = (byCat[f.category] || 0) + +f.amount);

  $('#view').innerHTML = `
  <div class="grid kpis">
    <div class="card kpi"><small>Entradas ${finFilter.month ? 'no período' : '(total)'}</small><strong class="pos">${money(t.inn)}</strong></div>
    <div class="card kpi"><small>Saídas</small><strong class="neg">${money(t.out)}</strong></div>
    <div class="card kpi"><small>Saldo</small><strong class="${t.bal >= 0 ? 'pos' : 'neg'}">${money(t.bal)}</strong></div>
  </div>
  <div class="grid two" style="margin-top:16px">
    <div class="card"><h3>Últimos 6 meses</h3><div class="bars">${tots.map(x => `<div class="b"><div class="pair"><span style="height:${x.inn / max * 100}%;background:var(--green)" title="Entradas ${money(x.inn)}"></span><span style="height:${x.out / max * 100}%;background:var(--red)" title="Saídas ${money(x.out)}"></span></div>${new Date(x.m + '-15').toLocaleDateString('pt-BR', { month: 'short' })}</div>`).join('')}</div>
      <p class="sub" style="color:var(--muted);font-size:12px;margin:6px 0 0"><span style="color:var(--green)">■</span> entradas <span style="color:var(--red)">■</span> saídas</p></div>
    <div class="card"><h3>Saídas por categoria</h3>${Object.keys(byCat).length ? `<ul class="list">${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, v]) => `<li style="cursor:default"><span class="grow">${c}</span><b>${money(v)}</b></li>`).join('')}</ul>` : '<p class="empty">Sem saídas no período.</p>'}</div>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="filters">
      <select onchange="finFilter.month=this.value;render()"><option value="">Todos os meses</option>${months.map(m => `<option value="${m}" ${m === finFilter.month ? 'selected' : ''}>${new Date(m + '-15').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>`).join('')}</select>
      <select onchange="finFilter.type=this.value;render()"><option value="">Entradas e saídas</option><option value="entrada" ${finFilter.type === 'entrada' ? 'selected' : ''}>Só entradas</option><option value="saida" ${finFilter.type === 'saida' ? 'selected' : ''}>Só saídas</option></select>
      <select onchange="finFilter.status=this.value;render()"><option value="">Pagos e pendentes</option><option value="pago" ${finFilter.status === 'pago' ? 'selected' : ''}>Pagos</option><option value="pendente" ${finFilter.status === 'pendente' ? 'selected' : ''}>Pendentes</option></select>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Projeto</th><th>Estado</th><th class="num">Valor</th></tr></thead><tbody>
    ${items.map(f => `<tr onclick="editFinance('${f.id}')"><td>${fmtDate(f.date)}</td><td>${esc(f.desc)}</td><td>${f.category}</td><td>${esc(projName(f.projectId)) || '—'}</td><td>${f.paid ? '<span class="tag green">pago</span>' : `<span class="tag ${daysUntil(f.date) < 0 ? 'red' : 'amber'}">${daysUntil(f.date) < 0 ? 'atrasado' : 'pendente'}</span>`}</td><td class="num ${f.type === 'entrada' ? 'pos' : 'neg'}">${f.type === 'entrada' ? '+' : '−'}${money(f.amount)}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">Nenhum lançamento.</td></tr>'}
    </tbody></table></div>
  </div>`;
}
window.finFilter = finFilter;

window.editFinance = id => {
  const f = db.finance.find(x => x.id === id) || { type: 'entrada', date: today(), category: 'Honorários', paid: false };
  openModal(id ? 'Editar lançamento' : 'Novo lançamento', `
    <div class="row">${field('Tipo', `<select name="type"><option value="entrada" ${f.type === 'entrada' ? 'selected' : ''}>Entrada (receita)</option><option value="saida" ${f.type === 'saida' ? 'selected' : ''}>Saída (despesa)</option></select>`)}${field('Valor', `<input type="number" step="0.01" name="amount" required value="${f.amount || ''}">`)}</div>
    ${field('Descrição', `<input name="desc" required value="${esc(f.desc)}">`)}
    <div class="row">${field('Data / vencimento', `<input type="date" name="date" required value="${f.date}">`)}${field('Categoria', `<select name="category">${FIN_CATS.map(c => `<option ${c === f.category ? 'selected' : ''}>${c}</option>`).join('')}</select>`)}</div>
    <div class="row">${field('Projeto', `<select name="projectId">${projOptions(f.projectId)}</select>`)}${field('Estado', `<select name="paid"><option value="">Pendente</option><option value="1" ${f.paid ? 'selected' : ''}>Pago / recebido</option></select>`)}</div>
  `, data => {
    Object.assign(f, data, { amount: +data.amount, paid: !!data.paid });
    if (!id) db.finance.push({ id: uid(), ...f });
    save(); render();
  }, id ? () => { db.finance = db.finance.filter(x => x.id !== id); save(); render(); } : null);
};

window.exportCSV = () => {
  const rows = [['Data', 'Tipo', 'Descrição', 'Categoria', 'Projeto', 'Pago', 'Valor']]
    .concat(db.finance.map(f => [f.date, f.type, f.desc, f.category, projName(f.projectId), f.paid ? 'sim' : 'não', f.amount]));
  download('financeiro.csv', '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n'), 'text/csv');
};

/* ---------- Instagram (calendário editorial) ---------- */
function viewInstagram() {
  setHeader('Instagram · ' + db.settings.instagram, `<button class="primary" onclick="editPost()">＋ Novo post</button>`);
  const y = calMonth.getFullYear(), m = calMonth.getMonth();
  const start = new Date(y, m, 1); start.setDate(1 - start.getDay());
  const days = [...Array(42)].map((_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const colors = { ideia: 'var(--bg);color:var(--muted)', producao: 'var(--amber-soft);color:var(--amber)', agendado: 'var(--accent-soft);color:var(--accent)', publicado: 'var(--green-soft);color:var(--green)' };
  const counts = Object.keys(POST_STATUS).map(s => `<span class="tag ${POST_STATUS[s][1]}">${POST_STATUS[s][0]}: ${db.posts.filter(p => p.status === s).length}</span>`).join(' ');

  $('#view').innerHTML = `
  <div class="card">
    <div class="cal-head"><button class="ghost" onclick="calMonth.setMonth(calMonth.getMonth()-1);render()">‹</button>
      <strong>${calMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
      <button class="ghost" onclick="calMonth=new Date();calMonth.setDate(1);render()">Hoje</button>
      <button class="ghost" onclick="calMonth.setMonth(calMonth.getMonth()+1);render()">›</button></div>
    <div class="cal">${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => `<div class="dow">${d}</div>`).join('')}
    ${days.map(d => {
      const s = iso(d), posts = db.posts.filter(p => p.date === s);
      return `<div class="day ${d.getMonth() !== m ? 'out' : ''} ${s === today() ? 'today' : ''}" onclick="editPost(null,'${s}')"><span class="n">${d.getDate()}</span>
        ${posts.map(p => `<span class="post-pill" style="background:${colors[p.status]}" onclick="event.stopPropagation();editPost('${p.id}')">${p.type === 'Reels' ? '🎬' : p.type === 'Stories' ? '⭕' : '▦'} ${esc(p.title)}</span>`).join('')}</div>`;
    }).join('')}</div>
    <p style="margin:12px 0 0">${counts}</p>
  </div>
  <div class="card" style="margin-top:16px"><h3>Ideias sem data definida / próximas</h3>${listPosts(db.posts.filter(p => p.status !== 'publicado').sort((a, b) => a.date.localeCompare(b.date)))}</div>`;
}
window.calMonth = calMonth;

window.editPost = (id, date) => {
  const p = db.posts.find(x => x.id === id) || { date: date || today(), type: 'Feed', status: 'ideia', mediaIds: [] };
  openModal(id ? 'Editar post' : 'Novo post', `
    ${field('Título / tema', `<input name="title" required value="${esc(p.title)}">`)}
    <div class="row">${field('Data', `<input type="date" name="date" required value="${p.date}">`)}${field('Formato', `<select name="type">${POST_TYPES.map(t => `<option ${t === p.type ? 'selected' : ''}>${t}</option>`).join('')}</select>`)}</div>
    <div class="row">${field('Estado', `<select name="status">${Object.entries(POST_STATUS).map(([k, v]) => `<option value="${k}" ${k === p.status ? 'selected' : ''}>${v[0]}</option>`).join('')}</select>`)}${field('Projeto / cliente', `<select name="projectId">${projOptions(p.projectId)}</select>`)}</div>
    ${field('Legenda', `<textarea name="caption">${esc(p.caption)}</textarea>`)}
    ${field('Hashtags', `<input name="hashtags" value="${esc(p.hashtags)}" placeholder="#exemplo #marca">`)}
    ${field('Mídia anexada (da biblioteca)', db.media.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px">${db.media.map(md => `<label class="tag" style="cursor:pointer"><input type="checkbox" name="media_${md.id}" ${(p.mediaIds || []).includes(md.id) ? 'checked' : ''}> ${MEDIA_TYPES[md.type]} ${esc(md.name)}</label>`).join('')}</div>` : '<span class="empty">Biblioteca de mídia vazia.</span>')}
    <button type="button" class="ghost" onclick="copyCaption()">📋 Copiar legenda + hashtags</button>
  `, data => {
    const mediaIds = Object.keys(data).filter(k => k.startsWith('media_')).map(k => k.slice(6));
    Object.keys(data).filter(k => k.startsWith('media_')).forEach(k => delete data[k]);
    Object.assign(p, data, { mediaIds });
    if (!id) db.posts.push({ id: uid(), ...p });
    save(); render();
  }, id ? () => { db.posts = db.posts.filter(x => x.id !== id); save(); render(); } : null);
};
window.copyCaption = () => {
  const f = $('#modalForm');
  navigator.clipboard?.writeText(`${f.caption.value}\n\n${f.hashtags.value}`.trim()).then(() => alert('Legenda copiada! Agora é só colar no Instagram.'));
};

/* ---------- Mídia ---------- */
function viewMidia() {
  setHeader('Mídia', `<button class="primary" onclick="editMedia()">＋ Adicionar mídia</button>`);
  const q = mediaFilter.toLowerCase();
  const items = db.media.filter(md => !q || (md.name + ' ' + md.tags + ' ' + projName(md.projectId)).toLowerCase().includes(q));
  $('#view').innerHTML = `
  <div class="filters"><input placeholder="🔍 Procurar por nome, tag ou projeto" value="${esc(mediaFilter)}" oninput="mediaFilter=this.value;clearTimeout(window._mt);window._mt=setTimeout(()=>{render();const i=document.querySelector('.filters input');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)" style="flex:1;min-width:220px"></div>
  <div class="media-grid">${items.map(md => {
    const used = db.posts.filter(p => (p.mediaIds || []).includes(md.id)).length;
    const isImg = md.url && (/^data:image/.test(md.url) || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(md.url));
    return `<div class="media" onclick="editMedia('${md.id}')"><div class="thumb">${isImg ? `<img src="${esc(md.url)}" alt="">` : MEDIA_TYPES[md.type]}</div>
      <div class="info"><b>${esc(md.name)}</b><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${md.tags ? md.tags.split(',').map(t => `<span class="tag">${esc(t.trim())}</span>`).join('') : ''}${used ? `<span class="tag pink">em ${used} post(s)</span>` : ''}</div></div></div>`;
  }).join('') || '<p class="empty">Nada encontrado.</p>'}</div>`;
}
window.mediaFilter = mediaFilter;
Object.defineProperty(window, 'mediaFilter', { get: () => mediaFilter, set: v => mediaFilter = v });

window.editMedia = id => {
  const md = db.media.find(x => x.id === id) || { type: 'imagem' };
  openModal(id ? 'Editar mídia' : 'Adicionar mídia', `
    ${field('Nome', `<input name="name" required value="${esc(md.name)}">`)}
    <div class="row">${field('Tipo', `<select name="type">${Object.keys(MEDIA_TYPES).map(t => `<option value="${t}" ${t === md.type ? 'selected' : ''}>${MEDIA_TYPES[t]} ${t}</option>`).join('')}</select>`)}${field('Projeto', `<select name="projectId">${projOptions(md.projectId)}</select>`)}</div>
    ${field('Link (Google Drive, Dropbox, Canva…)', `<input name="url" value="${md.url && !md.url.startsWith('data:') ? esc(md.url) : ''}" placeholder="https://">`)}
    ${field('…ou enviar uma imagem pequena (até ~300 KB)', `<input type="file" name="file" accept="image/*">`)}
    ${field('Tags (separadas por vírgula)', `<input name="tags" value="${esc(md.tags)}">`)}
    ${md.url ? `<a href="${esc(md.url)}" target="_blank" rel="noopener">Abrir arquivo ↗</a>` : ''}
  `, async (data, form) => {
    const file = form.file.files[0];
    delete data.file;
    if (file) {
      if (file.size > 300 * 1024) { alert('Imagem muito grande para guardar no navegador. Coloque-a no Google Drive e cole o link.'); return; }
      data.url = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
    } else if (!data.url && md.url?.startsWith('data:')) data.url = md.url;
    Object.assign(md, data);
    if (!id) db.media.push({ id: uid(), ...md });
    save(); render();
  }, id ? () => { db.media = db.media.filter(x => x.id !== id); db.posts.forEach(p => p.mediaIds = (p.mediaIds || []).filter(m => m !== id)); save(); render(); } : null);
};

/* ---------- Configurações ---------- */
function viewConfig() {
  setHeader('Configurações');
  $('#view').innerHTML = `
  <div class="grid two">
    <div class="card"><h3>Escritório</h3>
      ${field('Nome do painel', `<input id="cfgName" value="${esc(db.settings.name)}">`)}<br>
      ${field('Perfil do Instagram', `<input id="cfgInsta" value="${esc(db.settings.instagram)}">`)}<br>
      ${field('Moeda', `<select id="cfgCur"><option value="BRL" ${db.settings.currency === 'BRL' ? 'selected' : ''}>Real (R$)</option><option value="EUR" ${db.settings.currency === 'EUR' ? 'selected' : ''}>Euro (€)</option><option value="USD" ${db.settings.currency === 'USD' ? 'selected' : ''}>Dólar (US$)</option></select>`)}<br>
      <button class="primary" onclick="db.settings.name=cfgName.value;db.settings.instagram=cfgInsta.value;db.settings.currency=cfgCur.value;save();render();alert('Guardado!')">Guardar</button>
    </div>
    <div class="card"><h3>Dados</h3>
      <p class="empty">Tudo fica guardado só neste navegador. Exporte regularmente para não perder nada, ou para passar para outro computador.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="ghost" onclick="download('painel-backup-${today()}.json',JSON.stringify(db,null,2),'application/json')">⬇ Exportar backup</button>
        <label class="ghost" style="cursor:pointer">⬆ Importar backup<input type="file" accept=".json" hidden onchange="importJSON(this.files[0])"></label>
      </div><br>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${db.settings.demo ? `<button class="danger" onclick="if(confirm('Apagar os dados de exemplo e começar do zero?')){db={settings:{...db.settings,demo:false,name:'Painel do Escritório',instagram:'@'},projects:[],finance:[],posts:[],media:[]};save();go('inicio')}">Apagar dados de exemplo</button>` : ''}
        <button class="ghost" onclick="if(confirm('Recarregar os dados de exemplo? Os dados atuais serão substituídos.')){db=seed();save();go('inicio')}">Recarregar exemplo</button>
      </div>
    </div>
  </div>`;
}
window.importJSON = file => {
  if (!file) return;
  file.text().then(t => { try { const d = JSON.parse(t); if (!d.projects || !d.finance) throw 0; db = d; save(); go('inicio'); alert('Backup importado!'); } catch { alert('Arquivo inválido.'); } });
};
window.download = (name, content, type) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

/* ---------- Modal genérico ---------- */
const field = (label, input) => `<div class="field"><label>${label}</label>${input}</div>`;
let onSave = null;
function openModal(title, body, saveFn, deleteFn, noButtons) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = body;
  onSave = saveFn;
  const del = $('#modalDelete');
  del.hidden = !deleteFn;
  del.onclick = () => { if (confirm('Excluir este item?')) { deleteFn(); closeModal(); } };
  $('.modal-actions').style.display = noButtons ? 'none' : '';
  if (noButtons) $('.modal-actions').insertAdjacentHTML('afterend', '');
  $('#modal').showModal();
}
window.closeModal = () => $('#modal').close();
$('#modalForm').addEventListener('submit', async e => {
  if (e.submitter?.value !== 'ok' || !onSave) return;
  e.preventDefault();
  const form = e.target;
  const data = {};
  new FormData(form).forEach((v, k) => { if (!(v instanceof File)) data[k] = v; });
  await onSave(data, form);
  closeModal();
});
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
// fecha quickAdd com Esc também
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modal').open) closeModal(); });

/* expõe para os handlers inline */
Object.assign(window, { db, go, render, save, seed, today });
Object.defineProperty(window, 'db', { get: () => db, set: v => db = v });
Object.defineProperty(window, 'calMonth', { get: () => calMonth, set: v => calMonth = v });

render();
