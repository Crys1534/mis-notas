'use strict';
(async () => {
  /* ================= Constantes ================= */
  const COLORS = ['#fff59d', '#ffb3d1', '#a5dcff', '#b8f0a6', '#ffc98a', '#d9c2ff',
    '#ff9a8b', '#7fe3d3', '#dcef6e', '#ff8ad8', '#8fb2ff', '#f3eee0'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const REPEATS = [
    { v: 'none', l: 'Una vez' },
    { v: 'daily', l: 'Diariamente' },
    { v: 'weekly', l: 'Semanalmente' },
    { v: 'biweekly', l: 'Cada 14 días' },
    { v: 'monthly', l: 'Mensualmente' },
    { v: 'yearly', l: 'Anualmente' }
  ];
  const REPEAT_KEYS = REPEATS.map(r => r.v);
  const REPEAT_TXT = { none: '', daily: 'cada día', weekly: 'cada semana', biweekly: 'cada 14 días', monthly: 'cada mes', yearly: 'cada año' };
  const REMINDS = [
    { v: -1, l: 'Sin aviso' },
    { v: 0, l: 'A la hora' },
    { v: 10, l: '10 min antes' },
    { v: 60, l: '1 hora antes' },
    { v: 1440, l: '1 día antes' }
  ];
  const BOARDS = [
    { v: 'cork', l: 'Corcho', c: '#c9a36d' },
    { v: 'chalk', l: 'Pizarrón', c: '#2f4a3e' },
    { v: 'wood', l: 'Madera', c: '#b9824f' },
    { v: 'grid', l: 'Cuadriculado', c: '#f4efe2' }
  ];
  const SFX_LABELS = {
    tap: '✏️ Lápiz', pop: '🫧 Burbuja', paste: '📌 Pegar', peel: '🧻 Despegar', check: '✅ ¡Hecho!', uncheck: '↩️ Deshacer',
    pin: '📍 Chincheta', tape: '🎀 Cinta', sticker: '⭐ Pegatina', meow: '🐱 Miau', mew: '😺 Mew', bell: '🔔 Campanita',
    tada: '🎉 ¡Tada!', flip: '📄 Página', open: '⬆️ Abrir', close: '⬇️ Cerrar', swatch: '🖍 Plumón', sub: '☑️ Casilla',
    drop: '👇 Soltar', error: '🙈 Ups', toast: '💬 Aviso', chip: '👆 Opción', update: '✏️ Editar'
  };
  const HORIZON = 71 * 3600e3;   // ntfy solo programa hasta 3 días adelante
  const MIN_AHEAD = 30e3;        // y mínimo 10 segundos
  const NTFY = 'https://ntfy.sh';
  const MAX_STK = 12;
  const CHECK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13l5 5L20 6"/></svg>';

  /* ================= Utilidades ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const todayStr = () => ymd(new Date());
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin espacio */ } mirrorSoon(); };
  const newId = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
  const num = (v, a, b, fb) => (typeof v === 'number' && isFinite(v) ? Math.min(b, Math.max(a, v)) : fb);
  const genTopic = () => {
    const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
    const a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return 'notas-' + Array.from(a, n => abc[n % abc.length]).join('');
  };
  const paperEl = () => { const p = document.createElement('span'); p.className = 'paper'; return p; };
  const KINDS = [{ v: 'task', l: '✅ Tarea' }, { v: 'event', l: '📌 Evento' }, { v: 'bday', l: '🎂 Cumpleaños' }];
  const KIND_ICON = { event: '📌', bday: '🎂' };
  const KIND_PH = { task: '¿Qué hay que hacer?', event: '¿Qué evento es? (cita, pago de nómina…)', bday: '¿De quién es el cumpleaños?' };
  const kindOf = t => (t && (t.kind === 'event' || t.kind === 'bday')) ? t.kind : 'task';
  const isTask = t => kindOf(t) === 'task';
  const byTime = (a, b) => (kindOf(a) === 'bday' ? 0 : 1) - (kindOf(b) === 'bday' ? 0 : 1) || (a.time || '').localeCompare(b.time || '') || (a.created || 0) - (b.created || 0);

  /* ================= Memoria persistente ================= */
  // Los datos se guardan en varios lugares a la vez; si uno se borra, se recupera de otro.
  const KEYS = ['pn.tasks', 'pn.todos', 'pn.cstk', 'pn.settings', 'pn.sent'];
  const nativePlugin = n => { try { return (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins[n]) || null; } catch (e) { return null; } };
  const isNative = () => { try { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()); } catch (e) { return false; } };
  const storage = { persisted: false, native: isNative(), restored: false };
  function idb() {
    return new Promise((res, rej) => {
      if (!window.indexedDB) { rej(new Error('sin idb')); return; }
      const r = indexedDB.open('calendario', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  async function idbGet(k) {
    const db = await idb();
    return new Promise((res, rej) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  }
  async function idbSet(k, v) {
    const db = await idb();
    return new Promise((res, rej) => { const tx = db.transaction('kv', 'readwrite'); tx.objectStore('kv').put(v, k); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  }
  function snapshot() {
    const o = { at: Date.now() };
    KEYS.forEach(k => { try { const v = localStorage.getItem(k); if (v != null) o[k] = v; } catch (e) { /* nada */ } });
    return o;
  }
  let mirrorT = null;
  function mirrorSoon() { clearTimeout(mirrorT); mirrorT = setTimeout(mirrorNow, 500); }
  async function mirrorNow() {
    clearTimeout(mirrorT);
    const snap = snapshot();
    if (snap['pn.tasks'] == null && snap['pn.todos'] == null && snap['pn.cstk'] == null) return;   // nunca pisar un respaldo con "nada"
    try { await idbSet('backup', snap); } catch (e) { /* nada */ }
    const pref = nativePlugin('Preferences');
    if (pref) { try { await pref.set({ key: 'pn.backup', value: JSON.stringify(snap) }); } catch (e) { /* nada */ } }
  }
  async function restoreIfEmpty() {
    let have = false;
    try { have = !!(localStorage.getItem('pn.tasks') || localStorage.getItem('pn.todos') || localStorage.getItem('pn.cstk')); } catch (e) { /* nada */ }
    if (have) return false;
    let a = null, b = null;
    const pref = nativePlugin('Preferences');
    if (pref) { try { const r = await pref.get({ key: 'pn.backup' }); if (r && r.value) a = JSON.parse(r.value); } catch (e) { /* nada */ } }
    try { b = await idbGet('backup'); } catch (e) { /* nada */ }
    const snap = [a, b].filter(Boolean).sort((x, y) => (y.at || 0) - (x.at || 0))[0];
    if (!snap) return false;
    KEYS.forEach(k => { if (snap[k] != null) { try { localStorage.setItem(k, snap[k]); } catch (e) { /* nada */ } } });
    return true;
  }
  async function askPersist() {
    try {
      if (navigator.storage && navigator.storage.persist) {
        if (await navigator.storage.persisted()) return true;
        return await navigator.storage.persist();
      }
    } catch (e) { /* nada */ }
    return false;
  }
  storage.restored = await restoreIfEmpty();

  /* ================= Estado ================= */
  let tasks = load('pn.tasks', []);
  let settings = Object.assign(
    { theme: 'auto', topic: '', remindersOn: true, board: 'cork', view: 'month', sound: true, volume: 'mid', vibrate: true },
    load('pn.settings', {})
  );
  if (!BOARDS.some(b => b.v === settings.board)) settings.board = 'cork';
  if (!['week', 'todo', 'stars'].includes(settings.view)) settings.view = 'month';
  let sent = load('pn.sent', {});          // { idDeAviso: momentoEnMs }
  let todos = load('pn.todos', []);        // ideas sin día
  let cstk = load('pn.cstk', {});          // pegatinas del calendario por mes: { '2026-10': [...] }
  if (!Array.isArray(todos)) todos = [];
  if (!cstk || typeof cstk !== 'object' || Array.isArray(cstk)) cstk = {};
  if (!settings.topic) { settings.topic = genTopic(); }
  save('pn.settings', settings);

  let sel = todayStr();
  let viewY = new Date().getFullYear();
  let viewM = new Date().getMonth();
  let ed = null;                            // estado del editor
  let edSubs = [];                          // subtareas en edición
  let stk = [];                             // pegatinas en edición
  let selStk = -1;
  let curPack = window.STK ? window.STK.packs[0].id : '';
  let renderTimer = null;

  const persist = () => save('pn.tasks', tasks);
  const persistSettings = () => save('pn.settings', settings);
  const persistTodos = () => save('pn.todos', todos);
  const persistCstk = () => save('pn.cstk', cstk);

  /* ================= Sonido y vibración ================= */
  const VOLS = { low: 0.3, mid: 0.6, high: 1 };
  const play = n => { if (window.SFX) window.SFX.play(n); };
  const buzz = ms => { if (settings.vibrate && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* nada */ } } };
  function applySound() { if (window.SFX) window.SFX.set({ on: settings.sound, vol: VOLS[settings.volume] || 0.6 }); }
  document.addEventListener('pointerdown', () => { if (window.SFX) window.SFX.unlock(); }, { once: true });

  /* ================= Lógica de fechas ================= */
  function occursOn(t, ds) {
    if (ds < t.date) return false;
    if (t.repeat === 'none') return ds === t.date;
    if (t.repeat === 'daily') return true;
    const a = parseYmd(t.date), b = parseYmd(ds);
    if (t.repeat === 'weekly') return a.getDay() === b.getDay();
    if (t.repeat === 'biweekly') return Math.round((b - a) / 864e5) % 14 === 0;
    if (t.repeat === 'monthly') return a.getDate() === b.getDate();
    if (t.repeat === 'yearly') return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    return false;
  }
  const isDone = (t, ds) => !!(t.done && t.done[ds]);
  const tasksOn = ds => tasks.filter(t => occursOn(t, ds));
  function isLate(t, ds) {
    if (!isTask(t)) return false;
    if (isDone(t, ds)) return false;
    const today = todayStr();
    if (ds < today) return true;
    if (ds === today && t.time) {
      const n = new Date();
      return t.time < `${pad(n.getHours())}:${pad(n.getMinutes())}`;
    }
    return false;
  }
  function fireTime(t, ds) {
    const [h, m] = (t.time || '09:00').split(':').map(Number);
    const d = parseYmd(ds);
    d.setHours(h, m, 0, 0);
    return d.getTime() - Math.max(0, t.remind) * 60e3;
  }

  /* ================= Pegatinas (dibujo) ================= */
  function stickerEl(s) {
    const it = window.STK && window.STK.byId[s.k];
    if (!it) return null;
    const el = document.createElement('span');
    el.className = 'stk' + (it.tape ? ' tape' : '');
    el.style.cssText = `left:${s.x}%;top:${s.y}%;--s:${s.s};--w:${it.w || 1};--rot:${s.r}deg`;
    el.innerHTML = it.svg;
    return el;
  }
  const hasCat = t => (t.stk || []).some(s => window.STK && window.STK.byId[s.k] && window.STK.byId[s.k].snd === 'cat');

  /* ================= Render: calendario ================= */
  function renderCalendar() {
    $('#month-title').textContent = `${MONTHS[viewM]} ${viewY}`;
    const grid = $('#grid');
    grid.innerHTML = '';
    const first = new Date(viewY, viewM, 1);
    const offset = (first.getDay() + 6) % 7;                 // semana empieza en lunes
    const total = new Date(viewY, viewM + 1, 0).getDate();
    const cells = Math.ceil((offset + total) / 7) * 7;
    const start = new Date(viewY, viewM, 1 - offset);
    const today = todayStr();

    for (let i = 0; i < cells; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const ds = ymd(d);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell' + (d.getMonth() !== viewM ? ' other' : '') + (ds < today ? ' past' : '') + (i % 7 >= 5 ? ' wknd' : '') + (ds === today ? ' today' : '') + (ds === sel ? ' sel' : '');
      cell.dataset.date = ds;
      cell.setAttribute('aria-label', `${d.getDate()} de ${MONTHS[d.getMonth()]}`);
      const n = document.createElement('span');
      n.className = 'n';
      n.textContent = d.getDate();
      cell.append(n);

      const list = tasksOn(ds);
      if (list.length) {
        const m = document.createElement('span');
        m.className = 'minis';
        list.slice(0, 3).forEach(t => {
          const s = document.createElement('i');
          const k = kindOf(t);
          s.className = 'mini' + (k === 'task' && isDone(t, ds) ? ' done' : '') + (k !== 'task' ? ' ' + k : '');
          if (k === 'bday') { s.textContent = '🎂'; }
          else s.style.background = COLORS[t.color];
          m.append(s);
        });
        if (list.length > 3) {
          const more = document.createElement('b');
          more.className = 'more';
          more.textContent = '+' + (list.length - 3);
          m.append(more);
        }
        cell.append(m);
      }
      grid.append(cell);
    }
    renderCalStk();
  }

  /* ================= Eventos destacados por año ================= */
  let starYear = new Date().getFullYear();
  function starRows(year) {
    const rows = [];
    tasks.filter(t => t.star && kindOf(t) === 'event').forEach(t => {
      if (['daily', 'weekly', 'biweekly'].includes(t.repeat)) {
        if (parseYmd(t.date).getFullYear() <= year) rows.push({ t, ds: t.date > `${year}-01-01` ? t.date : `${year}-01-01`, every: true });
        return;
      }
      for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
        const ds = ymd(d);
        if (occursOn(t, ds)) rows.push({ t, ds });
      }
    });
    return rows.sort((a, b) => a.ds.localeCompare(b.ds) || (a.t.time || '').localeCompare(b.t.time || ''));
  }
  function renderStars() {
    $('#stars-year').textContent = starYear;
    const box = $('#stars-list');
    box.innerHTML = '';
    const rows = starRows(starYear);
    if (!rows.length) {
      const e = document.createElement('p');
      e.className = 'stars-empty';
      e.textContent = 'Aún no hay eventos destacados este año. Crea un 📌 Evento y elige ⭐ Destacado.';
      box.append(e);
      return;
    }
    let lastM = -1;
    rows.forEach(({ t, ds, every }) => {
      const d = parseYmd(ds);
      if (d.getMonth() !== lastM) {
        lastM = d.getMonth();
        const h = document.createElement('div');
        h.className = 'stars-month';
        h.textContent = MONTHS[lastM];
        box.append(h);
      }
      const r = document.createElement('button');
      r.type = 'button';
      r.className = 'star-row';
      r.style.setProperty('--c', COLORS[t.color]);
      const dn = document.createElement('span');
      dn.className = 'sr-day';
      dn.textContent = every ? '🔁' : d.getDate();
      const tx = document.createElement('span');
      tx.className = 'sr-txt';
      const ti = document.createElement('b');
      ti.textContent = t.title;
      const meta = document.createElement('small');
      meta.textContent = (every ? REPEAT_TXT[t.repeat] : ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'][d.getDay()]) + (t.time ? ' · ⏰ ' + t.time : '');
      tx.append(ti, meta);
      r.append(dn, tx);
      r.addEventListener('click', () => { play('tap'); openEditor(t); });
      box.append(r);
    });
  }
  $('#stars-prev').addEventListener('click', () => { play('flip'); starYear--; renderStars(); });
  $('#stars-next').addEventListener('click', () => { play('flip'); starYear++; renderStars(); });

  /* ================= Render: post-its ================= */
  function makeCard(t, ds, compact, anim) {
    const kind = kindOf(t);
    const done = kind === 'task' && isDone(t, ds);
    const card = document.createElement('div');
    card.className = 'note' + (kind !== 'task' ? ' ' + kind : '') + (done ? ' done' : '') + (compact ? ' compact' : '') + (anim ? ' anim' : '');
    card.style.setProperty('--c', COLORS[t.color]);
    card.style.setProperty('--r', (((hash(t.id) % 50) - 25) / 10) + 'deg');
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.append(paperEl());

    const top = document.createElement('div');
    top.className = 'top';
    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'check';
    check.setAttribute('aria-label', done ? 'Marcar como pendiente' : 'Marcar como hecha');
    check.innerHTML = CHECK_SVG;
    if (kind === 'task') top.append(check);
    else { const ic = document.createElement('span'); ic.className = 'kind-ic'; ic.textContent = KIND_ICON[kind] + (t.star ? '⭐' : ''); top.append(ic); }
    if (t.time) {
      const tm = document.createElement('span');
      tm.className = 'time';
      tm.textContent = '⏰ ' + t.time;
      top.append(tm);
    }

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = t.title;
    card.append(top, title);

    const subs = t.subs || [];
    const subsDone = (t.sdone && t.sdone[ds]) || [];
    if (!compact && subs.length) {
      const box = document.createElement('div');
      box.className = 'subs';
      subs.slice(0, 5).forEach(s => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'sub' + (subsDone.includes(s.id) ? ' on' : '');
        const bx = document.createElement('i');
        bx.className = 'bx';
        bx.innerHTML = CHECK_SVG;
        const tx = document.createElement('span');
        tx.textContent = s.t;
        b.append(bx, tx);
        b.addEventListener('click', e => { e.stopPropagation(); toggleSub(t, ds, s.id); });
        box.append(b);
      });
      if (subs.length > 5) {
        const more = document.createElement('div');
        more.className = 'sub-more';
        more.textContent = `+${subs.length - 5} más`;
        box.append(more);
      }
      card.append(box);
    }

    const meta = document.createElement('div');
    meta.className = 'meta';
    if (isLate(t, ds)) { const l = document.createElement('span'); l.className = 'late'; l.textContent = '¡atrasada!'; meta.append(l); }
    if (compact && subs.length) { const c = document.createElement('span'); c.textContent = `☑ ${subsDone.filter(id => subs.some(s => s.id === id)).length}/${subs.length}`; meta.append(c); }
    if (t.repeat !== 'none') { const r = document.createElement('span'); r.textContent = '🔁' + (compact ? '' : ' ' + REPEAT_TXT[t.repeat]); meta.append(r); }
    if (t.remind >= 0) { const b = document.createElement('span'); b.textContent = '🔔'; meta.append(b); }
    card.append(meta);

    (t.stk || []).forEach(s => { const el = stickerEl(s); if (el) card.append(el); });

    if (kind === 'task') check.addEventListener('click', e => { e.stopPropagation(); toggleDone(t, ds, card, check); });
    card.addEventListener('click', () => openEditor(t));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openEditor(t); });
    return card;
  }

  function renderList(anim) {
    const d = parseYmd(sel);
    const isToday = sel === todayStr();
    $('#day-title').textContent = (isToday ? 'Hoy · ' : '') + cap(DAYS[d.getDay()]) + ` ${d.getDate()} de ${MONTHS[d.getMonth()]}`;

    const list = tasksOn(sel).sort(byTime);
    const tl = list.filter(isTask);
    const doneN = tl.filter(t => isDone(t, sel)).length;
    const prog = $('#progress');
    prog.innerHTML = '';
    if (tl.length) {
      const txt = document.createElement('span');
      txt.textContent = `${doneN} de ${tl.length}`;
      const bar = document.createElement('span');
      bar.className = 'bar';
      const fill = document.createElement('i');
      fill.style.width = Math.round(doneN / tl.length * 100) + '%';
      bar.append(fill);
      prog.append(txt, bar);
      prog.style.display = '';
    } else {
      prog.style.display = 'none';
    }

    const box = $('#notes');
    box.innerHTML = '';
    if (!list.length) {
      const e = document.createElement('div');
      e.className = 'note empty' + (anim ? ' anim' : '');
      e.append(paperEl());
      const t = document.createElement('div');
      t.className = 'title';
      t.textContent = isToday ? 'Nada para hoy… ¡toca + para pegar una nota!' : 'Sin notas este día. ¡Toca + para pegar una!';
      e.append(t);
      box.append(e);
    } else {
      list.forEach(t => box.append(makeCard(t, sel, false, anim)));
    }
  }

  /* ================= Render: semana ================= */
  function renderWeek(anim, center) {
    const d = parseYmd(sel);
    const start = new Date(d);
    start.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const sm = MONTHS[start.getMonth()], em = MONTHS[end.getMonth()];
    $('#week-title').textContent = start.getMonth() === end.getMonth()
      ? `${start.getDate()} – ${end.getDate()} de ${em}`
      : `${start.getDate()} ${sm.slice(0, 3)} – ${end.getDate()} ${em.slice(0, 3)}`;

    const board = $('#week-board');
    const keep = board.scrollLeft;
    board.innerHTML = '';
    const today = todayStr();
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const ds = ymd(day);
      const col = document.createElement('div');
      col.className = 'col' + (ds < today ? ' past' : '') + (i >= 5 ? ' wknd' : '') + (ds === today ? ' today' : '') + (ds === sel ? ' sel' : '');
      col.dataset.date = ds;

      const head = document.createElement('button');
      head.type = 'button';
      head.className = 'col-head';
      const dn = document.createElement('span');
      dn.className = 'dn';
      dn.textContent = DAYS[day.getDay()].slice(0, 3);
      const dd = document.createElement('span');
      dd.className = 'dd';
      dd.textContent = day.getDate();
      head.append(dn, dd);

      const box = document.createElement('div');
      box.className = 'col-notes';
      const list = tasksOn(ds).sort(byTime);
      list.forEach(t => box.append(makeCard(t, ds, true, anim)));
      if (!list.length) {
        const e = document.createElement('div');
        e.className = 'col-empty';
        e.textContent = 'libre ✨';
        box.append(e);
      }

      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'col-add';
      add.textContent = '+ nota';
      col.append(head, box, add);
      board.append(col);
    }
    requestAnimationFrame(() => {
      if (center) {
        const t = board.querySelector('.col.sel');
        if (t) board.scrollLeft = Math.max(0, t.offsetLeft - (board.clientWidth - t.offsetWidth) / 2);
      } else {
        board.scrollLeft = keep;
      }
    });
  }

  function render(anim = true, center = true) {
    clearTimeout(renderTimer);
    if (settings.view === 'week') {
      renderWeek(anim, center);
    } else if (settings.view === 'todo') {
      renderTodos();
    } else if (settings.view === 'stars') {
      renderStars();
    } else {
      renderCalendar();
      renderList(anim);
    }
  }

  function setView(v) {
    settings.view = v;
    persistSettings();
    document.body.dataset.view = v;
    $('#v-month').classList.toggle('on', v === 'month');
    $('#v-week').classList.toggle('on', v === 'week');
    $('#v-todo').classList.toggle('on', v === 'todo');
    $('#v-stars').classList.toggle('on', v === 'stars');
    const d = parseYmd(sel);
    viewY = d.getFullYear();
    viewM = d.getMonth();
    render();
  }

  /* ================= Acciones sobre notas ================= */
  function burst(host) {
    const palette = COLORS.concat(['#e5484d', '#4caf50']);
    for (let i = 0; i < 12; i++) {
      const b = document.createElement('span');
      b.className = 'bit';
      b.style.background = palette[i % palette.length];
      const ang = Math.random() * Math.PI * 2, dist = 30 + Math.random() * 40;
      b.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      b.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      b.style.setProperty('--rot', (Math.random() * 360) + 'deg');
      host.append(b);
      setTimeout(() => b.remove(), 800);
    }
  }

  function toggleDone(t, ds, card, check) {
    t.done = t.done || {};
    if (t.done[ds]) {
      delete t.done[ds];
      persist();
      play('uncheck');
      render(false, false);
      syncReminders();
    } else {
      t.done[ds] = true;
      persist();
      card.classList.add('done');
      burst(check);
      play('check');
      buzz(25);
      if (hasCat(t)) setTimeout(() => play(Math.random() < 0.5 ? 'mew' : 'meow'), 420);
      const list = tasksOn(ds);
      if (list.length >= 2 && list.every(x => isDone(x, ds))) {
        setTimeout(() => { play('tada'); toast('¡Terminaste todo el día! 🎉'); }, 600);
      }
      const seq = `${t.id}_${ds}`;
      if (sent[seq]) { delete sent[seq]; save('pn.sent', sent); ntfyDelete(seq); }
      renderTimer = setTimeout(() => render(false, false), 650);
    }
  }

  function toggleSub(t, ds, sid) {
    t.sdone = t.sdone || {};
    const arr = t.sdone[ds] || (t.sdone[ds] = []);
    const i = arr.indexOf(sid);
    if (i >= 0) arr.splice(i, 1); else arr.push(sid);
    persist();
    play('sub');
    buzz(8);
    render(false, false);
  }

  function removeTask(id) {
    cancelTask(id);
    tasks = tasks.filter(t => t.id !== id);
    persist();
  }

  /* ================= Editor ================= */
  const editor = $('#editor');
  const settingsSheet = $('#settings');
  const backdrop = $('#backdrop');

  function openSheet(el) { play('open'); backdrop.classList.add('show'); el.classList.add('open'); }
  function closeSheets() {
    const was = editor.classList.contains('open') || settingsSheet.classList.contains('open');
    backdrop.classList.remove('show');
    editor.classList.remove('open');
    settingsSheet.classList.remove('open');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    if (was) play('close');
  }

  function buildChips(el, options, get, set) {
    el.innerHTML = '';
    options.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (get() === o.v ? ' on' : '');
      b.textContent = o.l;
      b.addEventListener('click', () => { play('chip'); set(o.v); buildChips(el, options, get, set); });
      el.append(b);
    });
  }

  function buildSwatches() {
    const box = $('#f-color');
    box.innerHTML = '';
    COLORS.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'sw' + (ed.color === i ? ' on' : '');
      b.style.setProperty('--c', c);
      b.style.setProperty('--r', (i % 2 ? 4 : -4) + 'deg');
      b.setAttribute('aria-label', 'Color ' + (i + 1));
      b.addEventListener('click', () => { play('swatch'); ed.color = i; editor.style.setProperty('--sheet', c); buildSwatches(); });
      box.append(b);
    });
  }

  /* --- subtareas --- */
  function updateCounts() {
    const n = edSubs.filter(s => s.t.trim()).length;
    $('#subs-count').textContent = n ? `(${n})` : '';
    $('#stk-count').textContent = stk.length ? `(${stk.length})` : '';
  }
  function renderSubsEdit() {
    const box = $('#f-subs');
    box.innerHTML = '';
    edSubs.forEach((s, i) => {
      const row = document.createElement('div');
      row.className = 'sub-row';
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 60;
      inp.value = s.t;
      inp.placeholder = 'Paso…';
      inp.addEventListener('input', () => { s.t = inp.value; updateCounts(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSub(i + 1); } });
      const x = document.createElement('button');
      x.type = 'button';
      x.className = 'x2';
      x.textContent = '✕';
      x.setAttribute('aria-label', 'Quitar paso');
      x.addEventListener('click', () => { play('tap'); edSubs.splice(i, 1); renderSubsEdit(); });
      row.append(inp, x);
      box.append(row);
    });
    updateCounts();
  }
  function addSub(at) {
    if (edSubs.length >= 20) { toast('Ya son muchos pasos 😅'); return; }
    const i = at == null ? edSubs.length : at;
    edSubs.splice(i, 0, { id: 's' + Math.random().toString(36).slice(2, 8), t: '' });
    renderSubsEdit();
    play('tap');
    const inp = $('#f-subs').children[i] && $('#f-subs').children[i].querySelector('input');
    if (inp) inp.focus();
  }

  /* --- pegatinas en el editor --- */
  function renderStage() {
    const st = $('#stage');
    st.querySelectorAll('.stk').forEach(e => e.remove());
    stk.forEach((s, i) => {
      const el = stickerEl(s);
      if (!el) return;
      el.dataset.i = i;
      if (i === selStk) el.classList.add('sel');
      st.append(el);
    });
    $('#stk-tools').hidden = selStk < 0 || !stk[selStk];
    updateCounts();
  }
  function renderPacks() {
    if (!window.STK) return;
    const tabs = $('#pack-tabs');
    const keepTabs = tabs.scrollLeft;
    tabs.innerHTML = '';
    window.STK.packs.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pack-tab' + (p.id === curPack ? ' on' : '');
      b.textContent = p.icon;
      b.title = p.name;
      b.setAttribute('aria-label', p.name);
      b.addEventListener('click', () => { play('chip'); curPack = p.id; renderPacks(); });
      tabs.append(b);
    });
    tabs.scrollLeft = keepTabs;
    const pack = window.STK.packs.find(p => p.id === curPack) || window.STK.packs[0];
    $('#pack-name').textContent = `${pack.icon} ${pack.name} · ${pack.items.length}`;
    const grid = $('#pack-grid');
    grid.innerHTML = '';
    pack.items.forEach(it => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pack-item' + (it.tape ? ' wide' : '') + (it.w > 1 && !it.tape ? ' wide' : '');
      b.setAttribute('aria-label', it.id);
      b.innerHTML = it.svg;
      b.addEventListener('click', () => addSticker(it));
      grid.append(b);
    });
  }
  function addSticker(it) {
    if (stk.length >= MAX_STK) { toast('¡Ya hay muchas pegatinas! 😸'); play('error'); return; }
    const s = { k: it.id, x: 50 + (Math.random() * 44 - 22), y: 50 + (Math.random() * 44 - 22), s: 1, r: Math.round(Math.random() * 24 - 12) };
    if (it.snd === 'pin') { s.y = 10; s.x = 36 + Math.random() * 28; s.r = 0; }
    if (it.tape) { s.y = 12 + Math.random() * 10; s.x = 50; s.r = Math.round(Math.random() * 14 - 7); }
    stk.push(s);
    selStk = stk.length - 1;
    renderStage();
    play(it.snd === 'cat' ? (Math.random() < 0.5 ? 'meow' : 'mew') : (it.snd || 'sticker'));
    buzz(10);
  }

  function openEditor(t, ds, pre) {
    ed = t
      ? { id: t.id, color: t.color, repeat: t.repeat, remind: t.remind, kind: kindOf(t), star: !!t.star }
      : { id: null, color: Math.floor(Math.random() * COLORS.length), repeat: 'none', remind: 0, kind: (pre && pre.kind) || 'task', star: false, fromTodo: pre ? pre.fromTodo : null };
    const ttl = t ? t.title : (pre ? pre.title : '');
    $('#f-title').value = ttl;
    $('#stage-title').textContent = ttl;
    $('#f-date').value = t ? t.date : (ds || sel);
    $('#f-time').value = t ? t.time : '';
    $('#f-delete').style.display = t ? '' : 'none';
    $('#f-save').textContent = t ? 'Guardar' : (pre ? 'Poner en el calendario' : 'Pegar nota');
    edSubs = t && t.subs ? t.subs.map(s => ({ id: s.id, t: s.t })) : [];
    stk = t && t.stk ? t.stk.map(s => Object.assign({}, s)) : [];
    selStk = -1;
    editor.style.setProperty('--sheet', COLORS[ed.color]);
    const setKind = v => {
      ed.kind = v;
      $('#f-title').placeholder = KIND_PH[v];
      if (v === 'bday') { ed.repeat = 'yearly'; if (!ed.id) ed.color = 1; }
      if (v !== 'task' && !ed.id && ed.remind === 0 && v === 'event') ed.remind = 60;
      editor.style.setProperty('--sheet', COLORS[ed.color]);
      buildChips($('#f-repeat'), REPEATS, () => ed.repeat, x => { ed.repeat = x; });
      buildChips($('#f-remind'), REMINDS, () => ed.remind, x => { ed.remind = x; });
      buildSwatches();
      $('#d-subs').style.display = v === 'task' ? '' : 'none';
      $('#f-star-wrap').style.display = v === 'event' ? '' : 'none';
    };
    buildChips($('#f-kind'), KINDS, () => ed.kind, setKind);
    $('#f-title').placeholder = KIND_PH[ed.kind];
    $('#d-subs').style.display = ed.kind === 'task' ? '' : 'none';
    $('#f-star-wrap').style.display = ed.kind === 'event' ? '' : 'none';
    buildChips($('#f-star'), [{ v: false, l: '☆ Normal' }, { v: true, l: '⭐ Destacado' }], () => ed.star, v => { ed.star = v; });
    buildChips($('#f-repeat'), REPEATS, () => ed.repeat, v => { ed.repeat = v; });
    buildChips($('#f-remind'), REMINDS, () => ed.remind, v => { ed.remind = v; });
    buildSwatches();
    renderSubsEdit();
    renderStage();
    renderPacks();
    $('#d-subs').open = edSubs.length > 0;
    $('#d-stk').open = stk.length > 0;
    editor.scrollTop = 0;
    openSheet(editor);
    if (!t && !pre) setTimeout(() => $('#f-title').focus(), 320);
  }

  function saveEditor() {
    const titleEl = $('#f-title');
    const title = titleEl.value.trim();
    if (!title) {
      play('error');
      titleEl.classList.remove('shake');
      void titleEl.offsetWidth;
      titleEl.classList.add('shake');
      titleEl.focus();
      return;
    }
    const date = $('#f-date').value || sel;
    const time = $('#f-time').value || '';
    const subs = ed.kind !== 'task' ? [] : edSubs.filter(s => s.t.trim()).map(s => ({ id: s.id, t: s.t.trim().slice(0, 60) }));
    const data = {
      kind: ed.kind, star: ed.kind === 'event' && !!ed.star, title, date, time, repeat: ed.repeat, remind: ed.remind, color: ed.color,
      subs, stk: stk.map(s => Object.assign({}, s))
    };

    if (ed.id) {
      const t = tasks.find(x => x.id === ed.id);
      if (t) {
        cancelTask(t.id);
        if (t.date !== date) { t.done = {}; t.sdone = {}; }
        Object.assign(t, data);
      }
    } else {
      tasks.push(Object.assign({ id: newId(), done: {}, sdone: {}, created: Date.now() }, data));
    }
    persist();
    sel = date;
    const d = parseYmd(date);
    viewY = d.getFullYear();
    viewM = d.getMonth();
    const wasEdit = !!ed.id;
    const fromTodo = ed.fromTodo;
    if (fromTodo) { todos = todos.filter(x => x.id !== fromTodo); persistTodos(); }
    closeSheets();
    render();
    syncReminders();
    play(wasEdit ? 'update' : 'paste');
    buzz(15);
    toast(wasEdit ? 'Nota actualizada ✏️' : (fromTodo ? `Pasó al calendario: ${d.getDate()} de ${MONTHS[d.getMonth()]} 📌` : 'Nota pegada 📌'));
  }

  function deleteFromEditor() {
    const t = tasks.find(x => x.id === ed.id);
    if (!t) return;
    const msg = t.repeat !== 'none' ? '¿Borrar esta nota y todas sus repeticiones?' : '¿Borrar esta nota?';
    if (!confirm(msg)) return;
    removeTask(t.id);
    closeSheets();
    render();
    play('peel');
    toast('Nota despegada 🗑️');
  }

  /* ================= Por hacer ================= */
  function renderTodos() {
    const box = $('#todo-list');
    box.innerHTML = '';
    const open = todos.filter(x => !x.done);
    const done = todos.filter(x => x.done);
    open.concat(done).forEach(item => box.append(todoRow(item)));
    if (!todos.length) {
      const e = document.createElement('div');
      e.className = 'todo-empty';
      e.textContent = 'Aquí van las cosas que quieres hacer, aunque todavía no sepas cuándo ✨';
      box.append(e);
    }
    $('#todo-badge').textContent = open.length ? String(open.length) : '';
    $('#todo-clear').style.display = done.length ? '' : 'none';
  }

  function todoRow(item) {
    const row = document.createElement('div');
    row.className = 'todo-row' + (item.done ? ' done' : '');
    const chk = document.createElement('button');
    chk.type = 'button';
    chk.className = 'tcheck';
    chk.setAttribute('aria-label', item.done ? 'Marcar como pendiente' : 'Marcar como hecha');
    chk.innerHTML = CHECK_SVG;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.maxLength = 100;
    inp.value = item.t;
    inp.setAttribute('aria-label', 'Idea');
    inp.addEventListener('change', () => {
      const v = inp.value.trim();
      if (v) { item.t = v; persistTodos(); } else { inp.value = item.t; }
    });
    const day = document.createElement('button');
    day.type = 'button';
    day.className = 'tbtn';
    day.textContent = '📅';
    day.setAttribute('aria-label', 'Establecer día');
    day.title = 'Establecer día';
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'tbtn tdel';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Borrar');
    row.append(chk, inp, day, del);

    chk.addEventListener('click', () => {
      if (item.done) {
        item.done = false;
        persistTodos();
        play('uncheck');
        renderTodos();
      } else {
        item.done = true;
        persistTodos();
        row.classList.add('done');
        burst(chk);
        play('check');
        buzz(20);
        setTimeout(renderTodos, 650);
      }
    });
    day.addEventListener('click', () => { play('pop'); openEditor(null, todayStr(), { title: item.t, fromTodo: item.id }); });
    del.addEventListener('click', () => {
      play('peel');
      todos = todos.filter(x => x.id !== item.id);
      persistTodos();
      renderTodos();
    });
    return row;
  }

  function addTodo(e) {
    e.preventDefault();
    const inp = $('#todo-input');
    const v = inp.value.trim();
    if (!v) {
      play('error');
      inp.classList.remove('shake');
      void inp.offsetWidth;
      inp.classList.add('shake');
      return;
    }
    todos.push({ id: newId(), t: v.slice(0, 100), done: false, created: Date.now() });
    persistTodos();
    inp.value = '';
    play('paste');
    buzz(12);
    renderTodos();
    inp.focus();
  }

  /* ================= Recordatorios (ntfy) ================= */
  const encHeader = s => /^[\x20-\x7e]*$/.test(s) ? s : '=?UTF-8?B?' + btoa(unescape(encodeURIComponent(s))) + '?=';
  const appUrl = () => location.origin + location.pathname;

  async function ntfyPost(seq, o) {
    const headers = { 'Title': encHeader(o.title), 'Tags': 'memo', 'Priority': '4', 'Click': appUrl() };
    if (o.fireAt) headers['Delay'] = String(Math.floor(o.fireAt / 1000));
    const res = await fetch(`${NTFY}/${settings.topic}${seq ? '/' + seq : ''}`, { method: 'POST', headers, body: o.body });
    if (!res.ok) throw new Error('ntfy ' + res.status);
  }
  function ntfyDelete(seq) {
    return fetch(`${NTFY}/${settings.topic}/${seq}`, { method: 'DELETE' }).catch(() => { });
  }

  /* ----- avisos propios de Android (APK) ----- */
  const LN = () => (isNative() ? nativePlugin('LocalNotifications') : null);
  const NATIVE_DAYS = 45, NATIVE_MAX = 150;
  async function nativeCancelAll(ln) {
    try {
      const pend = await ln.getPending();
      if (pend && pend.notifications && pend.notifications.length) await ln.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
    } catch (e) { /* nada que cancelar */ }
  }
  async function nativePerm(ln, ask) {
    let p = await ln.checkPermissions();
    if (p.display !== 'granted' && ask) p = await ln.requestPermissions();
    return p.display === 'granted';
  }
  let nativeInfo = '';
  async function syncNative(ln) {
    await nativeCancelAll(ln);
    if (!settings.remindersOn) { nativeInfo = ''; return; }
    if (!(await nativePerm(ln, true))) { nativeInfo = 'Android no me dejó mandar avisos. Actívalos en Ajustes del teléfono → Apps → Calendario → Notificaciones.'; return; }
    const now = Date.now(), list = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (const t of tasks) {
      if (t.remind < 0) continue;
      for (let i = 0; i <= NATIVE_DAYS; i++) {
        const d = new Date(base);
        d.setDate(d.getDate() + i);
        const ds = ymd(d);
        if (!occursOn(t, ds) || (isTask(t) && isDone(t, ds))) continue;
        const fireAt = fireTime(t, ds);
        if (fireAt < now + 5e3) continue;
        list.push({ fireAt, title: (KIND_ICON[kindOf(t)] || '📝') + ' ' + t.title.slice(0, 100), body: bodyFor(t, ds) });
      }
    }
    list.sort((a, b) => a.fireAt - b.fireAt);
    const items = list.slice(0, NATIVE_MAX).map((x, i) => ({
      id: i + 1, title: x.title, body: x.body,
      schedule: { at: new Date(x.fireAt), allowWhileIdle: true }
    }));
    if (items.length) await ln.schedule({ notifications: items });
    nativeInfo = items.length ? `Avisos programados en tu teléfono: ${items.length}` : 'Todavía no hay avisos programados.';
  }

  function cancelTask(id) {
    if (LN()) { setTimeout(syncReminders, 300); return; }
    Object.keys(sent).filter(k => k.startsWith(id + '_')).forEach(k => { delete sent[k]; ntfyDelete(k); });
    save('pn.sent', sent);
  }
  function cancelAll() {
    if (LN()) { nativeCancelAll(LN()); return; }
    Object.keys(sent).forEach(k => ntfyDelete(k));
    sent = {};
    save('pn.sent', sent);
  }

  function bodyFor(t, ds) {
    const d = parseYmd(ds);
    const lead = { 0: 'Es ahora', 10: 'En 10 minutos', 60: 'En 1 hora', 1440: 'Mañana' }[t.remind] || 'Recordatorio';
    return `${lead} · ${DAYS[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} · ${t.time || 'todo el día'}`;
  }

  let syncing = false, again = false;
  async function syncReminders() {
    if (syncing) { again = true; return; }
    syncing = true;
    try {
      const ln = LN();
      if (ln) { try { await syncNative(ln); } catch (e) { nativeInfo = 'No se pudieron programar los avisos.'; } return; }
      if (!settings.remindersOn || !settings.topic) return;
      const now = Date.now(), horizon = now + HORIZON;
      Object.keys(sent).forEach(k => { if (sent[k] < now - 3600e3) delete sent[k]; });
      const base = new Date();
      base.setHours(0, 0, 0, 0);
      for (const t of tasks) {
        if (t.remind < 0) continue;
        for (let i = -1; i <= 4; i++) {
          const d = new Date(base);
          d.setDate(d.getDate() + i);
          const ds = ymd(d);
          if (!occursOn(t, ds) || isDone(t, ds)) continue;
          const fireAt = fireTime(t, ds);
          if (fireAt < now + MIN_AHEAD || fireAt > horizon) continue;
          const seq = `${t.id}_${ds}`;
          if (sent[seq] === fireAt) continue;
          try {
            if (sent[seq]) await ntfyDelete(seq);
            await ntfyPost(seq, { title: '📝 ' + t.title.slice(0, 100), body: bodyFor(t, ds), fireAt });
            sent[seq] = fireAt;
            save('pn.sent', sent);
          } catch (e) { /* sin internet: se reintenta luego */ }
        }
      }
    } finally {
      syncing = false;
      if (again) { again = false; syncReminders(); }
      if (settingsSheet.classList.contains('open')) renderSettings();
    }
  }

  /* ================= Ajustes ================= */
  const THEMES = [{ v: 'auto', l: 'Automático' }, { v: 'light', l: 'Claro' }, { v: 'dark', l: 'Oscuro' }];

  function applyTheme() { document.documentElement.dataset.theme = settings.theme; }
  function applyBoard() {
    document.documentElement.dataset.board = settings.board;
    const b = BOARDS.find(x => x.v === settings.board);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m && b) m.setAttribute('content', b.c);
  }
  function setStatus(msg) { $('#s-status').textContent = msg; }

  function renderBoards() {
    const box = $('#s-board');
    box.innerHTML = '';
    BOARDS.forEach(b => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'board-opt' + (settings.board === b.v ? ' on' : '');
      btn.dataset.b = b.v;
      const sw = document.createElement('span');
      sw.className = 'bsw';
      const lb = document.createElement('span');
      lb.textContent = b.l;
      btn.append(sw, lb);
      btn.addEventListener('click', () => {
        play('paste');
        settings.board = b.v;
        persistSettings();
        applyBoard();
        renderBoards();
      });
      box.append(btn);
    });
  }

  function renderSettings() {
    $('#s-topic').value = settings.topic;
    buildChips($('#s-theme'), THEMES, () => settings.theme, v => { settings.theme = v; persistSettings(); applyTheme(); });
    buildChips($('#s-remind-on'), [{ v: true, l: 'Avisos activados' }, { v: false, l: 'Desactivados' }], () => settings.remindersOn, v => {
      settings.remindersOn = v;
      persistSettings();
      if (v) syncReminders(); else cancelAll();
      renderSettings();
    });
    buildChips($('#s-sound'), [{ v: true, l: '🔊 Sonidos activados' }, { v: false, l: '🔇 Sin sonido' }], () => settings.sound, v => {
      settings.sound = v; persistSettings(); applySound();
      if (v) setTimeout(() => play('bell'), 80);
    });
    buildChips($('#s-volume'), [{ v: 'low', l: 'Bajito' }, { v: 'mid', l: 'Medio' }, { v: 'high', l: 'Fuerte' }], () => settings.volume, v => {
      settings.volume = v; persistSettings(); applySound();
      setTimeout(() => play('pop'), 60);
    });
    buildChips($('#s-vibrate'), [{ v: true, l: '📳 Vibración' }, { v: false, l: 'Sin vibración' }], () => settings.vibrate, v => {
      settings.vibrate = v; persistSettings();
      if (v) buzz(40);
    });
    renderBoards();

    const sfx = $('#s-board-sfx');
    sfx.innerHTML = '';
    (window.SFX ? window.SFX.names : []).forEach(n => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = SFX_LABELS[n] || n;
      b.addEventListener('click', () => play(n));
      sfx.append(b);
    });

    $('#s-storage').textContent = storage.native
      ? '✅ Tus notas se guardan en 3 lugares dentro del teléfono (la app, una base de datos y el almacenamiento de Android). Limpiar la caché no las toca. Si algún día desinstalas la app, Android puede restaurarlas desde tu copia de Google.'
      : (storage.persisted
        ? '✅ El navegador protegió tus datos: no se borran solos cuando falta espacio. Además hay una segunda copia interna. Si borras "datos del sitio" a propósito, sí se perderían: haz copias con Exportar.'
        : '⚠️ El navegador no confirmó la protección. Hay una segunda copia interna, pero si borras los datos del sitio se perderían. Haz copias con Exportar de vez en cuando.');
    $('#s-lastbackup').textContent = settings.lastExport
      ? 'Última copia exportada: ' + new Date(settings.lastExport).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
      : 'Todavía no has exportado ninguna copia.';
    const n = Object.values(sent).filter(ms => ms > Date.now()).length;
    if (LN()) setStatus(settings.remindersOn ? (nativeInfo || 'Avisos listos.') : 'Los avisos están desactivados.');
    else if (settings.remindersOn) setStatus(n ? `Avisos programados ahora: ${n}` : 'Todavía no hay avisos programados.');
    else setStatus('Los avisos están desactivados.');
  }

  async function sendTest() {
    const ln = LN();
    if (ln) {
      try {
        if (!(await nativePerm(ln, true))) { setStatus('Android no me dejó mandar avisos. Actívalos en Ajustes del teléfono.'); play('error'); return; }
        await ln.schedule({ notifications: [{ id: 999999, title: '📝 ¡Funciona!', body: 'Así te llegarán tus recordatorios del Calendario.', schedule: { at: new Date(Date.now() + 4000), allowWhileIdle: true } }] });
        setStatus('Te llegará en 4 segundos ✓ (puedes salir de la app para verlo)');
        play('bell');
      } catch (e) { setStatus('No se pudo enviar la prueba.'); play('error'); }
      return;
    }
    setStatus('Enviando…');
    try {
      await ntfyPost('', { title: '📝 ¡Funciona!', body: 'Así te llegarán tus recordatorios del Calendario.' });
      setStatus('Enviada ✓ Revisa tu celular (en la app ntfy).');
      play('bell');
    } catch (e) {
      setStatus('No se pudo enviar. ¿Tienes internet?');
      play('error');
    }
  }

  function saveTopic() {
    const v = $('#s-topic').value.trim();
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(v)) {
      setStatus('El tema debe tener de 8 a 64 letras, números, - o _ (sin espacios).');
      play('error');
      return;
    }
    if (v === settings.topic) { setStatus('Ese ya es tu tema.'); return; }
    cancelAll();                         // limpia los avisos del tema anterior
    settings.topic = v;
    persistSettings();
    setStatus('Tema guardado ✓');
    play('bell');
    syncReminders();
  }

  async function copyTopic() {
    const v = $('#s-topic').value;
    try { await navigator.clipboard.writeText(v); toast('Tema copiado 📋'); play('pop'); }
    catch (e) { $('#s-topic').select(); toast('Selecciónalo y cópialo'); }
  }

  async function exportData() {
    const payload = { app: 'calendario', v: 3, topic: settings.topic, tasks, todos, cstk };
    const text = JSON.stringify(payload, null, 1);
    const name = `calendario-${todayStr()}.json`;
    const fsys = nativePlugin('Filesystem'), share = nativePlugin('Share');
    if (storage.native && fsys && share) {                       // en la app: abre el menú de compartir
      try {
        await fsys.writeFile({ path: name, data: text, directory: 'CACHE', encoding: 'utf8' });
        const u = await fsys.getUri({ path: name, directory: 'CACHE' });
        await share.share({ title: 'Copia del Calendario', text: 'Guarda este archivo en un lugar seguro', url: u.uri, dialogTitle: 'Guardar copia' });
        markBackup();
        return;
      } catch (e) {
        if (/cancel/i.test(String(e && e.message))) return;
      }
    }
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    markBackup();
  }
  function markBackup() {
    settings.lastExport = Date.now();
    persistSettings();
    play('bell');
    toast('Copia guardada 💾');
    if (settingsSheet.classList.contains('open')) renderSettings();
  }

  const cleanStk = a => (Array.isArray(a)
    ? a.filter(s => s && window.STK && window.STK.byId[s.k]).slice(0, MAX_STK).map(s => ({
      k: s.k, x: num(s.x, 0, 100, 50), y: num(s.y, 0, 100, 50), s: num(s.s, 0.4, 3.2, 1), r: num(s.r, -720, 720, 0)
    }))
    : []);

  function cleanTask(x) {
    if (!x || typeof x.title !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x.date || '')) return null;
    const subs = Array.isArray(x.subs)
      ? x.subs.filter(s => s && typeof s.t === 'string' && /^[A-Za-z0-9]{2,12}$/.test(s.id || '')).slice(0, 20).map(s => ({ id: s.id, t: s.t.slice(0, 60) }))
      : [];
    const stks = cleanStk(x.stk);
    return {
      id: /^[A-Za-z0-9-]{3,40}$/.test(x.id || '') ? x.id : newId(),
      kind: x.kind === 'event' || x.kind === 'bday' ? x.kind : 'task',
      star: x.kind === 'event' && !!x.star,
      title: x.title.slice(0, 140),
      date: x.date,
      time: /^\d{2}:\d{2}$/.test(x.time || '') ? x.time : '',
      repeat: REPEAT_KEYS.includes(x.repeat) ? x.repeat : 'none',
      remind: [-1, 0, 10, 60, 1440].includes(x.remind) ? x.remind : -1,
      color: Number.isInteger(x.color) && x.color >= 0 && x.color < COLORS.length ? x.color : 0,
      done: x.done && typeof x.done === 'object' ? x.done : {},
      sdone: x.sdone && typeof x.sdone === 'object' ? x.sdone : {},
      subs, stk: stks,
      created: x.created || Date.now()
    };
  }

  function importData(file) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.tasks)) throw new Error('formato');
        const list = data.tasks.map(cleanTask).filter(Boolean);
        if (!confirm(`Esto reemplaza tus ${tasks.length} notas actuales por ${list.length} del archivo. ¿Seguir?`)) return;
        cancelAll();
        tasks = list;
        persist();
        if (Array.isArray(data.todos)) {
          todos = data.todos.filter(x => x && typeof x.t === 'string').slice(0, 300).map(x => ({
            id: /^[A-Za-z0-9-]{3,40}$/.test(x.id || '') ? x.id : newId(), t: x.t.slice(0, 100), done: !!x.done, created: x.created || Date.now()
          }));
          persistTodos();
        }
        if (data.cstk && typeof data.cstk === 'object' && !Array.isArray(data.cstk)) {
          cstk = {};
          Object.keys(data.cstk).filter(k => /^\d{4}-\d{2}$/.test(k)).forEach(k => { cstk[k] = cleanStk(data.cstk[k]); });
          persistCstk();
        }
        render();
        syncReminders();
        play('tada');
        toast('Notas importadas ✓');
      } catch (e) {
        play('error');
        toast('Ese archivo no sirve 😕');
      }
    };
    r.readAsText(file);
  }

  /* ================= Aviso flotante ================= */
  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ================= Pegatinas del calendario ================= */
  let decoMode = false, calSel = -1;
  let decoPack = window.STK ? window.STK.packs[0].id : '';
  const MAX_CSTK = 30;
  const mKey = () => `${viewY}-${pad(viewM + 1)}`;

  function renderCalStk() {
    const box = $('#cal-stk');
    if (!box) return;
    box.innerHTML = '';
    const list = cstk[mKey()] || [];
    list.forEach((s, i) => {
      const el = stickerEl(s);
      if (!el) return;
      el.dataset.i = i;
      if (decoMode && i === calSel) el.classList.add('sel');
      box.append(el);
    });
    $('#deco-tools').hidden = !(decoMode && calSel >= 0 && list[calSel]);
  }

  function renderDecoPacks() {
    if (!window.STK) return;
    const tabs = $('#deco-tabs');
    const keep = tabs.scrollLeft;
    tabs.innerHTML = '';
    window.STK.packs.forEach(p => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pack-tab' + (p.id === decoPack ? ' on' : '');
      b.textContent = p.icon;
      b.title = p.name;
      b.setAttribute('aria-label', p.name);
      b.addEventListener('click', () => { play('chip'); decoPack = p.id; renderDecoPacks(); });
      tabs.append(b);
    });
    tabs.scrollLeft = keep;
    const pack = window.STK.packs.find(p => p.id === decoPack) || window.STK.packs[0];
    const grid = $('#deco-grid');
    grid.innerHTML = '';
    pack.items.forEach(it => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pack-item' + (it.w > 1 ? ' wide' : '');
      b.setAttribute('aria-label', it.id);
      b.innerHTML = it.svg;
      b.addEventListener('click', () => addCalSticker(it));
      grid.append(b);
    });
  }

  function addCalSticker(it) {
    const key = mKey();
    const list = cstk[key] || (cstk[key] = []);
    if (list.length >= MAX_CSTK) { toast('¡Ya hay muchas pegatinas en este mes! 😸'); play('error'); return; }
    const s = { k: it.id, x: 15 + Math.random() * 70, y: 28 + Math.random() * 58, s: 1, r: Math.round(Math.random() * 24 - 12) };
    if (it.tape) { s.x = 50; s.y = 8 + Math.random() * 8; s.r = Math.round(Math.random() * 10 - 5); }
    list.push(s);
    calSel = list.length - 1;
    persistCstk();
    renderCalStk();
    play(it.snd === 'cat' ? (Math.random() < 0.5 ? 'meow' : 'mew') : (it.snd || 'sticker'));
    buzz(10);
  }

  function enterDeco() {
    if (settings.view !== 'month') setView('month');
    decoMode = true;
    calSel = -1;
    $('#deco').hidden = false;
    document.body.classList.add('deco-on');
    $('#cal').classList.add('decorating');
    renderDecoPacks();
    renderCalStk();
    play('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function exitDeco() {
    if (!decoMode) return;
    decoMode = false;
    calSel = -1;
    $('#deco').hidden = true;
    document.body.classList.remove('deco-on');
    $('#cal').classList.remove('decorating');
    renderCalStk();
    play('close');
  }

  /* ================= Eventos ================= */
  const REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  let flipping = false;
  function leafOf(el) {                       // copia "de papel" de la hoja del calendario
    const c = el.cloneNode(true);
    c.removeAttribute('id');
    c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
    c.classList.remove('decorating');
    c.classList.add('leaf');
    return c;
  }
  function changeMonth(delta) {
    if (flipping) return;
    const d = new Date(viewY, viewM + delta, 1);
    const wrap = $('#cal-wrap'), cal = $('#cal');
    play('flip');
    calSel = -1;
    if (REDUCE || settings.view !== 'month') {
      viewY = d.getFullYear();
      viewM = d.getMonth();
      renderCalendar();
      return;
    }
    const old = leafOf(cal);
    viewY = d.getFullYear();
    viewM = d.getMonth();
    renderCalendar();                         // la hoja de verdad ya muestra el mes nuevo
    flipping = true;
    const done = () => { wrap.querySelectorAll('.leaf').forEach(n => n.remove()); flipping = false; };
    if (delta > 0) {                          // la hoja vieja se levanta y se va hacia arriba
      old.classList.add('flip-up');
      wrap.append(old);
      old.addEventListener('animationend', done, { once: true });
    } else {                                  // la hoja nueva cae desde arriba sobre la vieja
      const incoming = leafOf(cal);
      old.classList.add('under');
      incoming.classList.add('flip-down');
      wrap.append(old, incoming);
      incoming.addEventListener('animationend', done, { once: true });
    }
    setTimeout(done, 1000);
  }
  function changeWeek(delta) {
    const d = parseYmd(sel);
    d.setDate(d.getDate() + 7 * delta);
    sel = ymd(d);
    viewY = d.getFullYear();
    viewM = d.getMonth();
    play('flip');
    renderWeek(true, true);
  }

  $('#prev').addEventListener('click', () => changeMonth(-1));
  $('#next').addEventListener('click', () => changeMonth(1));
  $('#wprev').addEventListener('click', () => changeWeek(-1));
  $('#wnext').addEventListener('click', () => changeWeek(1));
  $('#v-month').addEventListener('click', () => { if (settings.view !== 'month') { play('flip'); setView('month'); } });
  $('#v-week').addEventListener('click', () => { if (settings.view !== 'week') { play('flip'); setView('week'); } });
  $('#v-stars').addEventListener('click', () => { if (settings.view !== 'stars') { play('flip'); setView('stars'); } });
  $('#v-todo').addEventListener('click', () => { if (settings.view !== 'todo') { play('flip'); setView('todo'); } });
  $('#todo-form').addEventListener('submit', addTodo);
  $('#todo-clear').addEventListener('click', () => { play('peel'); todos = todos.filter(x => !x.done); persistTodos(); renderTodos(); });
  const goToday = () => {
    play('tap');
    sel = todayStr();
    viewY = new Date().getFullYear();
    viewM = new Date().getMonth();
    render();
  };
  $('#month-title').addEventListener('click', goToday);
  $('#week-title').addEventListener('click', goToday);
  $('#grid').addEventListener('click', e => {
    const c = e.target.closest('.cell');
    if (!c || decoMode) return;
    play('tap');
    sel = c.dataset.date;
    const d = parseYmd(sel);
    if (d.getMonth() !== viewM) { viewY = d.getFullYear(); viewM = d.getMonth(); }
    render();
  });

  // semana: tocar el encabezado de un día o su botón "+ nota"
  $('#week-board').addEventListener('click', e => {
    const col = e.target.closest('.col');
    if (!col) return;
    if (e.target.closest('.col-head')) {
      play('tap');
      sel = col.dataset.date;
      renderWeek(false, false);
    } else if (e.target.closest('.col-add')) {
      play('pop');
      sel = col.dataset.date;
      openEditor(null, col.dataset.date);
    }
  });

  // deslizar el calendario para cambiar de mes
  let sx = 0, sy = 0;
  $('#cal').addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  $('#cal').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) changeMonth(dx < 0 ? 1 : -1);
  }, { passive: true });

  // pegatinas del calendario: arrastrar, girar, agrandar
  const calStkBox = $('#cal-stk');
  let cdrag = null;
  calStkBox.addEventListener('pointerdown', e => {
    if (!decoMode) return;
    const el = e.target.closest('.stk');
    if (!el) return;
    calSel = +el.dataset.i;
    cdrag = { i: calSel, moved: false };
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    calStkBox.querySelectorAll('.stk').forEach(n => n.classList.toggle('sel', +n.dataset.i === calSel));
    $('#deco-tools').hidden = false;
    e.preventDefault();
  });
  calStkBox.addEventListener('pointermove', e => {
    if (!cdrag) return;
    const list = cstk[mKey()];
    const s = list && list[cdrag.i];
    if (!s) return;
    const r = calStkBox.getBoundingClientRect();
    s.x = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
    s.y = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100));
    cdrag.moved = true;
    const el = calStkBox.querySelector(`.stk[data-i="${cdrag.i}"]`);
    if (el) { el.style.left = s.x + '%'; el.style.top = s.y + '%'; }
  });
  const endCDrag = () => { if (cdrag && cdrag.moved) { play('drop'); persistCstk(); } cdrag = null; };
  calStkBox.addEventListener('pointerup', endCDrag);
  calStkBox.addEventListener('pointercancel', endCDrag);
  $('#cal').addEventListener('pointerdown', e => {
    if (decoMode && calSel >= 0 && !e.target.closest('.stk')) { calSel = -1; renderCalStk(); }
  });
  $('#deco-tools').addEventListener('click', e => {
    const b = e.target.closest('button');
    const list = cstk[mKey()];
    if (!b || calSel < 0 || !list || !list[calSel]) return;
    const s = list[calSel];
    const act = b.dataset.act;
    if (act === 'smaller') s.s = Math.max(0.4, +(s.s / 1.18).toFixed(2));
    else if (act === 'bigger') s.s = Math.min(3.2, +(s.s * 1.18).toFixed(2));
    else if (act === 'rotl') s.r -= 15;
    else if (act === 'rotr') s.r += 15;
    else if (act === 'front') { list.push(list.splice(calSel, 1)[0]); calSel = list.length - 1; }
    else if (act === 'del') { list.splice(calSel, 1); calSel = -1; play('peel'); persistCstk(); renderCalStk(); return; }
    play('chip');
    persistCstk();
    renderCalStk();
  });
  $('#btn-deco').addEventListener('click', () => { if (decoMode) exitDeco(); else enterDeco(); });
  $('#deco-done').addEventListener('click', exitDeco);

  $('#fab').addEventListener('click', () => {
    play('pop');
    if (settings.view === 'todo') { $('#todo-input').focus(); return; }
    openEditor(null);
  });
  $('#f-save').addEventListener('click', saveEditor);
  $('#f-cancel').addEventListener('click', closeSheets);
  $('#f-delete').addEventListener('click', deleteFromEditor);
  $('#f-clear-time').addEventListener('click', () => { play('tap'); $('#f-time').value = ''; });
  $('#f-add-sub').addEventListener('click', () => addSub());
  $('#f-title').addEventListener('input', e => { $('#stage-title').textContent = e.target.value; });
  backdrop.addEventListener('click', closeSheets);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheets(); });

  // escenario de pegatinas: tocar para elegir, arrastrar para mover
  const stage = $('#stage');
  let drag = null;
  stage.addEventListener('pointerdown', e => {
    const el = e.target.closest('.stk');
    if (!el) { selStk = -1; renderStage(); return; }
    const i = +el.dataset.i;
    selStk = i;
    drag = { i, moved: false };
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    stage.querySelectorAll('.stk').forEach(n => n.classList.toggle('sel', +n.dataset.i === i));
    $('#stk-tools').hidden = false;
    e.preventDefault();
  });
  stage.addEventListener('pointermove', e => {
    if (!drag || !stk[drag.i]) return;
    const r = stage.getBoundingClientRect();
    const s = stk[drag.i];
    s.x = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100));
    s.y = Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100));
    drag.moved = true;
    const el = stage.querySelector(`.stk[data-i="${drag.i}"]`);
    if (el) { el.style.left = s.x + '%'; el.style.top = s.y + '%'; }
  });
  const endDrag = () => { if (drag && drag.moved) play('drop'); drag = null; };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  $('#stk-tools').addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || selStk < 0 || !stk[selStk]) return;
    const s = stk[selStk];
    const act = b.dataset.act;
    if (act === 'smaller') s.s = Math.max(0.4, +(s.s / 1.18).toFixed(2));
    else if (act === 'bigger') s.s = Math.min(3.2, +(s.s * 1.18).toFixed(2));
    else if (act === 'rotl') s.r -= 15;
    else if (act === 'rotr') s.r += 15;
    else if (act === 'front') { stk.push(stk.splice(selStk, 1)[0]); selStk = stk.length - 1; }
    else if (act === 'del') { stk.splice(selStk, 1); selStk = -1; play('peel'); renderStage(); return; }
    play('chip');
    renderStage();
  });

  $('#btn-settings').addEventListener('click', () => { renderSettings(); openSheet(settingsSheet); });
  $('#s-close').addEventListener('click', closeSheets);
  $('#s-test').addEventListener('click', sendTest);
  $('#s-copy').addEventListener('click', copyTopic);
  $('#s-save-topic').addEventListener('click', saveTopic);
  $('#s-export').addEventListener('click', exportData);
  $('#s-import').addEventListener('click', () => $('#s-file').click());
  $('#s-file').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });

  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') mirrorNow(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      render(false, false);
      syncReminders();
    }
  });
  setInterval(syncReminders, 30 * 60e3);

  /* ================= Inicio ================= */
  applyTheme();
  applyBoard();
  applySound();
  document.body.dataset.view = settings.view;
  $('#v-month').classList.toggle('on', settings.view === 'month');
  $('#v-week').classList.toggle('on', settings.view === 'week');
  $('#v-todo').classList.toggle('on', settings.view === 'todo');
  $('#v-stars').classList.toggle('on', settings.view === 'stars');
  render();
  syncReminders();
  mirrorNow();
  askPersist().then(v => { storage.persisted = v; });
  if (storage.restored) setTimeout(() => toast('Recuperé tus datos guardados 💾'), 500);

  const appPlug = nativePlugin('App');
  if (appPlug && appPlug.addListener) {
    appPlug.addListener('backButton', () => {
      if (editor.classList.contains('open') || settingsSheet.classList.contains('open')) closeSheets();
      else if (decoMode) exitDeco();
      else if (settings.view !== 'month') setView('month');
      else if (appPlug.exitApp) appPlug.exitApp();
    });
  }
  if (storage.native) document.body.classList.add('native');

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
})();
