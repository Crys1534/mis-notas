'use strict';
/* Efectos de sonido de Mis Notas.
   Todos se fabrican en el momento con el audio del navegador (no hay archivos de sonido). */
(function () {
  let ctx = null, master = null, noiseBuf = null;
  let enabled = true, volume = 0.6;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = volume;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* nota con forma de campana: sube rápido y se apaga */
  function tone(f, dur, o) {
    o = o || {};
    const t0 = ctx.currentTime + (o.at || 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(f, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const v = (o.vol == null ? 0.3 : o.vol);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.006));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
    return osc;
  }

  /* ruido filtrado: papel, adhesivo, cinta */
  function noise(dur, o) {
    o = o || {};
    const t0 = ctx.currentTime + (o.at || 0);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = o.type || 'bandpass';
    f.Q.value = o.q || 1;
    f.frequency.setValueAtTime(o.f || 2000, t0);
    if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + dur);
    const g = ctx.createGain();
    const v = (o.vol == null ? 0.25 : o.vol);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + (o.attack || 0.008));
    if (o.pulses) {                       // a trocitos, como cinta que se despega
      const step = dur / o.pulses;
      for (let i = 0; i < o.pulses; i++) {
        const a = t0 + i * step;
        g.gain.setValueAtTime(v * (0.4 + Math.random() * 0.6), a);
        g.gain.setValueAtTime(0.0001, a + step * 0.55);
      }
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur + 0.05);
  }

  /* maullido: voz de sierra pasada por filtros que suben y bajan */
  function meow(base, len) {
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(base * 0.85, t0);
    osc.frequency.linearRampToValueAtTime(base * 1.25, t0 + len * 0.35);
    osc.frequency.linearRampToValueAtTime(base * 0.7, t0 + len);
    const vib = ctx.createOscillator();
    const vg = ctx.createGain();
    vib.frequency.value = 7;
    vg.gain.value = base * 0.02;
    vib.connect(vg);
    vg.connect(osc.frequency);
    const f1 = ctx.createBiquadFilter();
    f1.type = 'bandpass';
    f1.Q.value = 5;
    f1.frequency.setValueAtTime(700, t0);
    f1.frequency.linearRampToValueAtTime(1700, t0 + len * 0.4);
    f1.frequency.linearRampToValueAtTime(800, t0 + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.5, t0 + 0.05);
    g.gain.setValueAtTime(0.5, t0 + len * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
    osc.connect(f1);
    f1.connect(g);
    g.connect(master);
    osc.start(t0);
    vib.start(t0);
    osc.stop(t0 + len + 0.05);
    vib.stop(t0 + len + 0.05);
  }

  const S = {
    tap() { tone(1500, 0.04, { type: 'triangle', vol: 0.16 }); noise(0.03, { type: 'highpass', f: 3000, vol: 0.1 }); },            // lápiz que toca el papel
    pop() { tone(380, 0.14, { to: 900, vol: 0.32 }); },                                                                           // burbuja
    chip() { tone(820, 0.05, { type: 'triangle', vol: 0.18 }); },                                                                 // opción
    swatch() { tone(520, 0.09, { to: 300, vol: 0.28 }); noise(0.04, { f: 2500, vol: 0.12 }); },                                   // tapa de plumón
    open() { noise(0.28, { f: 500, to: 2600, q: 0.8, vol: 0.2 }); tone(300, 0.12, { to: 520, vol: 0.12, at: 0.1 }); },            // hoja que sube
    close() { noise(0.24, { f: 2400, to: 450, q: 0.8, vol: 0.18 }); },                                                            // hoja que baja
    flip() { noise(0.2, { type: 'highpass', f: 1500, to: 5200, vol: 0.2 }); noise(0.1, { f: 900, vol: 0.12, at: 0.08 }); },       // pasar página
    paste() { noise(0.09, { f: 1100, to: 350, q: 0.7, vol: 0.32 }); tone(150, 0.14, { to: 70, vol: 0.38, at: 0.05 }); tone(900, 0.05, { type: 'triangle', vol: 0.1, at: 0.06 }); }, // pegar nota
    update() { S.tap(); tone(660, 0.1, { type: 'triangle', vol: 0.18, at: 0.07 }); tone(880, 0.12, { type: 'triangle', vol: 0.16, at: 0.14 }); },
    peel() { noise(0.42, { f: 500, to: 4200, q: 0.9, vol: 0.2, pulses: 9 }); },                                                   // despegar
    check() {                                                                                                                      // plumón + campanita
      noise(0.16, { f: 2600, q: 3, vol: 0.12, pulses: 5 });
      tone(1319, 0.28, { vol: 0.2, at: 0.14 });
      tone(1760, 0.38, { vol: 0.18, at: 0.22 });
      tone(2637, 0.3, { vol: 0.06, at: 0.22 });
    },
    uncheck() { tone(700, 0.09, { to: 420, vol: 0.22 }); },
    sub() { tone(1100, 0.05, { type: 'square', vol: 0.06 }); tone(1650, 0.07, { vol: 0.14, at: 0.04 }); },                        // casillita
    pin() { noise(0.03, { type: 'highpass', f: 4500, vol: 0.25 }); tone(1900, 0.06, { type: 'triangle', vol: 0.22 }); tone(240, 0.1, { to: 110, vol: 0.3, at: 0.02 }); }, // chincheta en el corcho
    tape() { noise(0.4, { f: 1800, to: 900, q: 1.2, vol: 0.26, pulses: 14 }); tone(200, 0.08, { to: 90, vol: 0.2, at: 0.4 }); }, // cinta washi
    sticker() { noise(0.12, { f: 700, to: 2500, q: 0.8, vol: 0.18 }); tone(500, 0.1, { to: 760, vol: 0.2, at: 0.08 }); tone(170, 0.08, { to: 100, vol: 0.2, at: 0.12 }); },
    drop() { tone(190, 0.1, { to: 90, vol: 0.3 }); noise(0.05, { f: 800, vol: 0.12 }); },
    meow() { meow(520 + Math.random() * 80, 0.5); },
    mew() { meow(820 + Math.random() * 90, 0.3); },                                                                                // gatito chiquito
    bell() { tone(1568, 0.7, { vol: 0.2 }); tone(2349, 0.55, { vol: 0.1 }); tone(3136, 0.4, { vol: 0.05 }); },                     // campanita
    tada() {                                                                                                                       // día completo
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, { type: 'triangle', vol: 0.2, at: i * 0.09 }));
      tone(1568, 0.6, { vol: 0.16, at: 0.4 });
      noise(0.5, { type: 'highpass', f: 6000, vol: 0.1, at: 0.38, pulses: 10 });
    },
    error() { tone(300, 0.12, { type: 'triangle', vol: 0.25 }); tone(230, 0.16, { type: 'triangle', vol: 0.25, at: 0.12 }); },     // bip bop
    toast() { tone(988, 0.12, { vol: 0.14 }); tone(1319, 0.18, { vol: 0.12, at: 0.08 }); }
  };

  window.SFX = {
    names: Object.keys(S),
    unlock() { ensure(); },
    set(opts) {
      if (opts.on != null) enabled = !!opts.on;
      if (opts.vol != null) { volume = opts.vol; if (master) master.gain.value = volume; }
    },
    play(name) {
      if (!enabled || !S[name]) return;
      try { if (ensure()) S[name](); } catch (e) { /* el sonido nunca debe romper la app */ }
    }
  };
})();
