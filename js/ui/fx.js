// 스킬 이펙트/모션: 원소마다 "고유한 모양"의 파티클로 시선을 끈다.
//  번개=지그재그 볼트, 화염=상승 불꽃, 얼음=각진 결정, 신성=방사 빛줄기,
//  비전=회전 룬, 독=부글 거품, 물리=베기 호. + 글로우(shadowBlur).
//  DOM 비의존(drawParticle만 ctx 사용) → node 테스트 안전.

const FX_ELEMENT = {
  physical:  { color: '#cfe3ff' },
  arcane:    { color: '#c98bff' },
  fire:      { color: '#ff6a3d' },
  ice:       { color: '#8bd8ff' },
  lightning: { color: '#c9a3ff' },
  holy:      { color: '#ffe58a' },
  poison:    { color: '#9cff8b' },
};
export function elementOf(skill) { return (skill && skill.tags && skill.tags[0]) || 'physical'; }
export function elColor(el) { return (FX_ELEMENT[el] || FX_ELEMENT.physical).color; }

// ── 내부 헬퍼 ──
function burstSparks(world, x, y, c, n, crit) {
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + Math.random(), s = 1.2 + Math.random() * 2.2;
    world.spawnParticle({ spark: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: crit ? 16 : 12, color: (crit && i % 3 === 0) ? '#fff' : c }); }
}
// 한 점에서 뻗는 지그재그 번개 줄기(여러 꺾인 세그먼트).
function boltRay(world, x, y, ang, len, color) {
  const seg = 3; let px = x, py = y; const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len;
  for (let i = 1; i <= seg; i++) { const t = i / seg; let nx = x + (ex - x) * t, ny = y + (ey - y) * t;
    if (i < seg) { nx += (Math.random() - 0.5) * 8; ny += (Math.random() - 0.5) * 8; }
    world.spawnParticle({ bolt: true, x1: px, y1: py, x2: nx, y2: ny, life: 8, color }); px = nx; py = ny; }
}

// 투사체 트레일(원소별 잔상).
export function spawnTrail(world, x, y, color, el) {
  if (el === 'fire') world.spawnParticle({ flame: true, x, y, vx: (Math.random() - 0.5) * 0.4, vy: -0.3 - Math.random() * 0.3, life: 12, max: 12, color: color || '#ff6a3d', sz: 3 });
  else if (el === 'lightning') {
    if (Math.random() < 0.5) { const a = Math.random() * Math.PI * 2; world.spawnParticle({ bolt: true, x1: x, y1: y, x2: x + Math.cos(a) * 8, y2: y + Math.sin(a) * 8, life: 5, color: color || '#c9a3ff' }); }
    else world.spawnParticle({ trail: true, x, y, life: 8, max: 8, color, r0: 2.6 });
  } else if (el === 'ice') world.spawnParticle({ shard: true, x, y, vx: 0, vy: 0, grav: 0, life: 9, max: 9, color: color || '#8bd8ff', rot: Math.random() * 6, vr: 0.2, sz: 2 });
  else world.spawnParticle({ trail: true, x, y, life: 9, max: 9, color, r0: 3 });
}

// 총구/캐스트 순간 섬광(원소별).
export function spawnMuzzle(world, x, y, color, el) {
  const c = color || elColor(el);
  if (el === 'lightning') { for (let i = 0; i < 3; i++) { const a = Math.random() * Math.PI * 2; boltRay(world, x, y, a, 10 + Math.random() * 8, c); } }
  else world.spawnParticle({ shock: true, x, y, r: 3, rMax: 18, life: 9, color: c });
  for (let i = 0; i < 3; i++) { const a = Math.random() * Math.PI * 2, s = 1 + Math.random() * 1.6;
    world.spawnParticle({ spark: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 8, color: c }); }
}

// 캐스트 텔레그래프(발밑 링).
export function spawnCastRing(world, x, y, color, r) {
  world.spawnParticle({ x, y, r: r * 0.35, rMax: r, life: 15, color, shock: true });
}

