// 적 행동. stepEnemy는 이동+특수행동, onEnemyDeath는 사망 시 처리(분열 등).
import { getEnemy } from '../data/enemies.js';

// 전역 이동 배율: 플레이어·적 모두에 동일 적용(상대 밸런스 유지) → 걷는 듯한 리얼 이동감.
export const MOVE_SCALE = 0.7;

// 적 투사체(플레이어에게 피해) 발사. 아군 투사체와 구분되도록 항상 붉은색.
function fireHazard(world, x, y, ang, speed, damage) {
  world.spawnHazard({ x, y, vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed,
    radius:7, damage, life:220, color: '#ff2e2e' });
}

// 보스 현재 페이즈 유효값(hp 비율이 임계 이하일수록 강화).
function bossPhase(e) {
  const eff = { speed:e.speed, shootCd:e.shootCd, shotCount:e.shotCount };
  const ratio = e.hp / e.maxHp;
  for (const ph of e.phases || []) if (ratio <= ph.at) {
    if (ph.speed != null) eff.speed = ph.speed;
    if (ph.shootCd != null) eff.shootCd = ph.shootCd;
    if (ph.shotCount != null) eff.shotCount = ph.shotCount;
  }
  return eff;
}
function stepBossPattern(e, world, angToP) {
  const eff = bossPhase(e);
  e._shootCd = (e._shootCd ?? eff.shootCd);
  if (--e._shootCd > 0) return;
  e._shootCd = eff.shootCd;
  const n = eff.shotCount, sp = e.shotSpeed;
  if (e.pattern === 'ring') {
    for (let i=0;i<n;i++){ const a=(i/n)*Math.PI*2; fireHazard(world, e.x, e.y, a, sp, e.damage, e.color); }
  } else if (e.pattern === 'spiral') {
    e._spin = (e._spin||0) + 0.35;
    for (let i=0;i<n;i++){ const a=e._spin+(i/n)*Math.PI*2; fireHazard(world, e.x, e.y, a, sp, e.damage, e.color); }
  } else { // burst: 플레이어 방향 집중
    for (let i=0;i<n;i++){ const a=angToP+(i-(n-1)/2)*0.16; fireHazard(world, e.x, e.y, a, sp, e.damage, e.color); }
  }
}

export function stepEnemy(e, world, rng) {
  const p = world.player;
  const angToP = Math.atan2(p.y-e.y, p.x-e.x);
  let ang = angToP, spd = e.speed;

  if (e.behavior === 'charger') {
    if (e._dash > 0) { e._dash--; spd = e.dashSpeed; ang = e._dashAng; }
    else { e._dashCd = (e._dashCd ?? e.dashCd) - 1;
      if (e._dashCd <= 0) { e._dash = e.dashDur; e._dashAng = angToP; e._dashCd = e.dashCd; } }
  } else if (e.behavior === 'shooter') {
    const d = Math.hypot(p.x-e.x, p.y-e.y);
    e._shootCd = (e._shootCd ?? e.shootCd);
    if (d < (e.shotRange||360)) { spd = e.speed*0.35;
      if (--e._shootCd <= 0) { fireHazard(world, e.x, e.y, angToP, e.shotSpeed, e.damage, e.color); e._shootCd = e.shootCd; } }
  } else if (e.behavior === 'boss') {
    spd = bossPhase(e).speed;
    stepBossPattern(e, world, angToP);
  }
  e.x += Math.cos(ang)*spd*MOVE_SCALE; e.y += Math.sin(ang)*spd*MOVE_SCALE;
}

export function onEnemyDeath(e, world, rng) {
  if (e.behavior === 'splitter') {
    const mini = getEnemy(e.splitInto); if (!mini) return;
    for (let i=0;i<(e.splitCount||2);i++){ const a=rng.next()*Math.PI*2;
      world.spawnEnemy({ ...mini, x:e.x+Math.cos(a)*14, y:e.y+Math.sin(a)*14, maxHp:mini.hp }); }
  } else if (e.behavior === 'bomber') {
    for (let i=0;i<10;i++){ const a=i/10*Math.PI*2; fireHazard(world, e.x, e.y, a, 2.6, e.damage); } // 사망 폭발 탄막
  }
}
