// 디렉터: 내부 시계(t)로 바이옴별 스폰·엘리트·보스 등장·바이옴 순환을 관리.
import { getEnemy } from '../data/enemies.js';
import { getBoss } from '../data/bosses.js';

export function makeDirector(rng, biomes) {
  let t = 0, timer = 0, biomeIdx = 0, biomeStart = 0, bossRef = null;
  const biome = () => biomes[biomeIdx % biomes.length];

  // 경과 시간에 따라 적 hp/속도 스케일.
  function enemyStatsAt(id, atMs) {
    const e = getEnemy(id); const min = atMs / 60000;
    return { ...e, hp: Math.round(e.hp * (1 + min * 0.6)), speed: e.speed * (1 + min * 0.05) };
  }
  function spawnOne(world) {
    const b = biome(); const id = rng.pick(b.enemySet); const st = enemyStatsAt(id, t);
    if (rng.next() < 0.06) { // 엘리트
      st.hp = Math.round(st.hp * 3.2); st.radius = Math.round(st.radius * 1.4);
      st.damage = Math.round(st.damage * 1.4); st.gold *= 4; st.xp *= 3; st.elite = true;
    }
    st.maxHp = st.hp;
    const ang = rng.next() * Math.PI * 2, R = 460;
    world.spawnEnemy({ ...st, x: world.player.x + Math.cos(ang)*R, y: world.player.y + Math.sin(ang)*R });
  }
  function spawnBoss(world) {
    const b = biome(); const boss = getBoss(b.boss); const scale = 1 + biomeIdx * 0.6;
    const hp = Math.round(boss.hp * scale);
    bossRef = world.spawnEnemy({ ...boss, hp, maxHp: hp, x: world.player.x, y: world.player.y - 320 });
  }
  function update(dt, world) {
    t += dt;
    if (bossRef && !bossRef.alive) { bossRef = null; biomeIdx++; biomeStart = t; } // 보스 처치 → 다음 바이옴
    const b = biome();
    if (!bossRef && t - biomeStart >= b.durationMs) { spawnBoss(world); return; }
    const rate = bossRef ? 1500 : Math.max(220, 900 - (t - biomeStart) / 500);
    timer += dt;
    while (timer >= rate) { timer -= rate; spawnOne(world); }
  }
  return { update, enemyStatsAt, biome, getBossRef: () => bossRef, biomeIndex: () => biomeIdx, clock: () => t };
}