// 명중 임팩트(원소별 고유 연출).
export function spawnImpact(world, x, y, el, crit) {
  const c = elColor(el); const N = crit ? 12 : 7;
  if (el === 'lightning') {
    for (let i = 0; i < (crit ? 5 : 3); i++) { const a = Math.random() * Math.PI * 2; boltRay(world, x, y, a, 14 + Math.random() * 14, c); }
    burstSparks(world, x, y, c, crit ? 6 : 4, crit);
  } else if (el === 'fire') {
    for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 1.8;
      world.spawnParticle({ flame: true, x, y, vx: Math.cos(a) * s, vy: -Math.abs(Math.sin(a) * s) - 0.4, life: crit ? 22 : 16, max: crit ? 22 : 16, color: c, sz: crit ? 5 : 4 }); }
    world.spawnParticle({ shock: true, x, y, r: 5, rMax: crit ? 30 : 20, life: 12, color: c });
  } else if (el === 'ice') {
    for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, s = 1.4 + Math.random() * 2.4;
      world.spawnParticle({ shard: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, grav: 0.05, life: crit ? 18 : 14, max: crit ? 18 : 14, color: c, rot: a, vr: (Math.random() - 0.5) * 0.5, sz: 3 + Math.random() * 3 }); }
    world.spawnParticle({ shock: true, x, y, r: 5, rMax: 24, life: 12, color: c });
  } else if (el === 'holy') {
    const rays = crit ? 12 : 8;
    for (let i = 0; i < rays; i++) { const a = (i / rays) * Math.PI * 2; world.spawnParticle({ ray: true, x, y, ang: a, len0: 6, len: crit ? 34 : 24, life: 15, max: 15, color: c }); }
    world.spawnParticle({ shock: true, x, y, r: 6, rMax: crit ? 42 : 30, life: 16, color: '#fff' });
  } else if (el === 'arcane') {
    world.spawnParticle({ glyph: true, x, y, rot: Math.random() * 6, vr: 0.16, life: crit ? 22 : 16, max: crit ? 22 : 16, color: c, sz: crit ? 16 : 12 });
    burstSparks(world, x, y, c, crit ? 7 : 5, crit);
  } else if (el === 'poison') {
    for (let i = 0; i < N; i++) { const a = Math.random() * Math.PI * 2, s = 0.5 + Math.random() * 1.4;
      world.spawnParticle({ bubble: true, x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.2, grav: 0.05, life: crit ? 24 : 18, max: crit ? 24 : 18, color: c, sz: 2 + Math.random() * 3, wob: Math.random() * 6, ws: 0.3 }); }
  } else { // physical: 교차 베기 호 + 스파크
    const a0 = Math.random() * Math.PI * 2;
    world.spawnParticle({ arc: true, x, y, ang: a0, arcR: crit ? 22 : 16, life: 10, max: 10, color: c });
    world.spawnParticle({ arc: true, x, y, ang: a0 + Math.PI, arcR: crit ? 18 : 13, life: 9, max: 9, color: c });
    burstSparks(world, x, y, c, crit ? 8 : 5, crit);
  }
  if (crit) world.spawnParticle({ shock: true, x, y, r: 4, rMax: 28, life: 13, color: '#fff' });
}

// 연쇄 번개: 두 점 사이를 여러 꺾인 세그먼트로.
export function spawnChainArc(world, x1, y1, x2, y2, color) {
  const seg = 4; let px = x1, py = y1;
  for (let i = 1; i <= seg; i++) {
    const t = i / seg; let nx = x1 + (x2 - x1) * t, ny = y1 + (y2 - y1) * t;
    if (i < seg) { nx += (Math.random() - 0.5) * 18; ny += (Math.random() - 0.5) * 18; }
    world.spawnParticle({ x1: px, y1: py, x2: nx, y2: ny, bolt: true, color: color || '#c9a3ff', life: 8 });
    px = nx; py = ny;
  }
}

