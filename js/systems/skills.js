// 스킬 런타임(데이터 주도 디스패치). 타입별 동작을 RUNTIME에 정의하고,
// updateSkills가 보유 스킬을 매 프레임 실행한다.
// - projectile/orbital/beam/summon: 투사체 풀에 스폰 → 충돌은 main.js 중앙 루프가 처리.
// - aura/chain: 즉시 피해 → onDamage(enemy, dmg, crit) 콜백으로 처치 보상 공유.
import { getSkill } from '../data/skills.js';
import { runtimeStats } from './skillScaling.js';
import * as FX from '../ui/fx.js';

export function nearestEnemy(world, x, y) {
  let best = null, bd = Infinity;
  for (const e of world.enemies) { if (!e.alive) continue;
    const d = (e.x-x)*(e.x-x)+(e.y-y)*(e.y-y); if (d < bd) { bd = d; best = e; } }
  return best;
}
function nearestEnemies(world, x, y, k, exclude) {
  const arr = world.enemies.filter(e => e.alive && !exclude?.has(e));
  arr.sort((a,b)=> ((a.x-x)**2+(a.y-y)**2) - ((b.x-x)**2+(b.y-y)**2));
  return arr.slice(0, k);
}
function cd(rt, stats) { return Math.max(4, rt.cooldown / (stats.atkSpeed || 1)); }
// 마법 스킬 MP 지불. 부족하면 발사 보류(짧게 재시도). rs.mp가 없으면(테스트) 무제한.
function payMp(rs, skill, st, retry = 4) {
  if (!skill.mpCost) return true;
  if ((rs.mp ?? Infinity) < skill.mpCost) { st.timer = retry; return false; }
  if (rs.mp != null) rs.mp -= skill.mpCost;
  return true;
}

