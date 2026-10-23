'use strict';
(() => {
  /* ================= Constantes ================= */
  const COLORS = ['#fff59d', '#ffb3d1', '#a5dcff', '#b8f0a6', '#ffc98a', '#d9c2ff'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const REPEATS = [
    { v: 'none', l: 'Una vez' },
    { v: 'daily', l: 'Cada día' },
    { v: 'weekly', l: 'Cada semana' },
    { v: 'monthly', l: 'Cada mes' }
  ];
  const REPEAT_TXT = { none: '', daily: 'cada día', weekly: 'cada semana', monthly: 'cada mes' };
  const REMINDS = [
    { v: -1, l: 'Sin aviso' },
    { v: 0, l: 'A la hora' },
    { v: 10, l: '10 min antes' },
    { v: 60, l: '1 hora antes' },
    { v: 1440, l: '1 día antes' }
  ];
  const HORIZON = 71 * 3600e3;   // ntfy solo programa hasta 3 días adelante
  const MIN_AHEAD = 30e3;        // y mínimo 10 segundos
  const NTFY = 'https://ntfy.sh';
  const CHECK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13l5 5L20 6"/></svg>';

  /* ================= Utilidades ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const todayStr = () => ymd(new Date());
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin espacio */ } };
  const newId = () => 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
  const genTopic = () => {
    const abc = 'abcdefghjkmnpqrstuvwxyz23456789';
    const a = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return 'notas-' + Array.from(a, n => abc[n % abc.length]).join('');
  };

  /* ================= Estado ================= */
  let tasks = load('pn.tasks', []);
  let settings = Object.assign({ theme: 'auto', topic: '', remindersOn: true }, load('pn.settings', {}));
  let sent = load('pn.sent', {});          // { idDeAviso: momentoEnMs }
  if (!settings.topic) { settings.topic = genTopic(); save('pn.settings', settings); }

  let sel = todayStr();
  let viewY = new Date().getFullYear();
  let viewM = new Date().getMonth();
  let ed = null;                            // estado del editor
  let renderTimer = null;

  const persist = () => save('pn.tasks', tasks);
  const persistSettings = () => save('pn.settings', settings);

  /* ================= Lógica de fechas ================= */
  function occursOn(t, ds) {
    if (ds < t.date) return false;
    if (t.repeat === 'none') return ds === t.date;
    if (t.repeat === 'daily') return true;
    const a = parseYmd(t.date), b = parseYmd(ds);
    if (t.repeat === 'weekly') return a.getDay() === b.getDay();
    if (t.repeat === 'monthly') return a.getDate() === b.getDate();
    return false;
  }
  const isDone = (t, ds) => !!(t.done && t.done[ds]);
  const tasksOn = ds => tasks.filter(t => occursOn(t, ds));
  function isLate(t, ds) {
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

  /* ================= Render ================= */
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
      cell.className = 'cell' + (d.getMonth() !== viewM ? ' other' : '') + (ds === today ? ' today' : '') + (ds === sel ? ' sel' : '');
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
          s.className = 'mini' + (isDone(t, ds) ? ' done' : '');
          s.style.background = COLORS[t.color];
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
  }

  function makeCard(t, ds) {
    const done = isDone(t, ds);
    const card = document.createElement('div');
    card.className = 'note' + (done ? ' done' : '');
    card.style.setProperty('--c', COLORS[t.color]);
    card.style.setProperty('--r', (((hash(t.id) % 50) - 25) / 10) + 'deg');
    card.setAttribute('role', 'button');
    card.tabIndex = 0;

    const top = document.createElement('div');
    top.className = 'top';
    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'check';
    check.setAttribute('aria-label', done ? 'Marcar como pendiente' : 'Marcar como hecha');
    check.innerHTML = CHECK_SVG;
    top.append(check);
    if (t.time) {
      const tm = document.createElement('span');
      tm.className = 'time';
      tm.textContent = '⏰ ' + t.time;
      top.append(tm);
    }

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = t.title;

    const meta = document.createElement('div');
    meta.className = 'meta';
    if (isLate(t, ds)) { const l = document.createElement('span'); l.className = 'late'; l.textContent = '¡atrasada!'; meta.append(l); }
    if (t.repeat !== 'none') { const r = document.createElement('span'); r.textContent = '🔁 ' + REPEAT_TXT[t.repeat]; meta.append(r); }
    if (t.remind >= 0) { const b = document.createElement('span'); b.textContent = '🔔'; meta.append(b); }

    card.append(top, title, meta);

    check.addEventListener('click', e => { e.stopPropagation(); toggleDone(t, ds, card, check); });
    card.addEventListener('click', () => openEditor(t));
    card.addEventListener('keydown', e => { if (e.key === 'Enter') openEditor(t); });
    return card;
  }

  function renderList() {
    const d = parseYmd(sel);
    const isToday = sel === todayStr();
    $('#day-title').textContent = (isToday ? 'Hoy · ' : '') + cap(DAYS[d.getDay()]) + ` ${d.getDate()} de ${MONTHS[d.getMonth()]}`;

    const list = tasksOn(sel).sort((a, b) => (a.time || '').localeCompare(b.time || '') || (a.created || 0) - (b.created || 0));
    const doneN = list.filter(t => isDone(t, sel)).length;
    const prog = $('#progress');
    prog.innerHTML = '';
    if (list.length) {
      const txt = document.createElement('span');
      txt.textContent = `${doneN} de ${list.length}`;
      const bar = document.createElement('span');
      bar.className = 'bar';
      const fill = document.createElement('i');
      fill.style.width = Math.round(doneN / list.length * 100) + '%';
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
      e.className = 'note empty';
      const t = document.createElement('div');
      t.className = 'title';
      t.textContent = isToday ? 'Nada para hoy… ¡toca + para pegar una nota!' : 'Sin notas este día. ¡Toca + para pegar una!';
      e.append(t);
      box.append(e);
    } else {
      list.forEach(t => box.append(makeCard(t, sel)));
    }
  }

  function render() {
    clearTimeout(renderTimer);
    renderCalendar();
    renderList();
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
      render();
      syncReminders();
    } else {
      t.done[ds] = true;
      persist();
      card.classList.add('done');
      burst(check);
      const seq = `${t.id}_${ds}`;
      if (sent[seq]) { delete sent[seq]; save('pn.sent', sent); ntfyDelete(seq); }
      renderTimer = setTimeout(render, 650);
    }
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

  function openSheet(el) { backdrop.classList.add('show'); el.classList.add('open'); }
  function closeSheets() {
    backdrop.classList.remove('show');
    editor.classList.remove('open');
    settingsSheet.classList.remove('open');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }

  function buildChips(el, options, get, set) {
    el.innerHTML = '';
    options.forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (get() === o.v ? ' on' : '');
      b.textContent = o.l;
      b.addEventListener('click', () => { set(o.v); buildChips(el, options, get, set); });
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
      b.addEventListener('click', () => { ed.color = i; editor.style.setProperty('--sheet', c); buildSwatches(); });
      box.append(b);
    });
  }

  function openEditor(t) {
    ed = t
      ? { id: t.id, color: t.color, repeat: t.repeat, remind: t.remind }
      : { id: null, color: Math.floor(Math.random() * COLORS.length), repeat: 'none', remind: 0 };
    $('#f-title').value = t ? t.title : '';
    $('#f-date').value = t ? t.date : sel;
    $('#f-time').value = t ? t.time : '';
    $('#f-delete').style.display = t ? '' : 'none';
    $('#f-save').textContent = t ? 'Guardar' : 'Pegar nota';
    editor.style.setProperty('--sheet', COLORS[ed.color]);
    buildChips($('#f-repeat'), REPEATS, () => ed.repeat, v => { ed.repeat = v; });
    buildChips($('#f-remind'), REMINDS, () => ed.remind, v => { ed.remind = v; });
    buildSwatches();
    openSheet(editor);
    if (!t) setTimeout(() => $('#f-title').focus(), 320);
  }

  function saveEditor() {
    const titleEl = $('#f-title');
    const title = titleEl.value.trim();
    if (!title) {
      titleEl.classList.remove('shake');
      void titleEl.offsetWidth;
      titleEl.classList.add('shake');
      titleEl.focus();
      return;
    }
    const date = $('#f-date').value || sel;
    const time = $('#f-time').value || '';
    const data = { title, date, time, repeat: ed.repeat, remind: ed.remind, color: ed.color };

    if (ed.id) {
      const t = tasks.find(x => x.id === ed.id);
      if (t) {
        cancelTask(t.id);
        if (t.date !== date) t.done = {};
        Object.assign(t, data);
      }
    } else {
      tasks.push(Object.assign({ id: newId(), done: {}, created: Date.now() }, data));
    }
    persist();
    sel = date;
    const d = parseYmd(date);
    viewY = d.getFullYear();
    viewM = d.getMonth();
    closeSheets();
    render();
    syncReminders();
    toast(ed.id ? 'Nota actualizada ✏️' : 'Nota pegada 📌');
  }

  function deleteFromEditor() {
    const t = tasks.find(x => x.id === ed.id);
    if (!t) return;
    const msg = t.repeat !== 'none' ? '¿Borrar esta nota y todas sus repeticiones?' : '¿Borrar esta nota?';
    if (!confirm(msg)) return;
    removeTask(t.id);
    closeSheets();
    render();
    toast('Nota despegada 🗑️');
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

  function cancelTask(id) {
    Object.keys(sent).filter(k => k.startsWith(id + '_')).forEach(k => { delete sent[k]; ntfyDelete(k); });
    save('pn.sent', sent);
  }
  function cancelAll() {
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

  function applyTheme() {
    document.documentElement.dataset.theme = settings.theme === 'light' ? 'light' : settings.theme;
  }
  function setStatus(msg) { $('#s-status').textContent = msg; }

  function renderSettings() {
    $('#s-topic').value = settings.topic;
    buildChips($('#s-theme'), THEMES, () => settings.theme, v => { settings.theme = v; persistSettings(); applyTheme(); });
    buildChips($('#s-remind-on'), [{ v: true, l: 'Avisos activados' }, { v: false, l: 'Desactivados' }], () => settings.remindersOn, v => {
      settings.remindersOn = v;
      persistSettings();
      if (v) syncReminders(); else cancelAll();
      renderSettings();
    });
    const n = Object.values(sent).filter(ms => ms > Date.now()).length;
    if (settings.remindersOn) setStatus(n ? `Avisos programados ahora: ${n}` : 'Todavía no hay avisos programados.');
    else setStatus('Los avisos están desactivados.');
  }

  async function sendTest() {
    setStatus('Enviando…');
    try {
      await ntfyPost('', { title: '📝 ¡Funciona!', body: 'Así te llegarán tus recordatorios de Mis Notas.' });
      setStatus('Enviada ✓ Revisa tu celular (en la app ntfy).');
    } catch (e) {
      setStatus('No se pudo enviar. ¿Tienes internet?');
    }
  }

  function saveTopic() {
    const v = $('#s-topic').value.trim();
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(v)) {
      setStatus('El tema debe tener de 8 a 64 letras, números, - o _ (sin espacios).');
      return;
    }
    if (v === settings.topic) { setStatus('Ese ya es tu tema.'); return; }
    cancelAll();                         // limpia los avisos del tema anterior
    settings.topic = v;
    persistSettings();
    setStatus('Tema guardado ✓');
    syncReminders();
  }

  async function copyTopic() {
    const v = $('#s-topic').value;
    try { await navigator.clipboard.writeText(v); toast('Tema copiado 📋'); }
    catch (e) { $('#s-topic').select(); toast('Selecciónalo y cópialo'); }
  }

  function exportData() {
    const payload = { app: 'mis-notas', v: 1, topic: settings.topic, tasks };
    const blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `mis-notas-${todayStr()}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Copia guardada 💾');
  }

  function cleanTask(x) {
    if (!x || typeof x.title !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(x.date || '')) return null;
    return {
      id: /^[A-Za-z0-9-]{3,40}$/.test(x.id || '') ? x.id : newId(),
      title: x.title.slice(0, 140),
      date: x.date,
      time: /^\d{2}:\d{2}$/.test(x.time || '') ? x.time : '',
      repeat: ['none', 'daily', 'weekly', 'monthly'].includes(x.repeat) ? x.repeat : 'none',
      remind: [-1, 0, 10, 60, 1440].includes(x.remind) ? x.remind : -1,
      color: Number.isInteger(x.color) && x.color >= 0 && x.color < COLORS.length ? x.color : 0,
      done: x.done && typeof x.done === 'object' ? x.done : {},
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
        render();
        syncReminders();
        toast('Notas importadas ✓');
      } catch (e) {
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

  /* ================= Eventos ================= */
  function changeMonth(delta) {
    const d = new Date(viewY, viewM + delta, 1);
    viewY = d.getFullYear();
    viewM = d.getMonth();
    renderCalendar();
  }

  $('#prev').addEventListener('click', () => changeMonth(-1));
  $('#next').addEventListener('click', () => changeMonth(1));
  $('#btn-today').addEventListener('click', () => {
    sel = todayStr();
    viewY = new Date().getFullYear();
    viewM = new Date().getMonth();
    render();
  });
  $('#grid').addEventListener('click', e => {
    const c = e.target.closest('.cell');
    if (!c) return;
    sel = c.dataset.date;
    const d = parseYmd(sel);
    if (d.getMonth() !== viewM) { viewY = d.getFullYear(); viewM = d.getMonth(); }
    render();
  });

  // deslizar el calendario para cambiar de mes
  let sx = 0, sy = 0;
  $('#cal').addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  $('#cal').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) changeMonth(dx < 0 ? 1 : -1);
  }, { passive: true });

  $('#fab').addEventListener('click', () => openEditor(null));
  $('#f-save').addEventListener('click', saveEditor);
  $('#f-cancel').addEventListener('click', closeSheets);
  $('#f-delete').addEventListener('click', deleteFromEditor);
  $('#f-clear-time').addEventListener('click', () => { $('#f-time').value = ''; });
  backdrop.addEventListener('click', closeSheets);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheets(); });

  $('#btn-settings').addEventListener('click', () => { renderSettings(); openSheet(settingsSheet); });
  $('#s-close').addEventListener('click', closeSheets);
  $('#s-test').addEventListener('click', sendTest);
  $('#s-copy').addEventListener('click', copyTopic);
  $('#s-save-topic').addEventListener('click', saveTopic);
  $('#s-export').addEventListener('click', exportData);
  $('#s-import').addEventListener('click', () => $('#s-file').click());
  $('#s-file').addEventListener('change', e => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ''; });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (sel === todayStr() || true) render();
      syncReminders();
    }
  });
  setInterval(syncReminders, 30 * 60e3);

  /* ================= Inicio ================= */
  applyTheme();
  render();
  syncReminders();

  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
})();
