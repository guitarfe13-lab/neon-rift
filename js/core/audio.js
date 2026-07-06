// 프로시저럴 오디오: Web Audio로 SFX 합성 + BGM(파일 있으면 재생, 없으면 칩튠 폴백).
// AudioContext는 최초 사용자 제스처(resume) 이후 생성한다(브라우저 자동재생 정책).
// 이벤트별 신스 파라미터: f=[시작Hz,끝Hz], d=길이(s), type, v=볼륨, noise=노이즈비중, arp=반음배열.
const SFX = {
  shoot:   { f:[520,220],  d:0.08, type:'square',   v:0.10 },
  hit:     { f:[320,170],  d:0.06, type:'triangle', v:0.10 },
  crit:    { f:[820,300],  d:0.12, type:'sawtooth', v:0.16 },
  kill:    { f:[190,60],   d:0.14, type:'square',   v:0.16, noise:0.3 },
  coin:    { f:[900,1350], d:0.08, type:'square',   v:0.12 },
  pick:    { f:[620,940],  d:0.05, type:'square',   v:0.08 },
  levelup: { f:[440,440],  d:0.10, type:'square',   v:0.20, arp:[0,4,7,12] },
  boss:    { f:[130,50],   d:0.55, type:'sawtooth', v:0.24, noise:0.2 },
  hurt:    { f:[220,80],   d:0.18, type:'sawtooth', v:0.20, noise:0.4 },
  death:   { f:[300,40],   d:0.7,  type:'sawtooth', v:0.24 },
  ui:      { f:[520,520],  d:0.04, type:'square',   v:0.10 },
  upgrade: { f:[520,900],  d:0.16, type:'square',   v:0.18 },
};

export function makeAudio(settings) {
  let ctx = null, master = null, sfxGain = null, bgmGain = null;
  let bgmEl = null, fallbackTimer = null, started = false, noiseBuffer = null;

  function ensure() {
    if (ctx) return ctx;
    const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.connect(ctx.destination);
    sfxGain = ctx.createGain(); sfxGain.connect(master);
    bgmGain = ctx.createGain(); bgmGain.connect(master);
    applyVolumes();
    return ctx;
  }
  function applyVolumes() {
    if (!ctx) return;
    master.gain.value = settings.muted ? 0 : (settings.master ?? 0.8);
    sfxGain.gain.value = settings.sfx ?? 0.9;
    bgmGain.gain.value = settings.bgm ?? 0.5;
  }
  function noiseBuf() {
    if (noiseBuffer) return noiseBuffer;
    const len = Math.floor(ctx.sampleRate * 0.3);
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let seed = 12345;
    for (let i = 0; i < len; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; data[i] = (seed / 0x3fffffff) - 1; }
    return noiseBuffer;
  }
  function tone(f0, f1, d, type, v, start, noise) {
    const g = ctx.createGain(); g.connect(sfxGain);
    g.gain.setValueAtTime(0.0001, start); g.gain.linearRampToValueAtTime(v, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + d);
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, start); o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), start + d);
    o.connect(g); o.start(start); o.stop(start + d + 0.02);
    if (noise > 0) {
      const ns = ctx.createBufferSource(); ns.buffer = noiseBuf();
      const ng = ctx.createGain(); ng.gain.setValueAtTime(noise * v, start); ng.gain.exponentialRampToValueAtTime(0.0001, start + d);
      ns.connect(ng); ng.connect(sfxGain); ns.start(start); ns.stop(start + d);
    }
  }
  function sfx(name) {
    if (settings.muted || !ensure()) return;
    const p = SFX[name]; if (!p) return;
    const now = ctx.currentTime;
    if (p.arp) { p.arp.forEach((semi, i) => { const f = p.f[0] * Math.pow(2, semi / 12); tone(f, f, 0.09, p.type, p.v, now + i * 0.06, 0); }); return; }
    tone(p.f[0], p.f[1], p.d, p.type, p.v, now, p.noise || 0);
  }

  // 프로시저럴 칩튠 폴백(마이너 펜타토닉 아르페지오 + 저음).
  function bgmTone(f, start, d, v) {
    const g = ctx.createGain(); g.connect(bgmGain);
    g.gain.setValueAtTime(0.0001, start); g.gain.linearRampToValueAtTime(v, start + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, start + d);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.connect(g); o.start(start); o.stop(start + d + 0.02);
  }
  function startFallback() {
    if (fallbackTimer || !ctx) return;
    const scale = [0, 3, 5, 7, 10]; const root = 220; let step = 0;
    const schedule = () => {
      const now = ctx.currentTime;
      for (let i = 0; i < 8; i++) {
        const t = now + i * 0.25;
        const semi = scale[(step + i) % scale.length];
        bgmTone(root * Math.pow(2, semi / 12), t, 0.22, 0.12);
        if (i % 4 === 0) bgmTone(root / 2 * Math.pow(2, semi / 12), t, 0.45, 0.10); // 저음
      }
      step += 8;
    };
    schedule(); fallbackTimer = setInterval(schedule, 2000);
  }
  // 지정 트랙 재생(루프). 상태(바이옴/보스)에 따라 main이 setBgm으로 전환.
  let wantFile = null, curFile = null;
  function applyBgm() {
    if (!ctx || ctx.state === 'suspended') return;   // 제스처 전이면 저장만
    if (wantFile === curFile) return;
    curFile = wantFile;
    if (bgmEl) { try { bgmEl.pause(); } catch {} bgmEl = null; }
    if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; }
    if (!wantFile) return;
    const el = new Audio('assets/bgm/' + wantFile); el.loop = true;
    try { ctx.createMediaElementSource(el).connect(bgmGain); } catch {}
    el.play().then(() => { bgmEl = el; }).catch(() => startFallback());  // 파일 없으면 프로시저럴 폴백(재시도 방지: curFile 유지)
  }
  function setBgm(file) { if (file === wantFile) { applyBgm(); return; } wantFile = file; applyBgm(); }
  function stopBgm() { if (bgmEl) bgmEl.pause(); if (fallbackTimer) { clearInterval(fallbackTimer); fallbackTimer = null; } }

  return {
    sfx,
    setVolumes(s) { if (s) settings = s; applyVolumes(); },
    resume() { const c = ensure(); if (c && c.state === 'suspended') c.resume(); applyBgm(); },
    setBgm,
    stopBgm,
  };
}