// 오라 유지 필드(원소별 부유 파티클).
export function spawnAuraField(world, x, y, el, radius) {
  const c = elColor(el); const a = Math.random() * Math.PI * 2, rr = Math.random() * radius;
  const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
  if (el === 'fire') world.spawnParticle({ flame: true, x: px, y: py, vx: 0, vy: -0.4, life: 22, max: 22, color: c, sz: 3 });
  else if (el === 'ice') world.spawnParticle({ shard: true, x: px, y: py, vx: 0, vy: -0.2, grav: 0, life: 22, max: 22, color: c, rot: a, vr: 0.15, sz: 2.4 });
  else if (el === 'poison') world.spawnParticle({ bubble: true, x: px, y: py, vx: 0, vy: -0.25, grav: 0, life: 26, max: 26, color: c, sz: 2.6, wob: Math.random() * 6, ws: 0.25 });
  else if (el === 'holy') world.spawnParticle({ ray: true, x: px, y: py, ang: a, len0: 3, len: 12, life: 16, max: 16, color: c });
  else if (el === 'arcane') world.spawnParticle({ glyph: true, x: px, y: py, rot: a, vr: 0.1, life: 20, max: 20, color: c, sz: 8 });
  else world.spawnParticle({ spark: true, x: px, y: py, vx: 0, vy: -0.4, life: 24, color: c });
}

// 파티클 1스텝(이동/성장). 살아있으면 true.
export function stepParticle(pt) {
  if (pt.spark) { pt.x += pt.vx; pt.y += pt.vy; pt.vx *= 0.9; pt.vy = pt.vy * 0.9 + (pt.grav || 0); }
  else if (pt.flame) { pt.x += pt.vx; pt.y += pt.vy; pt.vx *= 0.9; pt.vy -= 0.04; }             // 상승 가속
  else if (pt.shard) { pt.x += pt.vx; pt.y += pt.vy; pt.vy += (pt.grav || 0); pt.vx *= 0.96; pt.rot = (pt.rot || 0) + (pt.vr || 0); }
  else if (pt.bubble) { pt.x += pt.vx; pt.y += pt.vy; pt.vy += (pt.grav || 0); pt.vx *= 0.96; pt.wob = (pt.wob || 0) + (pt.ws || 0.3); }
  else if (pt.glyph) { pt.rot = (pt.rot || 0) + (pt.vr || 0.12); }
  else if (pt.shock) { pt.r += (pt.rMax - pt.r) * 0.14; }
  // ray/arc/trail/bolt/ring: 정지, 수명만
  return (--pt.life) > 0;
}

