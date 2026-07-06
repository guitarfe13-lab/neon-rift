// 스킬 런타임(v1: projectile). dt는 스텝(ms) 기준 프레임 단위로 취급.
export function nearestEnemy(world, x, y) {
  let best = null, bd = Infinity;
  for (const e of world.enemies) { if (!e.alive) continue;
    const d = (e.x-x)*(e.x-x)+(e.y-y)*(e.y-y); if (d < bd) { bd = d; best = e; } }
  return best;
}
export function fireProjectile(world, player, stats, rt, rng) {
  const target = nearestEnemy(world, player.x, player.y); if (!target) return;
  const base = Math.atan2(target.y - player.y, target.x - player.x);
  const count = rt.count * (stats.projectiles || 1);
  const spread = 0.18;
  for (let i = 0; i < count; i++) {
    const a = base + (i - (count - 1) / 2) * spread;
    world.spawnProjectile({ x: player.x, y: player.y, vx: Math.cos(a)*rt.speed, vy: Math.sin(a)*rt.speed,
      radius: 5, dmg: rt.damage * stats.damage / 12, pierce: rt.pierce, life: 120,
      crit: rng.next() < (stats.crit||0) });
  }
}
export function updateProjectiles(world) {
  for (const p of world.projectiles) { if (!p.alive) continue;
    p.x += p.vx; p.y += p.vy; if (--p.life <= 0) p.alive = false; }
}
