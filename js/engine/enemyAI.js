// 적 행동. stepEnemy는 이동+특수행동, onEnemyDeath는 사망 시 처리(분열 등).
import { getEnemy } from '../data/enemies.js';

// 전역 이동 배율: 플레이어·적 모두에 동일 적용(상대 밸런스 유지) → 걷는 듯한 리얼 이동감.
export const MOVE_SCALE = 0.5;

// 적 투사체(플레이어에게 피해) 발사. 아군 투사체와 구분되도록 붉은색(스킬탄은 크고 주황빛).
function fireHazard(world, x, y, ang, speed, damage, opt) {
  world.spawnHazard({ x, y, vx:Math.cos(ang)*speed, vy:Math.sin(ang)*speed,
    radius: opt?.radius || 7, damage, life: opt?.life || 220, color: opt?.color || '#ff2e2e' });
}

// 보스 전용 스킬: 상시 탄막과 별개 쿨다운. skillTier(0~3, 진행도)가 높을수록 링 수·탄 수·데미지↑(광역·강력).
function stepBossSkill(e, world) {
  if (!e.skill) return;
  const cd = e.skill.cd || 320;
  e._skCd = (e._skCd ?? 90);   // 첫 시전은 등장 ~1.5초 후(기술을 일찍 보여줌), 이후 정규 cd
  if (--e._skCd > 0) return;
  e._skCd = cd;
  const tier = Math.max(0, Math.min(3, e.skillTier || 0));
  e._skillName = e.skill.name; e._skillNameT = 100; e._atk = 72;    // HUD 표시(약 1.6s) + 공격 애니
  const dmg = Math.round(e.damage * ((e.skill.dmgMul || 1.2) + tier * 0.12));
  const rings = 1 + tier;                              // 링 수↑ = 광역화
  const baseN = 12 + tier * 6;                         // 링당 탄 수↑
  for (let r = 0; r < rings; r++) {
    const n = baseN + r * 2, off = (r % 2) * (Math.PI / n), sp = e.shotSpeed * (1 + r * 0.28);
    for (let i = 0; i < n; i++) { const a = off + (i / n) * Math.PI * 2;
      fireHazard(world, e.x, e.y, a, sp, dmg, { radius: 9, color: '#ff7a2e' }); }
  }
  if (world.spawnParticle) world.spawnParticle({ x:e.x, y:e.y, r:e.radius*0.8, rMax:e.radius*(3+tier), life:16, color:e.color, shock:true });
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
  e._atk = 55;   // 발사 순간 공격 애니(스프라이트시트 attack) 재생
  const n = eff.shotCount, sp = e.shotSpeed;
  if (e.pattern === 'ring') {
    for (let i=0;i<n;i++){ const a=(i/n)*Math.PI*2; fireHazard(world, e.x, e.y, a, sp, e.damage); }
  } else if (e.pattern === 'spiral') {
    e._spin = (e._spin||0) + 0.35;
    for (let i=0;i<n;i++){ const a=e._spin+(i/n)*Math.PI*2; fireHazard(world, e.x, e.y, a, sp, e.damage); }
  } else { // burst: 플레이어 방향 집중
    for (let i=0;i<n;i++){ const a=angToP+(i-(n-1)/2)*0.16; fireHazard(world, e.x, e.y, a, sp, e.damage); }
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
      if (--e._shootCd <= 0) { fireHazard(world, e.x, e.y, angToP, e.shotSpeed, e.damage); e._shootCd = e.shootCd; } }
  } else if (e.behavior === 'boss') {
    spd = bossPhase(e).speed;
    stepBossPattern(e, world, angToP);
    stepBossSkill(e, world);
    if (e._skillNameT > 0) e._skillNameT--;   // HUD 스킬명 표시 타이머 감쇠
  }
  e.x += Math.cos(ang)*spd*MOVE_SCALE; e.y += Math.sin(ang)*spd*MOVE_SCALE;
  if (e._atk > 0) e._atk--;   // 공격 애니 타이머(마법 몹 등)

  // 15레벨 이후 스폰 몹(arcane): 가끔 마법 투사체(보라)를 플레이어에게 발사 → 근접 몹에도 원거리 위협.
  if (e.arcane && e.behavior !== 'boss') {
    e._castCd = e._castCd ?? (45 + Math.floor(rng.next() * 90));    // 첫 시전 0.7~2.2초(빨리 한 발)
    if (--e._castCd <= 0) {
      e._castCd = 220 + Math.floor(rng.next() * 200);               // 다음 시전까지 3.7~7초
      if (rng.next() < 0.7) {
        fireHazard(world, e.x, e.y, angToP, 3.2, Math.max(1, Math.round(e.damage * 0.8)), { radius: 8, color: '#c98bff' });
        e._atk = 16;
      }
    }
  }
}

export function onEnemyDeath(e, world, rng) {
  if (e.behavior === 'splitter') {
    const mini = getEnemy(e.splitInto); if (!mini) return;
    for (let i=0;i<(e.splitCount||2);i++){ const a=rng.next()*Math.PI*2;
      world.spawnEnemy({ ...mini, x:e.x+Math.cos(a)*14, y:e.y+Math.sin(a)*14, maxHp:mini.hp }); }
  } else if (e.behavior === 'bomber') {
    // 사망 폭발: 빠르게 퍼지는 짧은 수명 탄막(폭발감) + 충격파 링
    for (let i=0;i<10;i++){ const a=i/10*Math.PI*2 + rng.next()*0.2; fireHazard(world, e.x, e.y, a, 5.2, e.damage, { life:80 }); }
    world.spawnParticle({ x:e.x, y:e.y, r:e.radius*0.6, rMax:e.radius*4.5, life:14, color:'#ff7a3d', shock:true });
  }
}