// 파티클 렌더(원소별 모양 + 글로우).
export function drawParticle(ctx, pt, camX, camY) {
  const x = pt.x - camX, y = pt.y - camY;
  ctx.save();
  if (pt.spark) { const k = Math.min(1, pt.life / 10); ctx.globalAlpha = k; ctx.fillStyle = pt.color || '#fff';
    ctx.shadowColor = pt.color || '#fff'; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill(); }
  else if (pt.trail) { const k = pt.life / (pt.max || 9); ctx.globalAlpha = k * 0.6; ctx.fillStyle = pt.color || '#fff';
    ctx.shadowColor = pt.color || '#fff'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, (pt.r0 || 3) * k, 0, 7); ctx.fill(); }
  else if (pt.flame) { const k = pt.life / (pt.max || 16); ctx.shadowColor = pt.color; ctx.shadowBlur = 12;
    ctx.globalAlpha = Math.min(1, k * 1.3); ctx.fillStyle = pt.color; ctx.beginPath(); ctx.arc(x, y, (pt.sz || 4) * (0.5 + k), 0, 7); ctx.fill();
    ctx.globalAlpha = Math.min(1, k * 1.6); ctx.fillStyle = '#ffe6a0'; ctx.beginPath(); ctx.arc(x, y, (pt.sz || 4) * 0.5 * k, 0, 7); ctx.fill(); }
  else if (pt.shard) { const k = Math.min(1, pt.life / (pt.max || 14)); ctx.globalAlpha = k; ctx.translate(x, y); ctx.rotate(pt.rot || 0);
    ctx.fillStyle = pt.color; ctx.shadowColor = pt.color; ctx.shadowBlur = 8; const s = pt.sz || 3;
    ctx.beginPath(); ctx.moveTo(0, -s * 1.6); ctx.lineTo(s * 0.7, 0); ctx.lineTo(0, s * 1.6); ctx.lineTo(-s * 0.7, 0); ctx.closePath(); ctx.fill(); }
  else if (pt.bubble) { const k = Math.min(1, pt.life / (pt.max || 18)); const wob = Math.sin(pt.wob || 0) * 1.2;
    ctx.strokeStyle = pt.color; ctx.lineWidth = 1.6; ctx.shadowColor = pt.color; ctx.shadowBlur = 8;
    ctx.globalAlpha = k * 0.9; ctx.beginPath(); ctx.arc(x + wob, y, (pt.sz || 3) + (1 - k) * 2, 0, 7); ctx.stroke();
    ctx.globalAlpha = k * 0.5; ctx.fillStyle = pt.color; ctx.beginPath(); ctx.arc(x + wob - 1, y - 1, (pt.sz || 3) * 0.4, 0, 7); ctx.fill(); }
  else if (pt.glyph) { const k = Math.min(1, pt.life / (pt.max || 15)); ctx.globalAlpha = k * 0.9; ctx.translate(x, y); ctx.rotate(pt.rot || 0);
    ctx.strokeStyle = pt.color; ctx.lineWidth = 2; ctx.shadowColor = pt.color; ctx.shadowBlur = 10; const s = (pt.sz || 12) * (0.6 + k * 0.4);
    ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, px = Math.cos(a) * s, py = Math.sin(a) * s; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, 7); ctx.stroke(); }
  else if (pt.ray) { const k = Math.min(1, pt.life / (pt.max || 14)); ctx.globalAlpha = k; ctx.translate(x, y); ctx.rotate(pt.ang || 0);
    ctx.strokeStyle = pt.color; ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.shadowColor = pt.color; ctx.shadowBlur = 10;
    ctx.beginPath(); ctx.moveTo(pt.len0 || 6, 0); ctx.lineTo(pt.len || 22, 0); ctx.stroke(); }
  else if (pt.arc) { const k = Math.min(1, pt.life / (pt.max || 10)); ctx.globalAlpha = k; ctx.strokeStyle = pt.color; ctx.lineWidth = 3 * (0.5 + k); ctx.lineCap = 'round';
    ctx.shadowColor = pt.color; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, pt.arcR || 16, (pt.ang || 0) - 0.7, (pt.ang || 0) + 0.7); ctx.stroke(); }
  else if (pt.shock) { ctx.globalAlpha = Math.min(1, pt.life / 16); ctx.strokeStyle = pt.color || '#fff'; ctx.lineWidth = 4;
    ctx.shadowColor = pt.color || '#fff'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(x, y, pt.r, 0, 7); ctx.stroke(); }
  else if (pt.bolt) { ctx.globalAlpha = Math.min(1, pt.life / 6); ctx.strokeStyle = pt.color || '#c9a3ff'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
    ctx.shadowColor = pt.color || '#c9a3ff'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.moveTo(pt.x1 - camX, pt.y1 - camY); ctx.lineTo(pt.x2 - camX, pt.y2 - camY); ctx.stroke();
    ctx.globalAlpha *= 0.6; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.shadowBlur = 0; ctx.stroke(); }               // 흰 코어
  else if (pt.ring) { ctx.globalAlpha = Math.min(1, pt.life / 8); ctx.strokeStyle = pt.color || '#5cf'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, pt.r, 0, 7); ctx.stroke(); }
  ctx.restore();
}
