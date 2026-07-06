// 전투 판정(순수 함수 위주).
export function rollCrit(rng, crit) { return rng.next() < crit; }
export function damageOf(stats, skillDmg, isCrit) {
  const base = skillDmg; return isCrit ? base * (stats.critMult || 2) : base;
}
export function applyHit(target, dmg, _isCrit) {
  target.hp -= dmg;
  if (target.hp <= 0) { target.alive = false; return { killed: true }; }
  return { killed: false };
}
