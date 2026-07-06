// 디렉터: 시간 기반 스폰율/난이도 스케일.
import { getEnemy } from '../data/enemies.js';
export function makeDirector(rng, biome) {
  let timer = 0;
  function enemyStatsAt(id, elapsedMs) {
    const e = getEnemy(id); const min = elapsedMs / 60000; // 경과 분
    return { ...e, hp: Math.round(e.hp * (1 + min * 0.6)), speed: e.speed * (1 + min * 0.05) };
  }
  function update(dt, elapsedMs, world, difficulty = 1) {
    const rate = Math.max(200, 900 - elapsedMs / 600); // ms당 스폰 간격 감소
    timer += dt;
    while (timer >= rate) {
      timer -= rate;
      const id = rng.pick(biome.enemySet);
      const st = enemyStatsAt(id, elapsedMs);
      const ang = rng.next() * Math.PI * 2, R = 420;
      world.spawnEnemy({ ...st, x: world.player.x + Math.cos(ang)*R, y: world.player.y + Math.sin(ang)*R, maxHp: st.hp });
    }
  }
  return { update, enemyStatsAt };
}