const RUNTIME = {
  // 조준 투사체를 쿨다운마다 발사.
  projectile(world, rs, rt, skill, st, rng, onDamage, onFire) {
    if ((st.timer -= 1) > 0) return;
    if (!payMp(rs, skill, st)) return;
    st.timer = st.cdMax = cd(rt, rs.stats);
    const p = world.player; const t = nearestEnemy(world, p.x, p.y); if (!t) return;
    const base = Math.atan2(t.y-p.y, t.x-p.x);
    const count = (rt.count||1) * (rs.stats.projectiles||1);
    const el = skill.tags && skill.tags[0];
    for (let i=0;i<count;i++){ const a = base + (i-(count-1)/2)*0.18;
      world.spawnProjectile({ x:p.x, y:p.y, vx:Math.cos(a)*rt.speed, vy:Math.sin(a)*rt.speed,
        radius:5, dmg:rt.damage, pierce:rt.pierce||0, life:rt.life||120, crit:Math.random()<(rs.stats.crit||0),
        color: skill.color||'#ffe14d', element: el, pshape: skill.proj }); }   // proj:'lance' → 창촉 렌더
    FX.spawnMuzzle(world, p.x, p.y, skill.color, el);
    if (onFire) onFire();
  },
  // 관통 빔: 고속·다관통·짧은 수명(줄기 형태).
  beam(world, rs, rt, skill, st, rng, onDamage, onFire) {
    if ((st.timer -= 1) > 0) return;
    if (!payMp(rs, skill, st)) return;
    st.timer = st.cdMax = cd(rt, rs.stats);
    const p = world.player; const t = nearestEnemy(world, p.x, p.y); if (!t) return;
    const a = Math.atan2(t.y-p.y, t.x-p.x);
    world.spawnProjectile({ x:p.x, y:p.y, vx:Math.cos(a)*rt.speed, vy:Math.sin(a)*rt.speed,
      radius:6, dmg:rt.damage, pierce:rt.pierce??99, life:36, crit:Math.random()<(rs.stats.crit||0),
      color: skill.color||'#7cf9ff', beam:true, len: rt.speed*3.2, element: skill.tags && skill.tags[0] });
    FX.spawnMuzzle(world, p.x, p.y, skill.color, skill.tags && skill.tags[0]);
    if (onFire) onFire();
  },
  // 궤도 오브: rt.count개를 플레이어 주위로 회전. 적별 재타격 쿨다운(e._orbCd)로 제어.
  orbital(world, rs, rt, skill, st) {
    st.orbs = (st.orbs || []).filter(o => o.alive);
    const want = (rt.count||1) + Math.max(0,(rs.stats.projectiles||1)-1);
    const R = 60 * (rs.stats.area||1);
    for (let i=st.orbs.length;i<want;i++){
      const o = world.spawnProjectile({ x:0,y:0, radius:9, dmg:rt.damage, orbit:{ r:R, speed:0.06 },
        oa:(i/want)*Math.PI*2, color: skill.color||'#ff8be0', element: skill.tags && skill.tags[0] });
      st.orbs.push(o);
    }
    for (const o of st.orbs){ o.dmg = rt.damage; o.orbit.r = R; } // 레벨 반영
  },
  // 오라: 범위 내 적에게 tick마다 지속 피해.
  // 오라(광역): 쿨타임마다 한 번 '펼침' — 범위 내 전체 타격 + 확장 링 펄스. 재충전 동안 대기.
  aura(world, rs, rt, skill, st, rng, onDamage) {
    const el = skill.tags && skill.tags[0]; const R = (rt.radius||70) * (rs.stats.area||1);
    if (world.particles.length < 550 && Math.random() < 0.35) FX.spawnAuraField(world, world.player.x, world.player.y, el, R); // 유지 필드
    if ((st.timer -= 1) > 0) return;
    if (!payMp(rs, skill, st)) return;
    st.timer = st.cdMax = rt.cooldown; // aura의 cooldown = 재사용 대기
    const p = world.player;
    for (const e of world.enemies){ if(!e.alive) continue;
      if ((e.x-p.x)**2+(e.y-p.y)**2 <= R*R) onDamage(e, rt.damage, el); }
    world.spawnParticle({ x:p.x, y:p.y, r:R*0.35, rMax:R, life:18, color: skill.color||'#5cf', shock:true }); // 확장 펄스
  },
  // 연쇄: 쿨다운마다 가장 가까운 적에서 인접 적으로 rt.count회 도약하며 피해.
  chain(world, rs, rt, skill, st, rng, onDamage) {
    if ((st.timer -= 1) > 0) return;
    if (!payMp(rs, skill, st)) return;
    st.timer = st.cdMax = cd(rt, rs.stats);
    const el = skill.tags && skill.tags[0];
    const p = world.player; let node = nearestEnemy(world, p.x, p.y); if (!node) return;
    const hit = new Set(); let cx=p.x, cy=p.y;
    for (let i=0;i<(rt.count||3) && node;i++){
      onDamage(node, rt.damage, el); hit.add(node);
      FX.spawnChainArc(world, cx, cy, node.x, node.y, skill.color);
      cx=node.x; cy=node.y; node = nearestEnemies(world, cx, cy, 1, hit)[0];
    }
  },
  // 소환: 플레이어 주위를 도는 드론(피해 0의 궤도체)이 쿨다운마다 투사체 발사.
  summon(world, rs, rt, skill, st) {
    if (!st.drone || !st.drone.alive) {
      st.drone = world.spawnProjectile({ x:0,y:0, radius:8, dmg:0, orbit:{ r:44, speed:0.04 }, oa:0,
        color: skill.color||'#8effc7' });
      st.timer = 0;
    }
    if ((st.timer -= 1) > 0) return;
    if (!payMp(rs, skill, st)) return;
    st.timer = st.cdMax = cd(rt, rs.stats);
    const d = st.drone; const t = nearestEnemy(world, d.x, d.y); if (!t) return;
    const a = Math.atan2(t.y-d.y, t.x-d.x);
    world.spawnProjectile({ x:d.x, y:d.y, vx:Math.cos(a)*rt.speed, vy:Math.sin(a)*rt.speed,
      radius:4, dmg:rt.damage, pierce:rt.pierce||0, life:100, crit:false, color: skill.color||'#8effc7', element: skill.tags && skill.tags[0] });
    FX.spawnMuzzle(world, d.x, d.y, skill.color, skill.tags && skill.tags[0]);
  },
  // 패시브: 전투 동작 없음(스탯은 levelup에서 반영).
  passive() {},
};

export function updateSkills(world, rs, rng, sstate, onDamage, onFire) {
  for (const [id, level] of Object.entries(rs.ownedSkills)) {
    const skill = getSkill(id); if (!skill) continue;
    const rt = runtimeStats(skill, level);
    const st = sstate[id] || (sstate[id] = { timer: 0 });
    RUNTIME[skill.type]?.(world, rs, rt, skill, st, rng, onDamage, onFire);
  }
}

// 투사체 이동. orbit는 플레이어 주위 회전, 그 외 직선 이동 후 수명 소멸.
export function updateProjectiles(world) {
  const p0 = world.player;
  for (const p of world.projectiles) { if (!p.alive) continue;
    if (p.orbit) { p.oa += p.orbit.speed; p.x = p0.x + Math.cos(p.oa)*p.orbit.r; p.y = p0.y + Math.sin(p.oa)*p.orbit.r; }
    else { p.x += p.vx; p.y += p.vy; if (--p.life <= 0) p.alive = false; } }
}
