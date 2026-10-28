'use strict';
/* Pegatinas de Mis Notas — todas dibujadas aquí mismo (SVG), sin imágenes externas.
   Para agregar más: crea un item { id, svg } y ponlo dentro de un paquete. */
(function () {
  const INK = '#4a3b3b';
  const sv = (b, vb = '0 0 100 100') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" aria-hidden="true">${b}</svg>`;
  const st = (w = 3.5) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const ln = (d, K = INK, w = 3.5) => `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const blush = (y = 68, dx = 26) => `<ellipse cx="${50 - dx}" cy="${y}" rx="7" ry="4.2" fill="#ff9fb0" opacity=".6"/><ellipse cx="${50 + dx}" cy="${y}" rx="7" ry="4.2" fill="#ff9fb0" opacity=".6"/>`;
  const kf = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="-9" cy="0" r="2.8" fill="${INK}"/><circle cx="9" cy="0" r="2.8" fill="${INK}"/>${ln('M-3.5 3.5q3.5 3.5 7 0', INK, 2.2)}<ellipse cx="-15" cy="4" rx="4" ry="2.5" fill="#ff9fb0" opacity=".65"/><ellipse cx="15" cy="4" rx="4" ry="2.5" fill="#ff9fb0" opacity=".65"/></g>`;

  /* ---------- caras (para gatitos y bolitas) ---------- */
  function eyes(m, K) {
    switch (m) {
      case 'happy': return ln('M28 56q7-9 14 0M58 56q7-9 14 0', K);
      case 'sleepy': return ln('M28 55q7 6 14 0M58 55q7 6 14 0', K) + `<text x="76" y="28" font-size="17" fill="${INK}" font-family="sans-serif" font-weight="700">z</text><text x="85" y="17" font-size="12" fill="${INK}" font-family="sans-serif" font-weight="700">z</text>`;
      case 'love': {
        const h = '<path d="M35 64c-9-6-12-11-9-15 3-4 7-2 9 1 2-3 6-5 9-1 3 4 0 9-9 15z" fill="#ff4d6d" stroke="#4a3b3b" stroke-width="2.5" stroke-linejoin="round"/>';
        return h + `<g transform="translate(30 0)">${h}</g>`;
      }
      case 'surprised': return `<circle cx="35" cy="56" r="7" fill="#fff" ${st(3)}/><circle cx="35" cy="57" r="3" fill="${INK}"/><circle cx="65" cy="56" r="7" fill="#fff" ${st(3)}/><circle cx="65" cy="57" r="3" fill="${INK}"/>`;
      case 'cry': return `<circle cx="35" cy="55" r="4.2" fill="${K}"/><circle cx="65" cy="55" r="4.2" fill="${K}"/><path d="M33 61q-3 8 0 11q4-3 2-11zM67 61q3 8 0 11q-4-3-2-11z" fill="#7cc6fe" stroke="${INK}" stroke-width="1.5"/>`;
      case 'wink': return `<circle cx="35" cy="56" r="4.2" fill="${K}"/>` + ln('M58 57q7-8 14 0', K);
      case 'smug': return ln('M27 54h16M57 54h16', K) + `<circle cx="35" cy="58.5" r="3.6" fill="${K}"/><circle cx="65" cy="58.5" r="3.6" fill="${K}"/>`;
      case 'angry': return `<circle cx="35" cy="58" r="4" fill="${K}"/><circle cx="65" cy="58" r="4" fill="${K}"/>` + ln('M26 46l17 7M74 46l-17 7', K);
      case 'sparkle': {
        const s = '<path d="M35 47l3.4 6.6 6.6 3.4-6.6 3.4-3.4 6.6-3.4-6.6-6.6-3.4 6.6-3.4z" fill="#fff" stroke="#4a3b3b" stroke-width="2.2" stroke-linejoin="round"/>';
        return s + `<g transform="translate(30 0)">${s}</g>`;
      }
      case 'cool': return `<rect x="23" y="50" width="24" height="15" rx="6" fill="#2b2a33"/><rect x="53" y="50" width="24" height="15" rx="6" fill="#2b2a33"/><path d="M47 55h6" stroke="#2b2a33" stroke-width="3"/><path d="M28 54l6-2M58 54l6-2" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`;
      case 'nervous': return `<circle cx="35" cy="56" r="3.8" fill="${K}"/><circle cx="65" cy="56" r="3.8" fill="${K}"/><path d="M81 38q-5 9 0 12q5-3 0-12z" fill="#7cc6fe" stroke="#4a3b3b" stroke-width="1.8" stroke-linejoin="round"/>`;
      case 'shy': return ln('M28 58q7-6 14 0M58 58q7-6 14 0', K);
      default: return `<circle cx="35" cy="56" r="4" fill="${K}"/><circle cx="65" cy="56" r="4" fill="${K}"/>`;
    }
  }
  function mouth(m, K) {
    switch (m) {
      case 'happy': case 'wink': case 'sparkle': case 'cool': return `<path d="M42 70q8 12 16 0z" fill="#7a2f3a" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`;
      case 'sleepy': case 'smug': case 'shy': return ln('M43 71q7 6 14 0', K, 3);
      case 'love': return `<path d="M44 70q6 9 12 0z" fill="#ff8fa3" stroke="${K}" stroke-width="3" stroke-linejoin="round"/>`;
      case 'surprised': return `<ellipse cx="50" cy="75" rx="4.5" ry="6" fill="#7a2f3a" stroke="${K}" stroke-width="3"/>`;
      case 'cry': return ln('M42 77q8-8 16 0', K);
      case 'angry': return ln('M43 76q7-5 14 0', K);
      case 'nervous': return ln('M41 75q4.5-4 9 0t9 0', K, 3);
      default: return '';
    }
  }

  /* ---------- gatitos ---------- */
  function cat(o) {
    const fur = o.fur, dk = o.dk || '#c97a2e', ear = o.ear || fur;
    const dark = o.dark;
    const K = dark ? '#ffe9a8' : INK;
    let pat = '';
    if (o.pat === 'tabby') pat = `<path d="M50 25v10M41 26.5l2.6 8.5M59 26.5l-2.6 8.5M13 56h10M14 66h9M87 56H77M86 66h-9" fill="none" stroke="${dk}" stroke-width="3.6" stroke-linecap="round"/>`;
    if (o.pat === 'tuxedo') pat = '<ellipse cx="50" cy="76" rx="19" ry="15" fill="#fff"/><path d="M43 22L50 48 57 22z" fill="#fff"/>';
    if (o.pat === 'calico') pat = '<ellipse cx="26" cy="38" rx="17" ry="15" fill="#f6a65b"/><ellipse cx="78" cy="48" rx="15" ry="13" fill="#6b5b5b"/>';
    if (o.pat === 'siamese') pat = '<ellipse cx="50" cy="68" rx="25" ry="21" fill="#8d6e63" opacity=".8"/>';
    let acc = '';
    if (o.acc === 'bow') acc = `<g transform="translate(72 25) rotate(18)"><path d="M0 0l-13-8v16zM0 0l13-8v16z" fill="#ff6b9d" ${st(3)}/><circle r="4.5" fill="#ff6b9d" ${st(3)}/></g>`;
    if (o.acc === 'partyhat') acc = `<path d="M37 33L50 4l13 29z" fill="#7cc6fe" ${st(3)}/><circle cx="50" cy="5" r="4.5" fill="#ff6b9d" ${st(2.5)}/><path d="M43 25h14M46 16h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
    if (o.acc === 'crown') acc = `<path d="M33 33l3-21 9 12 5-16 5 16 9-12 3 21z" fill="#ffd166" ${st(3)}/>`;
    if (o.acc === 'flower') {
      const pts = [[0, -7], [6.7, -2.2], [4.1, 5.7], [-4.1, 5.7], [-6.7, -2.2]];
      acc = `<g transform="translate(27 29)">${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="5.2" fill="#ff9fc7" stroke="#4a3b3b" stroke-width="1.6"/>`).join('')}<circle r="4.2" fill="#ffd43b" stroke="#4a3b3b" stroke-width="1.6"/></g>`;
    }
    return sv(
      `<clipPath id="hc"><ellipse cx="50" cy="57" rx="39" ry="33"/></clipPath>` +
      `<path d="M16 46L21 11 48 27zM84 46L79 11 52 27z" fill="${ear}" ${st(3.5)}/><path d="M24 34L26 20 38 28zM76 34L74 20 62 28z" fill="#ffb7c5"/>` +
      `<ellipse cx="50" cy="57" rx="39" ry="33" fill="${fur}" ${st(3.5)}/>` +
      `<g clip-path="url(#hc)">${pat}</g>` +
      blush(69, 27) + eyes(o.e, K) +
      `<path d="M46 64h8l-4 4.4z" fill="#ff8fa3" stroke="${K}" stroke-width="1.6" stroke-linejoin="round"/>` +
      mouth(o.e, K) +
      `<path d="M10 62l15 3M10 71l15-2M90 62l-15 3M90 71l-15-2" stroke="${K}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>` +
      acc
    );
  }
  const CATS = [
    { fur: '#f6a65b', dk: '#c97a2e', pat: 'tabby', e: 'happy' },
    { fur: '#b8bfc9', dk: '#8c95a3', pat: 'tabby', e: 'sleepy' },
    { fur: '#6d6577', dark: true, e: 'love' },
    { fur: '#ffffff', e: 'wink', acc: 'bow' },
    { fur: '#ffffff', pat: 'calico', e: 'surprised' },
    { fur: '#f3e3cf', pat: 'siamese', ear: '#8d6e63', e: 'smug' },
    { fur: '#f6a65b', dk: '#c97a2e', pat: 'tabby', e: 'cry' },
    { fur: '#6d6577', dark: true, e: 'angry' },
    { fur: '#b8bfc9', pat: 'tuxedo', e: 'sparkle', acc: 'crown' },
    { fur: '#ffffff', e: 'happy', acc: 'flower' },
    { fur: '#f6a65b', dk: '#c97a2e', pat: 'tabby', e: 'sleepy', acc: 'partyhat' },
    { fur: '#6d6577', dark: true, pat: 'tuxedo', e: 'love' },
    { fur: '#a9805b', dk: '#7d5a3c', pat: 'tabby', e: 'wink' },
    { fur: '#f3e3cf', pat: 'siamese', ear: '#8d6e63', e: 'nervous' },
    { fur: '#ffffff', e: 'cool' },
    { fur: '#f6a65b', dk: '#c97a2e', pat: 'tabby', e: 'sparkle', acc: 'bow' },
    { fur: '#b8bfc9', dk: '#8c95a3', pat: 'tabby', e: 'surprised', acc: 'partyhat' },
    { fur: '#6d6577', dark: true, e: 'sleepy', acc: 'flower' }
  ].map((o, i) => ({ id: 'gato' + (i + 1), svg: cat(o), snd: 'cat' }));

  /* ---------- cosas de gato ---------- */
  const catThings = [
    { id: 'huella', svg: sv(`<ellipse cx="50" cy="66" rx="22" ry="19" fill="#ffb7c5" ${st(3.5)}/><ellipse cx="22" cy="42" rx="9" ry="12" transform="rotate(-20 22 42)" fill="#ffb7c5" ${st(3.5)}/><ellipse cx="40" cy="24" rx="9" ry="12" transform="rotate(-6 40 24)" fill="#ffb7c5" ${st(3.5)}/><ellipse cx="60" cy="24" rx="9" ry="12" transform="rotate(6 60 24)" fill="#ffb7c5" ${st(3.5)}/><ellipse cx="78" cy="42" rx="9" ry="12" transform="rotate(20 78 42)" fill="#ffb7c5" ${st(3.5)}/>`) },
    { id: 'pescadito', svg: sv(`<path d="M76 50L94 32v36z" fill="#4dabf7" ${st(3.5)}/><ellipse cx="46" cy="50" rx="34" ry="22" fill="#74c0fc" ${st(3.5)}/><path d="M50 30q8 20 0 40M62 33q6 17 0 34" fill="none" stroke="#4dabf7" stroke-width="3.5" stroke-linecap="round"/><circle cx="26" cy="45" r="4" fill="${INK}"/><path d="M14 56q5 5 10 1" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`) },
    { id: 'ovillo', svg: sv(`<path d="M50 84q18 8 34 6" fill="none" stroke="#ff6b9d" stroke-width="4" stroke-linecap="round"/><circle cx="46" cy="48" r="36" fill="#ff8fb8" ${st(3.5)}/><path d="M16 36q30 14 62-6M12 52q34 16 70-2M22 74q22 8 52-8M34 16q-6 30 8 66M58 14q8 30-4 70" fill="none" stroke="#ff4f8b" stroke-width="3.2" stroke-linecap="round"/>`) },
    { id: 'ratoncito', svg: sv(`<path d="M80 62q16 0 12-18" fill="none" stroke="#ffb7c5" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="34" r="12" fill="#ffb7c5" ${st(3.5)}/><circle cx="52" cy="30" r="12" fill="#ffb7c5" ${st(3.5)}/><path d="M12 76q0-34 38-36 30 0 34 30 0 14-16 14H26q-14 0-14-8z" fill="#ced4da" ${st(3.5)}/><circle cx="34" cy="62" r="3.6" fill="${INK}"/><circle cx="14" cy="72" r="4" fill="#ff8fa3" ${st(2)}/>`) },
    { id: 'plato', svg: sv(`<circle cx="36" cy="40" r="7" fill="#a9744f" ${st(2.6)}/><circle cx="52" cy="34" r="7" fill="#c8915a" ${st(2.6)}/><circle cx="66" cy="42" r="7" fill="#a9744f" ${st(2.6)}/><circle cx="48" cy="46" r="7" fill="#c8915a" ${st(2.6)}/><path d="M10 56h80q-2 28-22 32H32Q12 84 10 56z" fill="#ff8fa3" ${st(3.5)}/><path d="M50 62c-7-5-9-9-6-12 2-3 5-1 6 1 1-2 4-4 6-1 3 3 1 7-6 12z" fill="#fff" opacity=".9"/>`) },
    { id: 'lata', svg: sv(`<path d="M18 30v50q0 10 32 10t32-10V30z" fill="#4dabf7" ${st(3.5)}/><ellipse cx="50" cy="30" rx="32" ry="10" fill="#dee2e6" ${st(3.5)}/><path d="M32 56q10-8 22 0-6 8-22 0zM54 56l8-5v10z" fill="#fff"/><circle cx="38" cy="55" r="1.8" fill="${INK}"/>`) },
    { id: 'cascabel', svg: sv(`<path d="M8 40q42 40 84 0" fill="none" stroke="#ff6b6b" stroke-width="10" stroke-linecap="round"/><circle cx="50" cy="68" r="16" fill="#ffd43b" ${st(3.5)}/><path d="M38 68h24M50 68v12" stroke="#4a3b3b" stroke-width="3" stroke-linecap="round"/><circle cx="43" cy="61" r="3.5" fill="#fff" opacity=".7"/>`) },
    { id: 'caja', svg: sv(`<path d="M30 52L24 24 44 38zM70 52L76 24 56 38z" fill="#ced4da" ${st(3.5)}/><ellipse cx="50" cy="50" rx="24" ry="20" fill="#ced4da" ${st(3.5)}/><circle cx="41" cy="48" r="3.4" fill="${INK}"/><circle cx="59" cy="48" r="3.4" fill="${INK}"/><path d="M12 56h76l-5 36H17z" fill="#d9a066" ${st(3.5)}/><path d="M12 56h76" stroke="#b8803f" stroke-width="5"/><path d="M40 70h20" stroke="#b8803f" stroke-width="4" stroke-linecap="round"/>`) }
  ];

  /* ---------- comidita cute ---------- */
  const food = [
    { id: 'boba', svg: sv(`<path d="M52 6L46 34" fill="none" stroke="#ff8fa3" stroke-width="5" stroke-linecap="round"/><path d="M22 32h56l-6 56q-1 6-7 6H35q-6 0-7-6z" fill="#fff4e0" ${st(3.5)}/><path d="M25 52h50l-3 36q-1 6-7 6H35q-6 0-7-6z" fill="#d9a066"/><ellipse cx="50" cy="32" rx="30" ry="7" fill="#fff" ${st(3.5)}/><circle cx="37" cy="87" r="4.4" fill="${INK}"/><circle cx="48" cy="89" r="4.4" fill="${INK}"/><circle cx="59" cy="87" r="4.4" fill="${INK}"/><circle cx="66" cy="81" r="4.4" fill="${INK}"/><circle cx="41" cy="79" r="4.4" fill="${INK}"/>${kf(50, 63)}`) },
    { id: 'dona', svg: sv(`<path d="M12 52a38 38 0 1 0 76 0a38 38 0 1 0-76 0M40 52a10 10 0 1 0 20 0a10 10 0 1 0-20 0" fill="#f2c28a" fill-rule="evenodd" ${st(3.5)}/><path d="M19 52a31 31 0 1 0 62 0a31 31 0 1 0-62 0M40 52a10 10 0 1 0 20 0a10 10 0 1 0-20 0" fill="#ff9fc7" fill-rule="evenodd"/><g stroke-width="4" stroke-linecap="round"><path d="M30 34l5-3" stroke="#fff"/><path d="M62 28l5 3" stroke="#74c0fc"/><path d="M74 48l5 2" stroke="#ffe066"/><path d="M26 58l5-2" stroke="#74c0fc"/><path d="M68 72l4 3" stroke="#fff"/><path d="M44 78l-1 5" stroke="#ffe066"/><path d="M48 22l3-4" stroke="#8ce99a"/></g>`) },
    { id: 'fresa', svg: sv(`<path d="M50 94C22 80 12 52 14 36c1-10 11-14 21-12 6 1 10 3 15 3s9-2 15-3c10-2 20 2 21 12 2 16-8 44-36 58z" fill="#ff6b81" ${st(3.5)}/><path d="M50 28c-8-9-19-8-24-3 9 0 15 3 24 3zm0 0c8-9 19-8 24-3-9 0-15 3-24 3z" fill="#51cf66" ${st(3)}/><path d="M50 28V14" stroke="#51cf66" stroke-width="5" stroke-linecap="round"/><g fill="#ffe066"><ellipse cx="30" cy="48" rx="2" ry="3"/><ellipse cx="70" cy="48" rx="2" ry="3"/><ellipse cx="38" cy="74" rx="2" ry="3"/><ellipse cx="62" cy="74" rx="2" ry="3"/><ellipse cx="50" cy="84" rx="2" ry="3"/></g>${kf(50, 58)}`) },
    { id: 'cupcake', svg: sv(`<path d="M24 58h52l-6 34H30z" fill="#ffb3d1" ${st(3.5)}/><path d="M38 60l2 30M50 60v30M62 60l-2 30" stroke="#ff8fb8" stroke-width="3"/><path d="M18 58q-4-18 14-22 2-16 18-16t18 16q18 4 14 22z" fill="#fff0f5" ${st(3.5)}/><circle cx="50" cy="16" r="7" fill="#ff4d6d" ${st(3)}/><path d="M50 9q4-6 9-5" fill="none" stroke="#51cf66" stroke-width="3" stroke-linecap="round"/>${kf(50, 46, .9)}`) },
    { id: 'helado', svg: sv(`<path d="M30 52L50 96 70 52z" fill="#f0c27b" ${st(3.5)}/><path d="M38 66l24-8M42 78l20-6M36 56l22 22M64 56L44 78" stroke="#d9a066" stroke-width="2.4" stroke-linecap="round"/><circle cx="50" cy="38" r="28" fill="#ffb3d1" ${st(3.5)}/><path d="M24 50q4 10 10 4t10 4 10-4 10 4 10-4" fill="none" stroke="#ff8fb8" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="9" r="6" fill="#ff4d6d" ${st(3)}/>${kf(50, 38)}`) },
    { id: 'pizza', svg: sv(`<path d="M50 94L10 26Q50 6 90 26z" fill="#ffd166" ${st(3.5)}/><path d="M10 26Q50 6 90 26" fill="none" stroke="#e8a33d" stroke-width="9" stroke-linecap="round"/><circle cx="32" cy="38" r="7" fill="#ff6b6b" ${st(2.4)}/><circle cx="68" cy="38" r="7" fill="#ff6b6b" ${st(2.4)}/><circle cx="50" cy="72" r="7" fill="#ff6b6b" ${st(2.4)}/>${kf(50, 52, .9)}`) },
    { id: 'onigiri', svg: sv(`<path d="M50 10Q64 10 84 68Q92 90 70 90H30Q8 90 16 68Q36 10 50 10z" fill="#fff" ${st(3.5)}/><path d="M26 68h48l7 16q2 6-5 6H24q-7 0-5-6z" fill="#2f3e46" ${st(3)}/>${kf(50, 46)}`) },
    { id: 'aguacate', svg: sv(`<path d="M50 8C70 8 83 40 83 64c0 20-15 30-33 30S17 84 17 64C17 40 30 8 50 8z" fill="#6bbf59" ${st(3.5)}/><path d="M50 20C64 20 73 44 73 64c0 14-9 22-23 22S27 78 27 64C27 44 36 20 50 20z" fill="#d8f5a2"/><circle cx="50" cy="66" r="15" fill="#b9825a" ${st(3)}/>${kf(50, 66, .8)}`) },
    { id: 'galleta', svg: sv(`<circle cx="50" cy="50" r="38" fill="#e5b06f" ${st(3.5)}/><g fill="#6b4a36"><ellipse cx="29" cy="36" rx="5" ry="4"/><ellipse cx="68" cy="33" rx="5" ry="4"/><ellipse cx="32" cy="68" rx="5" ry="4"/><ellipse cx="69" cy="66" rx="5" ry="4"/><ellipse cx="50" cy="24" rx="4.5" ry="3.6"/><ellipse cx="50" cy="80" rx="4.5" ry="3.6"/></g>${kf(50, 52)}`) },
    { id: 'pan', svg: sv(`<path d="M22 92V50q-13-4-13-19C9 16 28 11 50 11s41 5 41 20q0 15-13 19v42z" fill="#f5d49a" ${st(3.5)}/><rect x="40" y="18" width="20" height="12" rx="3" fill="#ffe066" ${st(2.6)}/>${kf(50, 62)}`) },
    { id: 'leche', svg: sv(`<path d="M28 34h44v58H28z" fill="#fff" ${st(3.5)}/><path d="M28 34l9-20h26l9 20z" fill="#8fd3ff" ${st(3.5)}/><path d="M28 74h44v18H28z" fill="#8fd3ff"/><path d="M28 34h44v58H28z" fill="none" ${st(3.5)}/>${kf(50, 55)}`) }
  ].map(x => ({ snd: 'sticker', ...x }));

  /* ---------- estrellitas, cielo y corazones ---------- */
  const STAR = 'M50 8l12 27 29 3-22 20 7 29-26-15-26 15 7-29-22-20 29-3z';
  const HEART = 'M50 88C14 62 8 38 24 24c12-10 24-2 26 8 2-10 14-18 26-8 16 14 10 38-26 64z';
  const SPARK = 'M50 6C52 34 66 48 94 50 66 52 52 66 50 94 48 66 34 52 6 50 34 48 48 34 50 6z';
  const sky = [
    { id: 'estrella', svg: sv(`<path d="${STAR}" fill="#ffd43b" ${st(3.5)}/>${kf(50, 52, .85)}`) },
    { id: 'brillo', svg: sv(`<path d="${SPARK}" fill="#fff3a8" ${st(3.5)}/>`) },
    { id: 'corazon', svg: sv(`<path d="${HEART}" fill="#ff6b81" ${st(3.5)}/><path d="M24 34q4-8 12-6" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`) },
    { id: 'corazon-cute', svg: sv(`<path d="${HEART}" fill="#ff9fc0" ${st(3.5)}/>${kf(50, 46)}`) },
    { id: 'dos-corazones', svg: sv(`<g transform="translate(-2 14) scale(.62)"><path d="${HEART}" fill="#ff6b81" ${st(5)}/></g><g transform="translate(38 0) rotate(12 30 40) scale(.58)"><path d="${HEART}" fill="#ffb3d1" ${st(5)}/></g>`) },
    { id: 'luna', svg: sv(`<path d="M64 8A42 42 0 1 0 92 66 34 34 0 0 1 64 8z" fill="#ffe08a" ${st(3.5)}/>${kf(44, 56, .8)}<path d="M80 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#fff3a8" ${st(1.8)}/>`) },
    { id: 'sol', svg: sv(`<g stroke="#ffb84d" stroke-width="6" stroke-linecap="round"><path d="M50 6v12M50 82v12M6 50h12M82 50h12M19 19l8 8M73 73l8 8M81 19l-8 8M27 73l-8 8"/></g><circle cx="50" cy="50" r="26" fill="#ffd166" ${st(3.5)}/>${kf(50, 52)}`) },
    { id: 'nube', svg: sv(`<path d="M26 78a18 18 0 0 1-2-36 24 24 0 0 1 46-6 20 20 0 0 1 8 42z" fill="#fff" ${st(3.5)}/>${kf(50, 62)}`) },
    { id: 'arcoiris', svg: sv(`<g fill="none" stroke-width="9" stroke-linecap="round"><path d="M10 82A40 40 0 0 1 90 82" stroke="#ff6b6b"/><path d="M20 82A30 30 0 0 1 80 82" stroke="#ffd43b"/><path d="M30 82A20 20 0 0 1 70 82" stroke="#69db7c"/><path d="M40 82A10 10 0 0 1 60 82" stroke="#4dabf7"/></g>`) },
    { id: 'estrella-fugaz', svg: sv(`<path d="M56 44L14 86M46 34L10 62M66 54L36 90" fill="none" stroke="#ffd43b" stroke-width="7" stroke-linecap="round" opacity=".75"/><g transform="translate(46 4) scale(.62)"><path d="${STAR}" fill="#ffd43b" ${st(5)}/></g>`) },
    { id: 'brillitos', svg: sv(`<g transform="translate(4 4) scale(.62)"><path d="${SPARK}" fill="#fff3a8" ${st(5)}/></g><g transform="translate(58 10) scale(.3)"><path d="${SPARK}" fill="#ffd1e8" ${st(8)}/></g><g transform="translate(60 54) scale(.4)"><path d="${SPARK}" fill="#cfe8ff" ${st(7)}/></g>`) }
  ].map(x => ({ snd: 'sticker', ...x }));

  /* ---------- plantitas ---------- */
  const plants = [
    { id: 'cactus', svg: sv(`<rect x="14" y="40" width="14" height="30" rx="7" fill="#7bd88f" ${st(3.5)}/><rect x="22" y="60" width="18" height="11" fill="#7bd88f" ${st(3.5)}/><rect x="72" y="32" width="14" height="30" rx="7" fill="#7bd88f" ${st(3.5)}/><rect x="60" y="52" width="18" height="11" fill="#7bd88f" ${st(3.5)}/><path d="M34 84V28a16 16 0 0 1 32 0v56z" fill="#7bd88f" ${st(3.5)}/><path d="M26 76h48l-5 18H31z" fill="#e08a5b" ${st(3.5)}/><circle cx="50" cy="12" r="6" fill="#ff8fc7" ${st(2.4)}/>${kf(50, 56, .9)}`) },
    { id: 'suculenta', svg: sv(`<g fill="#7bd88f" ${st(3)}><ellipse cx="50" cy="44" rx="10" ry="20" transform="rotate(-62 50 64)"/><ellipse cx="50" cy="44" rx="10" ry="20" transform="rotate(62 50 64)"/><ellipse cx="50" cy="44" rx="10" ry="20" transform="rotate(-32 50 64)"/><ellipse cx="50" cy="44" rx="10" ry="20" transform="rotate(32 50 64)"/><ellipse cx="50" cy="44" rx="10" ry="20"/></g><path d="M24 62h52l-6 32H30z" fill="#ffb38a" ${st(3.5)}/>${kf(50, 76, .8)}`) },
    { id: 'margarita', svg: sv(`<path d="M50 56V94" stroke="#51cf66" stroke-width="6" stroke-linecap="round"/><path d="M50 82c-12-2-20-8-22-18 12 0 20 6 22 18z" fill="#69db7c" ${st(2.6)}/><g fill="#fff" ${st(3)}>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<ellipse cx="50" cy="22" rx="8" ry="15" transform="rotate(${a} 50 42)"/>`).join('')}</g><circle cx="50" cy="42" r="13" fill="#ffd43b" ${st(3)}/>${kf(50, 43, .55)}`) },
    { id: 'tulipan', svg: sv(`<path d="M50 52V94" stroke="#51cf66" stroke-width="6" stroke-linecap="round"/><path d="M50 90c-14-2-22-10-24-24 14 2 22 10 24 24zM50 90c14-2 22-10 24-24-14 2-22 10-24 24z" fill="#69db7c" ${st(2.8)}/><path d="M26 48C24 30 30 16 34 10l16 14 16-14c4 6 10 20 8 38-4 16-44 16-48 0z" fill="#ff7aa8" ${st(3.5)}/>`) },
    { id: 'brote', svg: sv(`<path d="M50 86V50" stroke="#51cf66" stroke-width="6" stroke-linecap="round"/><path d="M50 54C28 56 16 40 18 22c20 0 34 10 32 32z" fill="#69db7c" ${st(3.2)}/><path d="M50 62C70 62 82 50 80 34c-18 0-32 8-30 28z" fill="#8ce99a" ${st(3.2)}/><path d="M14 94q36-28 72 0z" fill="#a9744f" ${st(3.5)}/>${kf(50, 86, .65)}`) },
    { id: 'trebol', svg: sv(`<path d="M50 52q6 24 16 42" fill="none" stroke="#2f9e44" stroke-width="5" stroke-linecap="round"/>${[0, 90, 180, 270].map(a => `<g transform="rotate(${a} 50 50)"><path d="M50 50C34 36 32 22 41 15c6-4 9 4 9 9 0-5 3-13 9-9 9 7 7 21-9 35z" fill="#69db7c" ${st(3)}/></g>`).join('')}`) },
    { id: 'hongo', svg: sv(`<path d="M34 56h32v26a16 8 0 0 1-32 0z" fill="#fff4e0" ${st(3.5)}/><path d="M10 58C10 28 28 10 50 10s40 18 40 48z" fill="#ff6b6b" ${st(3.5)}/><circle cx="32" cy="34" r="7" fill="#fff"/><circle cx="62" cy="28" r="6" fill="#fff"/><circle cx="76" cy="46" r="5" fill="#fff"/><circle cx="46" cy="48" r="4.5" fill="#fff"/>${kf(50, 72, .8)}`) }
  ].map(x => ({ snd: 'sticker', ...x }));

  /* ---------- bolitas con emociones ---------- */
  function blob(c, m) {
    return sv(
      `<path d="M50 12c26 0 40 17 40 42 0 21-15 34-40 34S10 75 10 54c0-25 14-42 40-42z" fill="${c}" ${st(3.5)}/>` +
      `<path d="M28 30q6-9 17-11" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>` +
      `<g transform="translate(0 -4)">${blush(68, 27)}${eyes(m, INK)}${mouth(m, INK)}</g>`
    );
  }
  const moods = [
    ['#ffe066', 'happy'], ['#ff9fc0', 'love'], ['#8fd3ff', 'cry'], ['#ff8a80', 'angry'], ['#cdb4ff', 'sleepy'],
    ['#9be7a8', 'cool'], ['#ffc27a', 'sparkle'], ['#8fe3d4', 'nervous'], ['#ffcfb0', 'shy'], ['#b3c7ff', 'surprised'], ['#d4ec7a', 'wink']
  ].map((a, i) => ({ id: 'bolita' + (i + 1), svg: blob(a[0], a[1]), snd: 'sticker' }));

  /* ---------- palabras ---------- */
  function label(txt, bg, rot = 0, fg = '#2b2a33') {
    return sv(`<g transform="rotate(${rot} 80 28)"><rect x="6" y="6" width="148" height="44" rx="10" fill="${bg}" ${st(3)}/><text x="80" y="38" text-anchor="middle" font-size="24" fill="${fg}" font-family="'Patrick Hand','Segoe Print',sans-serif">${txt}</text></g>`, '0 0 160 56');
  }
  const words = [
    ['¡Hecho!', '#b8f0a6', -3], ['¡Tú puedes!', '#ffe066', 2], ['Importante', '#ff9d9d', -2], ['Urgente', '#ff6b6b', 3, '#fff'],
    ['Pendiente', '#a5dcff', -2], ['Ánimo', '#ffb3d1', 3], ['¡Gracias!', '#d9c2ff', -3], ['No olvidar', '#ffc98a', 2], ['¡Yay!', '#9be7a8', -2], ['Mañana', '#8fe3d4', 2]
  ].map((a, i) => ({ id: 'palabra' + (i + 1), svg: label(a[0], a[1], a[2], a[3]), w: 2.1, snd: 'sticker' }));

  /* ---------- chinchetas y clips ---------- */
  const pin = c => sv(`<ellipse cx="50" cy="90" rx="10" ry="3" fill="#000" opacity=".2"/><path d="M50 94L47 62h6z" fill="#9aa0a6" ${st(2)}/><rect x="36" y="54" width="28" height="9" rx="3" fill="${c}" ${st(3)}/><path d="M32 54Q32 14 50 14t18 40z" fill="${c}" ${st(3.5)}/><ellipse cx="43" cy="33" rx="4" ry="9" fill="#fff" opacity=".55"/>`);
  const pins = ['#ff5a5f', '#4dabf7', '#51cf66', '#ffd43b', '#ff8fc7', '#9775fa'].map((c, i) => ({ id: 'chincheta' + (i + 1), svg: pin(c), snd: 'pin' }));
  pins.push({ id: 'clip', svg: sv(`<path d="M62 30v38a14 14 0 0 1-28 0V26a9 9 0 0 1 18 0v40a4.5 4.5 0 0 1-9 0V34" fill="none" stroke="#9aa0a6" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>`), snd: 'pin' });
  pins.push({ id: 'pinza', svg: sv(`<path d="M30 42Q30 14 50 14t20 28" fill="none" stroke="#adb5bd" stroke-width="4.5" stroke-linecap="round"/><path d="M18 40h64l-6 44H24z" fill="#3b3b44" ${st(3)}/><path d="M30 52h40" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".3"/>`), snd: 'pin' });

  /* ---------- cinta washi ---------- */
  const TP = 'M4 0H116L112 6 116 12 112 18 116 24 112 30 116 36H4L8 30 4 24 8 18 4 12 8 6z';
  const tape = (base, over) => ({ svg: sv(`<clipPath id="wc"><path d="${TP}"/></clipPath><path d="${TP}" fill="${base}" opacity=".88"/><g clip-path="url(#wc)">${over}</g>`, '0 0 120 36'), tape: true, w: 2.4, snd: 'tape' });
  const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const HRT = 'M0 4C-6 -1 -5 -6 -2.5 -6 -1 -6 0 -5 0 -4 0 -5 1 -6 2.5 -6 5 -6 6 -1 0 4Z';
  const SP4 = 'M0-5L1.5-1.5 5 0 1.5 1.5 0 5-1.5 1.5-5 0-1.5-1.5Z';
  const tapes = [
    ['rayas', tape('#ffc2d6', `<g stroke="#fff" stroke-width="6" opacity=".7">${rep(10, i => `<path d="M${i * 16 - 20} 40L${i * 16 + 20} -4"/>`)}</g>`)],
    ['lunares', tape('#b8e0ff', `<g fill="#fff" opacity=".85">${rep(9, i => `<circle cx="${10 + i * 14}" cy="${i % 2 ? 24 : 12}" r="3.6"/>`)}</g>`)],
    ['cuadros', tape('#fff0a8', rep(10, i => rep(3, j => ((i + j) % 2 ? '' : `<rect x="${i * 12}" y="${j * 12}" width="12" height="12" fill="#ffd43b" opacity=".6"/>`))))],
    ['corazones', tape('#ffd6e0', `<g fill="#ff6b81">${rep(6, i => `<path transform="translate(${14 + i * 19} ${i % 2 ? 24 : 12})" d="${HRT}"/>`)}</g>`)],
    ['estrellas', tape('#dcc8ff', `<g fill="#fff">${rep(7, i => `<path transform="translate(${12 + i * 16} ${i % 2 ? 25 : 11}) scale(1.2)" d="${SP4}"/>`)}</g>`)],
    ['vichy', tape('#c5f0d0', rep(10, i => `<rect x="${i * 12}" y="0" width="6" height="36" fill="#51cf66" opacity=".35"/>`) + rep(3, j => `<rect x="0" y="${j * 12}" width="120" height="6" fill="#51cf66" opacity=".35"/>`))],
    ['zigzag', tape('#ffd6b5', `<path d="M0 22l10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12 10 12 10-12" fill="none" stroke="#ff922b" stroke-width="4" stroke-linejoin="round" opacity=".8"/>`)],
    ['flores', tape('#ffe3e3', rep(5, i => `<g transform="translate(${14 + i * 24} ${i % 2 ? 24 : 12})"><circle r="2.8" fill="#ffd43b"/>${rep(5, k => `<circle cx="${(5 * Math.cos(k * 1.2566)).toFixed(1)}" cy="${(5 * Math.sin(k * 1.2566)).toFixed(1)}" r="3" fill="#ff8fa3" opacity=".9"/>`)}<circle r="2.8" fill="#ffd43b"/></g>`))]
  ].map(a => ({ id: 'washi-' + a[0], ...a[1] }));

  /* ---------- escuela y oficina ---------- */
  const school = [
    { id: 'libro', svg: sv(`<rect x="20" y="10" width="62" height="80" rx="6" fill="#6ea8fe" ${st(3.5)}/><rect x="20" y="10" width="12" height="80" rx="4" fill="#4d8ef0" ${st(3)}/><rect x="40" y="26" width="34" height="20" rx="3" fill="#fff" ${st(2.6)}/><path d="M46 34h22M46 40h14" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`) },
    { id: 'lapiz', svg: sv(`<g transform="rotate(45 50 50)"><rect x="40" y="2" width="20" height="62" fill="#ffd43b" ${st(3.5)}/><rect x="40" y="2" width="20" height="12" fill="#ff8fa3" ${st(3.5)}/><rect x="40" y="14" width="20" height="6" fill="#ced4da" ${st(2.6)}/><path d="M40 64h20l-10 28z" fill="#f3d9b1" ${st(3.5)}/><path d="M45 82h10l-5 10z" fill="${INK}"/></g>`) },
    { id: 'libreta', svg: sv(`<rect x="24" y="10" width="56" height="80" rx="6" fill="#ffb3d1" ${st(3.5)}/>${rep(6, i => `<rect x="14" y="${18 + i * 12}" width="18" height="6" rx="3" fill="#e9ecef" ${st(2.4)}/>`)}<path d="M42 30h28M42 48h28M42 66h20" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`) },
    { id: 'despertador', svg: sv(`<circle cx="26" cy="22" r="11" fill="#ff6b6b" ${st(3.2)}/><circle cx="74" cy="22" r="11" fill="#ff6b6b" ${st(3.2)}/><path d="M30 86l-8 8M70 86l8 8" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="56" r="34" fill="#fff" ${st(3.5)}/><path d="M50 56V36M50 56l13 7" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="50" cy="56" r="3" fill="${INK}"/><path d="M50 28v3M50 81v3M22 56h3M75 56h3" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`) },
    { id: 'foco', svg: sv(`<path d="M50 8C30 8 18 22 18 40c0 12 6 18 12 26 4 5 5 8 5 14h30c0-6 1-9 5-14 6-8 12-14 12-26C82 22 70 8 50 8z" fill="#ffe066" ${st(3.5)}/><rect x="36" y="82" width="28" height="9" rx="3" fill="#adb5bd" ${st(3)}/>${kf(50, 46, .9)}<path d="M8 20l8 5M92 20l-8 5M4 44h9M96 44h-9" stroke="#ffb84d" stroke-width="3.5" stroke-linecap="round"/>`) },
    { id: 'calendario', svg: sv(`<rect x="14" y="18" width="72" height="72" rx="8" fill="#fff" ${st(3.5)}/><path d="M14 26a8 8 0 0 1 8-8h56a8 8 0 0 1 8 8v14H14z" fill="#ff6b6b" ${st(3.5)}/><path d="M32 10v16M68 10v16" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M34 66l11 11 22-24" fill="none" stroke="#51cf66" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`) },
    { id: 'carta', svg: sv(`<rect x="10" y="24" width="80" height="56" rx="7" fill="#fff" ${st(3.5)}/><path d="M12 30l38 28 38-28" fill="none" ${st(3.5)}/><g transform="translate(50 62) scale(.55)"><path d="M0 22C-30 2-34-16-22-26c10-8 20-2 22 8 2-10 12-16 22-8 12 10 8 28-22 48z" fill="#ff6b81" ${st(5)}/></g>`) },
    { id: 'trofeo', svg: sv(`<path d="M30 14h40v24a20 20 0 0 1-40 0z" fill="#ffd43b" ${st(3.5)}/><path d="M30 20h-12q0 18 14 22M70 20h12q0 18-14 22" fill="none" ${st(3.5)}/><path d="M50 58v14" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M34 72h32l4 18H30z" fill="#e08a5b" ${st(3.5)}/><g transform="translate(50 32) scale(.22)"><path d="${STAR}" fill="#fff" stroke="none" transform="translate(-50 -50)"/></g>`) }
  ].map(x => ({ snd: 'sticker', ...x }));

  /* ---------- fiesta ---------- */
  const balloon = c => sv(`<path d="M50 74q-9 9 0 17t0 8" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M50 72l-6 8h12z" fill="${c}" ${st(2.6)}/><ellipse cx="50" cy="40" rx="27" ry="33" fill="${c}" ${st(3.5)}/><ellipse cx="38" cy="26" rx="5" ry="10" transform="rotate(20 38 26)" fill="#fff" opacity=".55"/>`);
  const party = [
    { id: 'globo-rojo', svg: balloon('#ff6b6b') },
    { id: 'globo-azul', svg: balloon('#4dabf7') },
    { id: 'regalo', svg: sv(`<rect x="18" y="44" width="64" height="46" rx="4" fill="#ff8fc7" ${st(3.5)}/><rect x="12" y="32" width="76" height="16" rx="4" fill="#ffa8d6" ${st(3.5)}/><rect x="44" y="32" width="12" height="58" fill="#ffe066" ${st(2.8)}/><path d="M50 32C30 32 28 14 38 12c8-1 12 10 12 20zM50 32C70 32 72 14 62 12c-8-1-12 10-12 20z" fill="#ffe066" ${st(3)}/>`) },
    { id: 'confetti-pop', svg: sv(`<path d="M10 92L32 40l28 28z" fill="#ffd43b" ${st(3.5)}/><path d="M22 66l14 14M30 50l20 20" stroke="#ff922b" stroke-width="3" stroke-linecap="round"/><g stroke-linecap="round"><path d="M56 40l10-10" stroke="#ff6b81" stroke-width="5"/><path d="M68 56l14-4" stroke="#4dabf7" stroke-width="5"/><path d="M48 28l2-14" stroke="#51cf66" stroke-width="5"/></g><circle cx="78" cy="30" r="4.5" fill="#9775fa"/><circle cx="62" cy="14" r="4" fill="#ffd43b"/><rect x="82" y="66" width="8" height="8" fill="#ff6b81" transform="rotate(25 86 70)"/>`) },
    { id: 'confeti', svg: sv(`<g>${[[18, 20, '#ff6b81', 20], [50, 12, '#4dabf7', -30], [80, 26, '#ffd43b', 45], [30, 50, '#51cf66', 60], [66, 52, '#9775fa', -20], [14, 80, '#ffd43b', 30], [48, 78, '#ff6b81', -50], [84, 82, '#4dabf7', 15]].map(a => `<rect x="${a[0] - 6}" y="${a[1] - 3}" width="12" height="6" rx="1.5" fill="${a[2]}" transform="rotate(${a[3]} ${a[0]} ${a[1]})"/>`).join('')}<circle cx="70" cy="38" r="4" fill="#ff922b"/><circle cx="24" cy="64" r="4" fill="#69db7c"/><circle cx="58" cy="92" r="3.6" fill="#ff6b81"/></g>`) },
    { id: 'corona', svg: sv(`<path d="M14 80L8 30l24 20 18-32 18 32 24-20-6 50z" fill="#ffd43b" ${st(3.5)}/><circle cx="50" cy="66" r="6" fill="#ff6b81" ${st(2.4)}/><circle cx="28" cy="66" r="4.5" fill="#4dabf7" ${st(2.4)}/><circle cx="72" cy="66" r="4.5" fill="#51cf66" ${st(2.4)}/>`) }
  ].map(x => ({ snd: 'sticker', ...x }));

  /* ================= PAQUETES DE TEMPORADA ================= */
  const FEST = [];
  const eyeDots = (y, c = INK, dx = 12, r = 3.6) => `<circle cx="${50 - dx}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${50 + dx}" cy="${y}" r="${r}" fill="${c}"/>`;
  const mirror = g => `<g transform="translate(100 0) scale(-1 1)">${g}</g>`;
  const ANT = '<circle r="0"/>';

  /* ---------- Halloween ---------- */
  const halloween = [
    { id: 'calabaza', svg: sv(`<path d="M52 26Q54 12 66 10" fill="none" stroke="#5aa845" stroke-width="6" stroke-linecap="round"/><ellipse cx="50" cy="60" rx="40" ry="31" fill="#ff9f43" ${st(3.5)}/><path d="M50 30Q30 60 50 90M50 30Q70 60 50 90M31 35Q12 58 31 87M69 35Q88 58 69 87" fill="none" stroke="#e57f1f" stroke-width="3" stroke-linecap="round"/><path d="M30 50l9 11H21zM70 50l9 11H61z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M32 71l7 7 6-7 5 7 5-7 6 7 7-7q-18 12-36 0z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`) },
    { id: 'fantasma', svg: sv(`<path d="M18 92V46a32 32 0 0 1 64 0v46l-10.7-9-10.7 9-10.6-9-10.7 9-10.6-9z" fill="#fff" ${st(3.5)}/>${kf(50, 52, .95)}`) },
    { id: 'murcielago', svg: (() => { const w = `<path d="M40 48Q24 28 4 36 12 46 9 58 19 54 25 64 30 56 40 60z" fill="#7d6b91" ${st(3.2)}/>`; return sv(`${w}${mirror(w)}<path d="M37 36l5-19 8 12 8-12 5 19z" fill="#5d4d73" ${st(3.2)}/><ellipse cx="50" cy="52" rx="15" ry="18" fill="#5d4d73" ${st(3.5)}/>${eyeDots(48, '#fff', 6, 3.6)}<circle cx="44" cy="48.5" r="1.6" fill="${INK}"/><circle cx="56" cy="48.5" r="1.6" fill="${INK}"/><path d="M46 57l2.2 5 2.2-5zM50.6 57l2.2 5 2.2-5z" fill="#fff"/>`); })() },
    { id: 'caramelo', svg: sv(`<path d="M6 32l24 18-24 18z" fill="#9775fa" ${st(3.2)}/><path d="M94 32L70 50l24 18z" fill="#9775fa" ${st(3.2)}/><circle cx="50" cy="50" r="26" fill="#ffb347" ${st(3.5)}/><path d="M33 40Q38 32 47 30" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".8"/>${kf(50, 54, .9)}`) },
    { id: 'arana', svg: sv(`<path d="M50 0V36" stroke="${INK}" stroke-width="2.6"/><g stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"><path d="M34 58Q16 44 10 62M33 66Q14 66 12 84M38 72Q26 82 28 94M66 58Q84 44 90 62M67 66Q86 66 88 84M62 72Q74 82 72 94"/></g><circle cx="50" cy="58" r="22" fill="#6c5b7b" ${st(3.5)}/>${eyeDots(54, '#fff', 8, 6)}<circle cx="43" cy="55" r="3" fill="${INK}"/><circle cx="59" cy="55" r="3" fill="${INK}"/><path d="M44 67q6 5 12 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`) },
    { id: 'sombrero-bruja', svg: sv(`<ellipse cx="50" cy="80" rx="43" ry="12" fill="#6c4ba6" ${st(3.5)}/><path d="M28 80L44 14Q50 4 56 14L72 80z" fill="#8a63d2" ${st(3.5)}/><path d="M29 71Q50 82 71 71L72 80Q50 90 28 80z" fill="#ffb347" ${st(3)}/><path d="M60 38l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffe066" ${st(1.8)}/>${kf(50, 56, .75)}`) },
    { id: 'lapida', svg: sv(`<path d="M22 92V44a28 28 0 0 1 56 0v48z" fill="#d7dde3" ${st(3.5)}/><path d="M10 92h80" stroke="#5aa845" stroke-width="8" stroke-linecap="round"/><path d="M38 38h24M50 27v22" stroke="#9aa5b0" stroke-width="4" stroke-linecap="round"/>${kf(50, 68, .9)}`) },
    { id: 'caldero', svg: sv(`<path d="M22 90l-8 6M78 90l8 6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M12 42h76q6 36-18 46H30Q6 78 12 42z" fill="#495057" ${st(3.5)}/><ellipse cx="50" cy="42" rx="38" ry="10" fill="#343a40" ${st(3.5)}/><ellipse cx="50" cy="42" rx="31" ry="6.5" fill="#a9e34b"/><circle cx="38" cy="26" r="6" fill="#c0eb75" ${st(2.6)}/><circle cx="60" cy="20" r="4.5" fill="#c0eb75" ${st(2.4)}/><circle cx="50" cy="8" r="3.4" fill="#c0eb75" ${st(2)}/>${eyeDots(64, '#fff', 10, 3.6)}<path d="M44 72q6 5 12 0" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/>`) },
    { id: 'dulce-maiz', svg: sv(`<path d="M50 10L92 88H8z" fill="#ffd43b" ${st(3.5)}/><path d="M50 10L65 38H35z" fill="#fff" ${st(3)}/><path d="M35 38H65L78 62H22z" fill="#ff9f43" ${st(3)}/>${kf(50, 76, .85)}`) }
  ];
  FEST.push({ id: 'halloween', name: 'Halloween', icon: '🎃', items: halloween.map(x => ({ snd: 'sticker', ...x })) });

  /* ---------- Navidad ---------- */
  const navidad = [
    { id: 'arbolito', svg: sv(`<rect x="43" y="82" width="14" height="12" fill="#a9744f" ${st(3)}/><path d="M50 38L90 86H10z" fill="#3fb86b" ${st(3.5)}/><path d="M50 22L80 62H20z" fill="#46c477" ${st(3.5)}/><path d="M50 8L70 38H30z" fill="#52c97d" ${st(3.5)}/><g transform="translate(50 8) scale(.24) translate(-50 -50)"><path d="${STAR}" fill="#ffd43b" ${st(14)}/></g><circle cx="30" cy="78" r="4.5" fill="#e5484d" ${st(2)}/><circle cx="72" cy="80" r="4.5" fill="#ffd43b" ${st(2)}/><circle cx="62" cy="50" r="3.8" fill="#4dabf7" ${st(2)}/><circle cx="38" cy="52" r="3.8" fill="#ff8ad8" ${st(2)}/>${kf(50, 72, .75)}`) },
    { id: 'santa', svg: sv(`<circle cx="50" cy="60" r="28" fill="#ffd9c0" ${st(3.5)}/><path d="M24 72Q50 106 76 72Q50 80 24 72z" fill="#fff" ${st(3.2)}/>${kf(50, 62, .8)}<path d="M22 46Q26 6 66 12Q70 26 78 46z" fill="#e5484d" ${st(3.5)}/><rect x="18" y="40" width="64" height="14" rx="7" fill="#fff" ${st(3.5)}/><circle cx="70" cy="12" r="8" fill="#fff" ${st(3)}/>`) },
    { id: 'muneco-nieve', svg: sv(`<circle cx="50" cy="72" r="24" fill="#fff" ${st(3.5)}/><circle cx="50" cy="40" r="19" fill="#fff" ${st(3.5)}/><rect x="35" y="8" width="30" height="16" rx="3" fill="#495057" ${st(3)}/><rect x="29" y="21" width="42" height="6" rx="3" fill="#495057" ${st(3)}/><path d="M52 41l22 4-22 4z" fill="#ff922b" ${st(2.4)}/>${eyeDots(35, INK, 8, 3.2)}<path d="M33 56Q50 64 67 56l2 8Q50 72 31 64z" fill="#e5484d" ${st(2.6)}/><circle cx="50" cy="74" r="2.8" fill="${INK}"/><circle cx="50" cy="84" r="2.8" fill="${INK}"/><ellipse cx="38" cy="45" rx="4.5" ry="2.8" fill="#ff9fb0" opacity=".7"/>`) },
    { id: 'regalo-verde', svg: sv(`<rect x="14" y="44" width="72" height="46" rx="4" fill="#3fb86b" ${st(3.5)}/><rect x="10" y="32" width="80" height="16" rx="4" fill="#52c97d" ${st(3.5)}/><rect x="44" y="32" width="12" height="58" fill="#e5484d" ${st(2.8)}/><path d="M50 32C28 32 26 12 38 10c9-1 12 11 12 22zM50 32C72 32 74 12 62 10c-9-1-12 11-12 22z" fill="#e5484d" ${st(3)}/>`) },
    { id: 'baston', svg: sv(`<path d="M64 92V34a17 17 0 0 0-34 0" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M64 92V34a17 17 0 0 0-34 0" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round"/><path d="M64 92V34a17 17 0 0 0-34 0" fill="none" stroke="#e5484d" stroke-width="15" stroke-dasharray="9 13" stroke-dashoffset="-3"/>`) },
    { id: 'bolita-navidad', svg: sv(`<path d="M43 16q0-12 7-12t7 12" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><rect x="40" y="14" width="20" height="12" rx="3" fill="#ffd43b" ${st(3)}/><circle cx="50" cy="60" r="32" fill="#e5484d" ${st(3.5)}/><path d="M26 52Q50 38 74 52M26 70Q50 84 74 70" fill="none" stroke="#ffd43b" stroke-width="4" stroke-linecap="round"/><ellipse cx="36" cy="46" rx="5" ry="9" transform="rotate(28 36 46)" fill="#fff" opacity=".55"/>`) },
    (() => { const gb = '<circle cx="50" cy="22" r="16"/><rect x="30" y="36" width="40" height="34" rx="12"/><ellipse cx="20" cy="46" rx="13" ry="8" transform="rotate(-20 20 46)"/><ellipse cx="80" cy="46" rx="13" ry="8" transform="rotate(20 80 46)"/><rect x="30" y="58" width="16" height="34" rx="8"/><rect x="54" y="58" width="16" height="34" rx="8"/>'; return { id: 'galleta-jengibre', svg: sv(`<g fill="#c68b59" stroke="${INK}" stroke-width="7" stroke-linejoin="round">${gb}</g><g fill="#c68b59">${gb}</g><path d="M10 50l7-3M90 50l-7-3M34 86h8M58 86h8" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><circle cx="50" cy="52" r="3.4" fill="#e5484d"/><circle cx="50" cy="62" r="3.4" fill="#3fb86b"/>${kf(50, 23, .7)}`) }; })(),
    { id: 'reno', svg: sv(`<path d="M32 42L22 14M22 14L8 20M22 14L24 2M68 42L78 14M78 14L92 20M78 14L76 2" fill="none" stroke="#8d5a2b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="18" cy="52" rx="10" ry="6" transform="rotate(-25 18 52)" fill="#c68b59" ${st(3)}/><ellipse cx="82" cy="52" rx="10" ry="6" transform="rotate(25 82 52)" fill="#c68b59" ${st(3)}/><circle cx="50" cy="60" r="30" fill="#c68b59" ${st(3.5)}/><ellipse cx="50" cy="74" rx="15" ry="11" fill="#f0d1ae"/>${eyeDots(54, INK, 13, 3.8)}<circle cx="50" cy="70" r="6" fill="#e5484d" ${st(2.4)}/><path d="M43 79q7 5 14 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="29" cy="66" rx="6" ry="3.6" fill="#ff9fb0" opacity=".6"/><ellipse cx="71" cy="66" rx="6" ry="3.6" fill="#ff9fb0" opacity=".6"/>`) }
  ];
  FEST.push({ id: 'navidad', name: 'Navidad', icon: '🎄', items: navidad.map(x => ({ snd: 'bell', ...x })) });

  /* ---------- Primavera ---------- */
  const bloom = (pc, cc, n) => sv(`${rep(n, i => `<ellipse cx="50" cy="27" rx="12" ry="20" transform="rotate(${i * 360 / n} 50 50)" fill="${pc}" ${st(3)}/>`)}<circle cx="50" cy="50" r="14" fill="${cc}" ${st(3)}/>${kf(50, 51, .5)}`);
  const primavera = [
    { id: 'flor-rosa', svg: bloom('#ff9fc7', '#ffd43b', 6) },
    { id: 'flor-lila', svg: bloom('#c9b8ff', '#ffd43b', 5) },
    { id: 'flor-blanca', svg: bloom('#ffffff', '#ffb347', 8) },
    { id: 'sakura', svg: sv(`${rep(5, i => `<path d="M50 48C35 40 35 16 47 10L50 17L53 10C65 16 65 40 50 48z" transform="rotate(${i * 72} 50 50)" fill="#ffc2d6" ${st(3)}/>`)}<circle cx="50" cy="50" r="7" fill="#ffd43b" ${st(2.4)}/>`) },
    (() => { const w1 = `<path d="M50 48C34 12 4 20 9 46c3 16 25 14 41 6z" fill="#ff9fc7" ${st(3.2)}/><path d="M50 54C30 54 17 70 28 83c10 8 22-10 22-29z" fill="#c9b8ff" ${st(3.2)}/><circle cx="26" cy="38" r="5" fill="#fff" opacity=".8"/><circle cx="34" cy="72" r="3.4" fill="#fff" opacity=".8"/>`; return { id: 'mariposa', svg: sv(`${w1}${mirror(w1)}<ellipse cx="50" cy="52" rx="5" ry="21" fill="#6c5b7b" ${st(3)}/><path d="M47 33Q42 22 35 19M53 33Q58 22 65 19" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`) }; })(),
    { id: 'abeja', svg: sv(`<ellipse cx="33" cy="28" rx="13" ry="19" transform="rotate(-25 33 28)" fill="#dff3ff" ${st(3)}/><ellipse cx="67" cy="28" rx="13" ry="19" transform="rotate(25 67 28)" fill="#dff3ff" ${st(3)}/><ellipse cx="50" cy="60" rx="34" ry="28" fill="#ffd43b" ${st(3.5)}/><path d="M38 38v44M62 38v44" stroke="${INK}" stroke-width="8"/><path d="M84 60l9 4-9 4z" fill="${INK}"/>${kf(50, 58, .55)}`) },
    { id: 'pajarito', svg: sv(`<path d="M6 90Q50 80 94 90" fill="none" stroke="#8d5a2b" stroke-width="6" stroke-linecap="round"/><path d="M46 80l-2 10M58 80l2 10" stroke="#ff922b" stroke-width="4" stroke-linecap="round"/><ellipse cx="50" cy="52" rx="32" ry="28" fill="#8fd3ff" ${st(3.5)}/><path d="M80 50l14 4-14 5z" fill="#ff922b" ${st(2.6)}/><path d="M26 56Q40 38 58 58Q44 72 26 56z" fill="#5fb7f0" ${st(2.6)}/><path d="M44 25q4-14 12-8" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="66" cy="45" r="3.8" fill="${INK}"/><ellipse cx="71" cy="56" rx="5" ry="3" fill="#ff9fb0" opacity=".7"/>`) },
    { id: 'conejito', svg: sv(`<ellipse cx="35" cy="28" rx="10" ry="25" transform="rotate(-8 35 28)" fill="#fff" ${st(3.5)}/><ellipse cx="35" cy="28" rx="4.5" ry="17" transform="rotate(-8 35 28)" fill="#ffb7c5"/><ellipse cx="65" cy="28" rx="10" ry="25" transform="rotate(8 65 28)" fill="#fff" ${st(3.5)}/><ellipse cx="65" cy="28" rx="4.5" ry="17" transform="rotate(8 65 28)" fill="#ffb7c5"/><circle cx="50" cy="66" r="30" fill="#fff" ${st(3.5)}/>${kf(50, 66, .95)}`) },
    { id: 'paraguas', svg: sv(`<path d="M50 14V82a8 8 0 0 1-16 0" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M50 14V82a8 8 0 0 1-16 0" fill="none" stroke="#adb5bd" stroke-width="3.5" stroke-linecap="round"/><path d="M8 56Q8 14 50 14t42 42q-10 8-21 0-10 8-21 0-11 8-21 0-10 8-21 0z" fill="#ff9fc7" ${st(3.5)}/><path d="M70 66q-4 8 0 10 4-2 0-10zM88 78q-4 8 0 10 4-2 0-10zM16 80q-4 8 0 10 4-2 0-10z" fill="#8fd3ff" ${st(1.8)}/>`) },
    { id: 'mariquita', svg: sv(`<path d="M42 16Q36 6 30 8M58 16Q64 6 70 8" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="28" r="16" fill="${INK}" ${st(3)}/>${eyeDots(26, '#fff', 7, 3.6)}<circle cx="43" cy="26.5" r="1.8" fill="${INK}"/><circle cx="57" cy="26.5" r="1.8" fill="${INK}"/><ellipse cx="50" cy="66" rx="36" ry="30" fill="#e5484d" ${st(3.5)}/><path d="M50 38V96" stroke="${INK}" stroke-width="3.2"/><circle cx="30" cy="58" r="6" fill="${INK}"/><circle cx="70" cy="58" r="6" fill="${INK}"/><circle cx="34" cy="80" r="5" fill="${INK}"/><circle cx="66" cy="80" r="5" fill="${INK}"/>`) }
  ];
  FEST.push({ id: 'primavera', name: 'Primavera', icon: '🌸', items: primavera.map(x => ({ snd: 'sticker', ...x })) });

  /* ---------- Verano ---------- */
  const verano = [
    { id: 'sol-lentes', svg: sv(`<g stroke="#ffb84d" stroke-width="6" stroke-linecap="round"><path d="M50 6v12M50 82v12M6 50h12M82 50h12M19 19l8 8M73 73l8 8M81 19l-8 8M27 73l-8 8"/></g><circle cx="50" cy="50" r="27" fill="#ffd166" ${st(3.5)}/><rect x="28" y="39" width="19" height="13" rx="5" fill="#2b2a33"/><rect x="53" y="39" width="19" height="13" rx="5" fill="#2b2a33"/><path d="M47 44h6" stroke="#2b2a33" stroke-width="3"/><path d="M31 43l5-2M56 43l5-2" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".7"/><path d="M42 61q8 7 16 0" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><ellipse cx="30" cy="60" rx="5" ry="3" fill="#ff9fb0" opacity=".6"/><ellipse cx="70" cy="60" rx="5" ry="3" fill="#ff9fb0" opacity=".6"/>`) },
    { id: 'paleta', svg: sv(`<rect x="44" y="66" width="12" height="28" rx="5" fill="#f0c27b" ${st(3)}/><path d="M26 66V34a24 24 0 0 1 48 0v32z" fill="#ff8ad8" ${st(3.5)}/><path d="M29 52h42v14H29z" fill="#ffb3d1"/><path d="M26 66V34a24 24 0 0 1 48 0v32z" fill="none" ${st(3.5)}/><path d="M34 26Q38 18 46 16" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".7"/>${kf(50, 42, .9)}`) },
    { id: 'sandia', svg: sv(`<path d="M6 36a44 44 0 0 0 88 0z" fill="#5fc16a" ${st(3.5)}/><path d="M12 36a38 38 0 0 0 76 0z" fill="#ffe3e3"/><path d="M17 36a33 33 0 0 0 66 0z" fill="#ff6b81"/><ellipse cx="28" cy="50" rx="2.6" ry="4" fill="${INK}"/><ellipse cx="72" cy="50" rx="2.6" ry="4" fill="${INK}"/><ellipse cx="38" cy="66" rx="2.6" ry="4" fill="${INK}"/><ellipse cx="62" cy="66" rx="2.6" ry="4" fill="${INK}"/>${kf(50, 52, .8)}`) },
    (() => { const lf = `<path d="M46 36Q22 14 4 34Q26 30 46 38z" fill="#3fb86b" ${st(3)}/><path d="M46 36Q24 40 14 60Q34 48 46 40z" fill="#46c477" ${st(3)}/>`; return { id: 'palmera', svg: sv(`<ellipse cx="50" cy="94" rx="30" ry="4.5" fill="#f3d9a4"/><path d="M52 94Q56 62 46 36" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M52 94Q56 62 46 36" fill="none" stroke="#c68b59" stroke-width="6.5" stroke-linecap="round"/>${lf}<g transform="translate(92 0) scale(-1 1)">${lf}</g><path d="M46 36Q30 12 46 4Q62 12 46 36z" fill="#52c97d" ${st(3)}/><circle cx="40" cy="42" r="5.5" fill="#a9744f" ${st(2.6)}/><circle cx="52" cy="43" r="5.5" fill="#8d5a2b" ${st(2.6)}/>`) }; })(),
    { id: 'concha', svg: sv(`<path d="M36 88h28l-4 8H40z" fill="#ffc2d6" ${st(3)}/><path d="M50 90L12 50Q8 18 50 10Q92 18 88 50z" fill="#ffc2d6" ${st(3.5)}/><path d="M50 90L26 26M50 90L38 16M50 90V10M50 90L62 16M50 90L74 26" fill="none" stroke="#ff9fc7" stroke-width="3" stroke-linecap="round"/>${kf(50, 58, .75)}`) },
    { id: 'cangrejo', svg: sv(`<g fill="none" stroke-linecap="round"><path d="M30 54Q18 48 16 38M70 54Q82 48 84 38" stroke="${INK}" stroke-width="10"/><path d="M30 54Q18 48 16 38M70 54Q82 48 84 38" stroke="#ff6b6b" stroke-width="4"/><path d="M26 66L8 74M30 72L16 88M74 66L92 74M70 72L84 88" stroke="${INK}" stroke-width="5"/></g><circle cx="16" cy="30" r="12" fill="#ff6b6b" ${st(3.5)}/><path d="M16 30L11 18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="30" r="12" fill="#ff6b6b" ${st(3.5)}/><path d="M84 30L89 18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M42 48V34M58 48V34" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/><ellipse cx="50" cy="64" rx="30" ry="22" fill="#ff6b6b" ${st(3.5)}/><circle cx="42" cy="30" r="6.5" fill="#fff" ${st(2.6)}/><circle cx="58" cy="30" r="6.5" fill="#fff" ${st(2.6)}/><circle cx="42" cy="31" r="2.6" fill="${INK}"/><circle cx="58" cy="31" r="2.6" fill="${INK}"/>${eyeDots(62, INK, 11, 3.2)}<path d="M44 70q6 6 12 0" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="31" cy="68" rx="5" ry="3" fill="#ffb3b3" opacity=".7"/><ellipse cx="69" cy="68" rx="5" ry="3" fill="#ffb3b3" opacity=".7"/>`) },
    { id: 'pina', svg: sv(`<clipPath id="pnc"><ellipse cx="50" cy="64" rx="26" ry="31"/></clipPath><path d="M50 36Q34 18 36 4Q50 14 50 36zM50 36Q50 10 58 0Q68 16 50 36zM50 36Q66 20 80 16Q72 32 50 36z" fill="#3fb86b" ${st(3)}/><ellipse cx="50" cy="64" rx="26" ry="31" fill="#ffd43b" ${st(3.5)}/><g clip-path="url(#pnc)" stroke="#e8a33d" stroke-width="2.6" fill="none"><path d="M20 40L80 100M20 60L70 110M30 30L80 80M80 40L20 100M80 60L30 110M70 30L20 80"/></g>${kf(50, 66, .9)}`) },
    { id: 'flotador', svg: sv(`<circle cx="50" cy="50" r="30" fill="none" stroke="${INK}" stroke-width="29"/><circle cx="50" cy="50" r="30" fill="none" stroke="#fff" stroke-width="22"/><circle cx="50" cy="50" r="30" fill="none" stroke="#ff6b6b" stroke-width="22" stroke-dasharray="23.56 23.56"/><path d="M28 30Q34 24 42 22" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>`) },
    { id: 'pelota-playa', svg: (() => { const C = ['#ff6b6b', '#fff', '#ffd43b', '#fff', '#4dabf7', '#fff']; const P = a => `${(50 + 38 * Math.cos(a)).toFixed(1)} ${(50 + 38 * Math.sin(a)).toFixed(1)}`; return sv(C.map((c, i) => { const a0 = (i * 60 - 90) * Math.PI / 180, a1 = ((i + 1) * 60 - 90) * Math.PI / 180; return `<path d="M50 50L${P(a0)}A38 38 0 0 1 ${P(a1)}z" fill="${c}"/>`; }).join('') + `<circle cx="50" cy="50" r="38" fill="none" ${st(3.5)}/><circle cx="50" cy="50" r="7" fill="#fff" ${st(3)}/>`); })() }
  ];
  FEST.push({ id: 'verano', name: 'Verano', icon: '☀️', items: verano.map(x => ({ snd: 'sticker', ...x })) });

  /* ---------- Otoño ---------- */
  const otono = [
    { id: 'hoja-arce', svg: sv(`<path d="M50 4L58 20L67 13L66 35L83 27L76 47L95 52L74 64L80 78L56 72L54 94H46L44 72L20 78L26 64L5 52L24 47L17 27L34 35L33 13L42 20z" fill="#ff6b3d" ${st(3.5)}/><path d="M50 80V32M50 58L32 44M50 58L68 44" fill="none" stroke="#c2410c" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>${kf(50, 54, .55)}`) },
    { id: 'hoja-dorada', svg: sv(`<path d="M50 6Q90 24 86 62Q80 90 50 94Q20 90 14 62Q10 24 50 6z" fill="#ffb347" ${st(3.5)}/><path d="M50 94V30M50 70L34 56M50 70L66 56M50 50L38 38M50 50L62 38" fill="none" stroke="#e8801f" stroke-width="2.6" stroke-linecap="round"/>${kf(50, 66, .6)}`) },
    { id: 'bellota', svg: sv(`<path d="M50 20V6" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M22 44Q24 90 50 94Q76 90 78 44z" fill="#d9a066" ${st(3.5)}/><path d="M14 46Q14 18 50 18Q86 18 86 46z" fill="#8d5a2b" ${st(3.5)}/><path d="M30 28l4 4M46 26l4 4M62 28l4 4M38 38l4 4M54 38l4 4M70 38l4 4" stroke="#6b4423" stroke-width="3" stroke-linecap="round"/>${kf(50, 68, .85)}`) },
    { id: 'hongo-cafe', svg: sv(`<path d="M34 56h32v26a16 8 0 0 1-32 0z" fill="#fff4e0" ${st(3.5)}/><path d="M10 58C10 30 28 14 50 14s40 16 40 44z" fill="#c9803d" ${st(3.5)}/><circle cx="32" cy="36" r="6" fill="#f3d9a4"/><circle cx="62" cy="30" r="5" fill="#f3d9a4"/><circle cx="76" cy="46" r="4.5" fill="#f3d9a4"/><circle cx="48" cy="46" r="4" fill="#f3d9a4"/>${kf(50, 72, .8)}`) },
    { id: 'zorrito', svg: sv(`<path d="M10 12L38 32Q50 28 62 32L90 12Q98 50 76 76Q64 92 50 92Q36 92 24 76Q2 50 10 12z" fill="#ff922b" ${st(3.5)}/><path d="M16 26L30 36Q20 40 18 52Q12 40 16 26zM84 26L70 36Q80 40 82 52Q88 40 84 26z" fill="#7a3b12" opacity=".35"/><path d="M50 92Q28 90 16 66Q34 60 50 74Q66 60 84 66Q72 90 50 92z" fill="#fff" ${st(3)}/>${eyeDots(56, INK, 15, 3.8)}<ellipse cx="50" cy="78" rx="5" ry="3.6" fill="${INK}"/><ellipse cx="26" cy="68" rx="5" ry="3" fill="#ff9fb0" opacity=".6"/><ellipse cx="74" cy="68" rx="5" ry="3" fill="#ff9fb0" opacity=".6"/>`) },
    { id: 'taza-te', svg: sv(`<path d="M30 6q-6 8 0 14t0 12M50 2q-6 8 0 14t0 12M70 6q-6 8 0 14t0 12" fill="none" stroke="#ced4da" stroke-width="4.5" stroke-linecap="round"/><path d="M80 52h4a10 10 0 0 1 0 22h-8" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M14 42h66v30a24 24 0 0 1-24 24H38a24 24 0 0 1-24-24z" fill="#fff" ${st(3.5)}/><ellipse cx="47" cy="42" rx="33" ry="7" fill="#a9744f" ${st(3.5)}/>${kf(47, 72, .9)}`) },
    { id: 'pay-calabaza', svg: sv(`<path d="M50 92L12 28Q50 10 88 28z" fill="#ff9f43" ${st(3.5)}/><path d="M12 28Q50 10 88 28" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M12 28Q50 10 88 28" fill="none" stroke="#e8c39e" stroke-width="7" stroke-linecap="round"/><circle cx="50" cy="24" r="7" fill="#fff" ${st(2.6)}/>${kf(50, 58, .75)}`) },
    { id: 'manzana', svg: sv(`<path d="M50 30C34 18 8 28 10 56c2 24 20 40 40 34 20 6 38-10 40-34 2-28-24-38-40-26z" fill="#ff6b6b" ${st(3.5)}/><path d="M50 28Q50 14 56 6" fill="none" stroke="#8d5a2b" stroke-width="5" stroke-linecap="round"/><path d="M54 18Q70 6 82 14Q70 28 54 18z" fill="#69db7c" ${st(3)}/><path d="M22 46Q24 38 32 34" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".6"/>${kf(50, 60, .9)}`) }
  ];
  FEST.push({ id: 'otono', name: 'Otoño', icon: '🍂', items: otono.map(x => ({ snd: 'sticker', ...x })) });

  /* ---------- Invierno ---------- */
  const SF = '<path d="M50 50V6M50 20l-10-8M50 20l10-8M50 34l-8-6M50 34l8-6"/>';
  const invierno = [
    { id: 'copo', svg: sv(`<g fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round">${rep(6, i => `<g transform="rotate(${i * 60} 50 50)">${SF}</g>`)}</g><g fill="none" stroke="#bfe7ff" stroke-width="4.5" stroke-linecap="round">${rep(6, i => `<g transform="rotate(${i * 60} 50 50)">${SF}</g>`)}</g><circle cx="50" cy="50" r="9" fill="#bfe7ff" ${st(3)}/>${kf(50, 51, .42)}`) },
    { id: 'gorro', svg: sv(`<circle cx="50" cy="12" r="9" fill="#fff" ${st(3)}/><path d="M16 66Q16 22 50 22Q84 22 84 66z" fill="#ff6b81" ${st(3.5)}/><path d="M30 34Q34 28 42 26" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/><rect x="12" y="62" width="76" height="24" rx="9" fill="#fff" ${st(3.5)}/><path d="M26 66v16M38 66v16M50 66v16M62 66v16M74 66v16" stroke="#dee2e6" stroke-width="3" stroke-linecap="round"/>${kf(50, 48, .8)}`) },
    { id: 'bufanda', svg: sv(`<path d="M62 60l12 34H48l-6-26z" fill="#4dabf7" ${st(3.5)}/><path d="M48 94v6M56 94v6M64 94v6M72 94v6" stroke="${INK}" stroke-width="3" stroke-linecap="round" transform="translate(0 -4)"/><path d="M8 38Q50 62 92 38V58Q50 82 8 58z" fill="#4dabf7" ${st(3.5)}/><path d="M12 48Q50 72 88 48" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>${kf(50, 52, .6)}`) },
    { id: 'miton', svg: sv(`<ellipse cx="20" cy="58" rx="9" ry="16" transform="rotate(30 20 58)" fill="#ff8ad8" ${st(3.5)}/><path d="M24 94V46Q24 12 48 12T72 46V94z" fill="#ff8ad8" ${st(3.5)}/><rect x="20" y="76" width="56" height="19" rx="7" fill="#fff" ${st(3.5)}/><path d="M34 24Q38 18 46 17" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/><g transform="translate(36 28) scale(.26)"><path d="${HEART}" fill="#fff"/></g>${kf(48, 58, .75)}`) },
    { id: 'pinguino', svg: sv(`<ellipse cx="38" cy="94" rx="11" ry="5" fill="#ff922b" ${st(2.6)}/><ellipse cx="62" cy="94" rx="11" ry="5" fill="#ff922b" ${st(2.6)}/><ellipse cx="14" cy="60" rx="8" ry="18" transform="rotate(14 14 60)" fill="#3b3b48" ${st(3)}/><ellipse cx="86" cy="60" rx="8" ry="18" transform="rotate(-14 86 60)" fill="#3b3b48" ${st(3)}/><ellipse cx="50" cy="54" rx="30" ry="38" fill="#3b3b48" ${st(3.5)}/><ellipse cx="50" cy="64" rx="20" ry="27" fill="#fff"/><circle cx="40" cy="40" r="6" fill="#fff"/><circle cx="60" cy="40" r="6" fill="#fff"/><circle cx="40.6" cy="41" r="2.8" fill="${INK}"/><circle cx="59.4" cy="41" r="2.8" fill="${INK}"/><path d="M43 50l7 9 7-9z" fill="#ff922b" ${st(2.4)}/><ellipse cx="32" cy="52" rx="5" ry="3" fill="#ff9fb0" opacity=".7"/><ellipse cx="68" cy="52" rx="5" ry="3" fill="#ff9fb0" opacity=".7"/>`) },
    { id: 'oso-polar', svg: sv(`<circle cx="22" cy="26" r="12" fill="#fff" ${st(3.5)}/><circle cx="78" cy="26" r="12" fill="#fff" ${st(3.5)}/><circle cx="22" cy="26" r="5.5" fill="#ffd5dc"/><circle cx="78" cy="26" r="5.5" fill="#ffd5dc"/><circle cx="50" cy="56" r="35" fill="#fff" ${st(3.5)}/><ellipse cx="50" cy="68" rx="15" ry="11.5" fill="#efe9df"/>${eyeDots(52, INK, 17, 3.8)}<ellipse cx="50" cy="63" rx="5.5" ry="3.8" fill="${INK}"/><path d="M44 72q6 6 12 0" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="27" cy="64" rx="6" ry="3.6" fill="#ff9fb0" opacity=".6"/><ellipse cx="73" cy="64" rx="6" ry="3.6" fill="#ff9fb0" opacity=".6"/>`) },
    { id: 'chocolate-caliente', svg: sv(`<path d="M30 6q-6 8 0 14t0 12M50 2q-6 8 0 14t0 12M70 6q-6 8 0 14t0 12" fill="none" stroke="#ced4da" stroke-width="4.5" stroke-linecap="round" transform="translate(-4 8)"/><path d="M76 54h4a10 10 0 0 1 0 22h-8" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M14 46h62v28a24 24 0 0 1-24 24H38a24 24 0 0 1-24-24z" fill="#e5484d" ${st(3.5)}/><ellipse cx="45" cy="46" rx="31" ry="7" fill="#8d5a2b" ${st(3.5)}/><rect x="27" y="30" width="16" height="16" rx="5" fill="#fff" ${st(3)}/><rect x="46" y="27" width="16" height="16" rx="5" fill="#fff" ${st(3)}/>${kf(45, 72, .85)}`) },
    { id: 'iglu', svg: sv(`<ellipse cx="50" cy="86" rx="46" ry="7" fill="#dff1ff"/><path d="M8 84Q8 20 50 20Q92 20 92 84z" fill="#f1f9ff" ${st(3.5)}/><path d="M12 62H88M20 42H80M30 30H70M36 20V30M64 20V30M24 42V62M50 42V62M76 42V62M12 62V84M38 62V84M62 62V84M88 62V84" fill="none" stroke="#b9d9f0" stroke-width="2.6"/><path d="M38 84V70Q38 56 50 56T62 70V84z" fill="#6c8ebf" ${st(3)}/>${kf(50, 38, .65)}`) },
    { id: 'pino-nevado', svg: sv(`<rect x="43" y="82" width="14" height="12" fill="#a9744f" ${st(3)}/><path d="M50 38L90 86H10z" fill="#2f9e63" ${st(3.5)}/><path d="M50 22L80 62H20z" fill="#37b172" ${st(3.5)}/><path d="M50 6L70 38H30z" fill="#3fbe7f" ${st(3.5)}/><path d="M50 6L59 20Q50 25 41 20z" fill="#fff" ${st(2.6)}/><path d="M50 22L61 38Q50 44 39 38L36 40 34 34z" fill="#fff" ${st(2.6)}/><path d="M16 80Q22 70 34 76Q42 68 50 76Q60 68 68 76Q78 70 84 80L90 86H10z" fill="#fff" ${st(2.6)}/>${kf(50, 60, .6)}`) }
  ];
  FEST.push({ id: 'invierno', name: 'Invierno', icon: '❄️', items: invierno.map(x => ({ snd: 'sticker', ...x })) });

  /* ---------- paquetes ---------- */
  const packs = [
    { id: 'gatitos', name: 'Gatitos', icon: '🐱', items: CATS },
    { id: 'cosas-gato', name: 'Cosas de gato', icon: '🐾', items: catThings.map(x => ({ snd: 'sticker', ...x })) },
    { id: 'comidita', name: 'Comidita cute', icon: '🍓', items: food },
    { id: 'cielo', name: 'Estrellitas y corazones', icon: '⭐', items: sky },
    { id: 'bolitas', name: 'Bolitas de ánimo', icon: '😊', items: moods },
    { id: 'palabras', name: 'Palabras', icon: '💬', items: words },
    { id: 'plantitas', name: 'Plantitas', icon: '🌿', items: plants },
    { id: 'chinchetas', name: 'Chinchetas y clips', icon: '📌', items: pins },
    { id: 'washi', name: 'Cinta washi', icon: '🎀', items: tapes },
    { id: 'escuela', name: 'Escuela y oficina', icon: '📚', items: school },
    { id: 'fiesta', name: 'Fiesta', icon: '🎉', items: party }
  ].concat(FEST);
  const byId = {};
  packs.forEach(p => p.items.forEach(it => { it.pack = p.id; byId[it.id] = it; }));
  window.STK = { packs, byId };
})();
