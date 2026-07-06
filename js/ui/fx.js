// 스킬 이펙트/모션: 파티클 생성·이동(stepParticle)·렌더(drawParticle) 집약.
// DOM 비의존(drawParticle만 ctx 인자 사용) → node에서 import 안전.

// 원소별 색/명중 스타일.
const FX_ELEMENT = {
  physical:  { color:'#cfe3ff', impact:'spark' },
  arcane:    { color:'#c98bff', impact:'shard' },
  fire:      { color:'#ff6a3d', impact:'ember' },
  ice:       { color:'#8bd8ff', impact:'shard' },
  lightning: { color:'#b28bff', impact:'crackle' },
  holy:      { color:'#ffe58a', impact:'flash' },
  poison:    { color:'#9cff8b', impact:'splatter' },
};
export function elementOf(skill) { return (skill && skill.tags && skill.tags[0]) || 'physical'; }
export function elColor(el) { return (FX_ELEMENT[el] || FX_ELEMENT.physical).color; }

// 투사체 트레일(진행 반대쪽 잔상).
export function spawnTrail(world, x, y, color) {
  world.spawnParticle({ x, y, life: 9, max: 9, color, trail: true, r0: 3 });
}
// 총구/캐스트 순간 플래시(작은 확장 링).
export function spawnMuzzle(world, x, y, color) {
  world.spawnParticle({ x, y, r: 3, rMax: 16, life: 9, color, shock: true });
}
// 캐스트 텔레그래프(발밑 링).
export function spawnCastRing(world, x, y, color, r) {
  world.spawnParticle({ x, y, r: r * 0.35, rMax: r, life: 15, color, shock: true });
}
// 명중 임팩트(원소별).
export function spawnImpact(world, x, y, el, crit) {
  const def = FX_ELEMENT[el] || FX_ELEMENT.physical; const c = def.color;
  const n = crit ? 10 : 6;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random(); const s = 1.2 + Math.random() * 2.2;
    let vy = Math.sin(a) * s, grav = 0;
    if (def.impact === 'ember') { vy = -Math.abs(vy) - 0.5; grav = -0.03; }        // 잔불: 상승
    else if (def.impact === 'splatter') { grav = 0.06; }                            // 독: 낙하
    world.spawnParticle({ x, y, vx: Math.cos(a) * s, vy, life: crit ? 16 : 12, color: (crit && i % 3 === 0) ? '#fff' : c, spark: true, grav });
  }
  if (def.impact === 'flash') world.spawnParticle({ x, y, r: 6, rMax: 34, life: 15, color: c, shock: true });
  if (crit) world.spawnParticle({ x, y, r: 4, rMax: 26, life: 13, color: '#fff', shock: true });
}
// 연쇄 번개: 두 점 사이를 여러 꺾인 세그먼트로.
export function spawnChainArc(world, x1, y1, x2, y2, color) {
  const seg = 3; let px = x1, py = y1;
  for (let i = 1; i <= seg; i++) {
    const t = i / seg; let nx = x1 + (x2 - x1) * t, ny = y1 + (y2 - y1) * t;
    if (i < seg) { nx += (Math.random() - 0.5) * 16; ny += (Math.random() - 0.5) * 16; }
    world.spawnParticle({ x1: px, y1: py, x2: nx, y2: ny, bolt: true, color: color || '#b28bff', life: 7 });
    px = nx; py = ny;
  }
}
// 오라 유지 필드(저빈도 스폰) — 원소별 상승/부유.
export function spawnAuraField(world, x, y, el, radius) {
  const c = elColor(el); const a = Math.random() * Math.PI * 2, rr = Math.random() * radius;
  world.spawnParticle({ x: x + Math.cos(a) * rr, y: y + Math.sin(a) * rr,
    vx: (Math.random() - 0.5) * 0.3, vy: -0.35 - Math.random() * 0.5, life: 24, max: 24, color: c, spark: true, grav: 0 });
}

// 파티클 1스텝(이동/성장). 살아있으면 true.
export function stepParticle(pt) {
  if (pt.spark) { pt.x += pt.vx; pt.y += pt.vy; pt.vx *= 0.9; pt.vy = pt.vy * 0.9 + (pt.grav || 0); }
  else if (pt.shock) { pt.r += (pt.rMax - pt.r) * 0.14; }
  // trail/bolt/ring: 정지, 수명만
  return (--pt.life) > 0;
}

// 파티클 렌더.
export function drawParticle(ctx, pt, camX, camY) {
  const x = pt.x - camX, y = pt.y - camY;
  ctx.save();
  if (pt.spark) { ctx.globalAlpha = Math.min(1, pt.life / 10); ctx.fillStyle = pt.color || '#fff';
    ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
  else if (pt.trail) { const k = pt.life / (pt.max || 9); ctx.globalAlpha = k * 0.6; ctx.fillStyle = pt.color || '#fff';
    ctx.beginPath(); ctx.arc(x, y, (pt.r0 || 3) * k, 0, 7); ctx.fill(); }
  else if (pt.shock) { ctx.globalAlpha = Math.min(1, pt.life / 16); ctx.strokeStyle = pt.color || '#fff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x, y, pt.r, 0, 7); ctx.stroke(); }
  else if (pt.bolt) { ctx.globalAlpha = Math.min(1, pt.life / 6); ctx.strokeStyle = pt.color || '#b28bff'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pt.x1 - camX, pt.y1 - camY); ctx.lineTo(pt.x2 - camX, pt.y2 - camY); ctx.stroke(); }
  else if (pt.ring) { ctx.globalAlpha = Math.min(1, pt.life / 8); ctx.strokeStyle = pt.color || '#5cf'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, pt.r, 0, 7); ctx.stroke(); }
  ctx.restore();
}
