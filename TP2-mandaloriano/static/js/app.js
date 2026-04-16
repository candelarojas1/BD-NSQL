const SEASON_YEARS = { 1: 2019, 2: 2020, 3: 2023 };
let chapters = [];
let localExpiry = {};

// ── API ────────────────────────────────────────────────────

async function fetchChapters() {
  const res = await fetch('/api/chapters');
  return res.json();
}

async function apiRent(n) {
  const res = await fetch(`/api/chapters/${n}/rent`, { method: 'POST' });
  return { ok: res.ok, data: await res.json() };
}

async function apiConfirm(n, price) {
  const res = await fetch(`/api/chapters/${n}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price })
  });
  return { ok: res.ok, data: await res.json() };
}

// ── RENDER ─────────────────────────────────────────────────

function formatTimer(ms) {
  if (ms <= 0) return 'expirando...';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s.toString().padStart(2,'0')}s` : `${s}s`;
}

function renderEpisode(ch) {
  const { number: n, es, en, status, ttl } = ch;
  const expiresAt = localExpiry[n];
  const now = Date.now();
  const rem = expiresAt ? expiresAt - now : (ttl ? ttl * 1000 : 0);

  let badgeClass, badgeText, timerHtml = '', btnHtml = '';

  if (status === 'disponible') {
    badgeClass = 'badge-disponible';
    badgeText  = 'Disponible';
    btnHtml    = `<button class="btn btn-alquilar" onclick="handleRent(${n})">Alquilar</button>`;

  } else if (status === 'reservado') {
    badgeClass = 'badge-reservado';
    badgeText  = 'Reservado';
    timerHtml  = `<div class="ep-timer" id="timer-${n}">Expira en ${formatTimer(rem)}</div>`;
    btnHtml    = `<button class="btn btn-confirmar" onclick="showModal(${n})">Confirmar pago</button>`;

  } else {
    const hrs  = Math.floor(rem / 3600000);
    const mins = Math.floor((rem % 3600000) / 60000);
    badgeClass = 'badge-alquilado';
    badgeText  = 'Alquilado';
    timerHtml  = `<div class="ep-timer red">Libre en ~${hrs}h ${mins}m</div>`;
    btnHtml    = `<button class="btn btn-disabled">No disponible</button>`;
  }

  return `<div class="ep" id="ep-${n}">
    <span class="ep-num">Cap.${n}</span>
    <div class="ep-info">
      <div class="ep-title">${es}</div>
      <div class="ep-sub">${en}</div>
      ${timerHtml}
    </div>
    <span class="badge ${badgeClass}">${badgeText}</span>
    ${btnHtml}
  </div>`;
}

function renderAll(data) {
  chapters = data;
  const container = document.getElementById('seasons-container');
  const seasons = [...new Set(data.map(c => c.season))].sort();

  container.innerHTML = seasons.map(s => {
    const eps = data.filter(c => c.season === s);
    return `<section class="season">
      <div class="season-header">
        <span class="season-title">Temporada ${s} &nbsp;·&nbsp; ${SEASON_YEARS[s]}</span>
        <div class="season-line"></div>
      </div>
      <div class="episodes">${eps.map(renderEpisode).join('')}</div>
    </section>`;
  }).join('');

  updateStats(data);
}

function updateStats(data) {
  const d = data.filter(c => c.status === 'disponible').length;
  const r = data.filter(c => c.status === 'reservado').length;
  const a = data.filter(c => c.status === 'alquilado').length;
  document.getElementById('cnt-disp').textContent = d;
  document.getElementById('cnt-res').textContent  = r;
  document.getElementById('cnt-alq').textContent  = a;
}

// ── ACTIONS ────────────────────────────────────────────────

async function handleRent(n) {
  const { ok, data } = await apiRent(n);
  if (!ok) { showToast(data.error || 'Error al alquilar', 'err'); return; }

  localExpiry[n] = Date.now() + (data.ttl * 1000);
  showToast(data.message, 'info');
  await reload();
  showModal(n);
}

async function handleConfirm(n) {
  const input = document.getElementById('precio-input');
  const price = parseFloat(input.value);

  if (!price || price <= 0) { showToast('Ingresá un precio válido', 'err'); return; }

  const { ok, data } = await apiConfirm(n, price);
  if (!ok) { showToast(data.error || 'Error al confirmar', 'err'); return; }

  localExpiry[n] = Date.now() + (data.ttl * 1000);
  closeModal();
  showToast(data.message, 'ok');
  await reload();
}

async function reload() {
  const data = await fetchChapters();
  renderAll(data);
}

// ── MODAL ──────────────────────────────────────────────────

function showModal(n) {
  const ch = chapters.find(c => c.number === n);
  if (!ch) return;

  document.getElementById('modal-content').innerHTML = `
    <h3>Confirmar pago</h3>
    <p class="modal-sub">
      <strong>Capítulo ${n} — ${ch.es}</strong><br>
      ${ch.en}<br><br>
      Ingresá el precio para confirmar el alquiler por 24 hs.
    </p>
    <label>Precio ($)</label>
    <input type="number" id="precio-input" placeholder="Ej: 2.99" min="0.01" step="0.01" autofocus>
    <div class="modal-btns">
      <button class="btn btn-cancel" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-primary" onclick="handleConfirm(${n})">Confirmar pago</button>
    </div>`;

  document.getElementById('modal-overlay').classList.add('active');

  setTimeout(() => {
    const inp = document.getElementById('precio-input');
    if (inp) inp.focus();
  }, 50);
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// ── TOAST ──────────────────────────────────────────────────

function showToast(msg, type = 'ok') {
  const area = document.getElementById('toast-area');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  area.appendChild(t);
  setTimeout(() => t.remove(), 3800);
}

// ── TIMERS ─────────────────────────────────────────────────

setInterval(() => {
  document.querySelectorAll('[id^="timer-"]').forEach(el => {
    const n = parseInt(el.id.replace('timer-', ''));
    const exp = localExpiry[n];
    if (!exp) return;
    const rem = exp - Date.now();
    if (rem <= 0) {
      reload();
    } else {
      el.textContent = `Expira en ${formatTimer(rem)}`;
    }
  });
}, 1000);

// ── INIT ───────────────────────────────────────────────────

document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

fetchChapters().then(renderAll);
setInterval(reload, 15000);
