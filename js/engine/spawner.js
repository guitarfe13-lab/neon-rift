// 디렉터: 내부 시계(t)로 바이옴별 스폰·엘리트·보스 등장·바이옴 순환을 관리.
import { getEnemy } from '../data/enemies.js';
import { getBoss } from '../data/bosses.js';

export function makeDirector(rng, biomes) {
  let t = 0, timer = 0, biomeIdx = 0, biomeStart = 0, bossRef = null, arena = null;
  let midbossFor = -1;   // 중간보스 등장 여부를 판정한 바이옴 인덱스(바이옴당 1회만 굴림)
  const biome = () => biomes[biomeIdx % biomes.length];

  // 경과 시간 + 플레이어 레벨에 따라 적 hp/피해 스케일(레벨↑ → 몹도 강해짐).
  function enemyStatsAt(id, atMs, level = 1) {
    const e = getEnemy(id); const min = atMs / 60000; const lv = Math.max(0, level - 1);
    return { ...e,
      hp: Math.round(e.hp * (1 + min * 0.6 + lv * 0.13)),
      speed: e.speed * (1.1 + min * 0.05 + lv * 0.05),   // 기본 +10%, 레벨↑마다 +5%(체감되게)
      damage: Math.round(e.damage * (1 + lv * 0.09)) };   // 레벨↑ → 몬스터 공격력 강화(밸런스)
  }
  function spawnOne(world, level) {
    const b = biome(); const id = rng.pick(b.enemySet); const st = enemyStatsAt(id, t, level);
    if (rng.next() < 0.06) { // 엘리트
      st.hp = Math.round(st.hp * 3.2); st.radius = Math.round(st.radius * 1.4);
      st.damage = Math.round(st.damage * 1.4); st.gold *= 4; st.xp *= 3; st.elite = true;
    }
    st.maxHp = st.hp;
    const ang = rng.next() * Math.PI * 2, R = 460;
    world.spawnEnemy({ ...st, x: world.player.x + Math.cos(ang)*R, y: world.player.y + Math.sin(ang)*R });
  }
  function spawnBoss(world, level) {
    const b = biome(); const boss = getBoss(b.boss); const lv = Math.max(0, level - 1);
    const cycle = Math.floor(biomeIdx / biomes.length);        // 0=최초, 1+=반복(전 보스 소멸 후 재등장)
    // 반복할수록 강해 보이는 수식어(마지막에서 고정). 1회차는 수식어 없음.
    const EPITHETS = ['', '강력한 ', '분노의 ', '암흑의 ', '절멸의 ', '혼돈의 ', '종말의 '];
    const prefix = EPITHETS[Math.min(cycle, EPITHETS.length - 1)];
    const scale = (1 + biomeIdx * 0.6 + lv * 0.06) * (1 + cycle * 0.15);   // 반복마다 조금씩 더 강하게
    const hp = Math.round(boss.hp * scale);
    // 플레이어 현재 위치를 중심으로 아레나 고정(무한 후퇴 방지). 보스는 화면 안에 등장.
    arena = { x: world.player.x, y: world.player.y, r: 360 };
    bossRef = world.spawnEnemy({ ...boss, hp, maxHp: hp, name: prefix + boss.name,
      damage: Math.round(boss.damage * (1 + lv * 0.07 + cycle * 0.12)),
      skillTier: Math.min(3, biomeIdx + cycle),   // 진행할수록 보스 스킬 광역·강력(0~3)
      x: arena.x, y: arena.y - 170 });
  }
  // 중간보스(악시온): 바이옴 중반에 50% 확률 등장(나올 때도, 안 나올 때도). 아레나·바이옴 진행과 무관.
  function spawnMidboss(world, level) {
    const mb = getBoss('axion'); const lv = Math.max(0, level - 1);
    const cycle = Math.floor(biomeIdx / biomes.length);
    const scale = (1 + biomeIdx * 0.5 + lv * 0.06) * (1 + cycle * 0.15);
    const hp = Math.round(mb.hp * scale);
    const ang = rng.next() * Math.PI * 2;
    world.spawnEnemy({ ...mb, hp, maxHp: hp,
      damage: Math.round(mb.damage * (1 + lv * 0.06 + cycle * 0.1)),
      skillTier: Math.min(2, biomeIdx + cycle),
      x: world.player.x + Math.cos(ang) * 420, y: world.player.y + Math.sin(ang) * 420 });
    world.spawnFloater({ x: world.player.x, y: world.player.y - 60,
      text: '⚠ 네온의 집행자 악시온 출현!', color: '#7dffce', life: 80, max: 80, vy: -0.25, crit: true });
  }
  function update(dt, world, level = 1) {
    t += dt;
    if (bossRef && !bossRef.alive) { bossRef = null; arena = null; biomeIdx++; biomeStart = t; } // 보스 처치 → 다음 바이옴
    const b = biome();
    if (midbossFor !== biomeIdx && !bossRef && t - biomeStart >= b.durationMs * 0.55) {
      midbossFor = biomeIdx;
      if (rng.next() < 0.5) spawnMidboss(world, level);
    }
    if (!bossRef && t - biomeStart >= b.durationMs) { spawnBoss(world, level); return; }
    const rate = bossRef ? 1500 : Math.max(220, 900 - (t - biomeStart) / 500);
    timer += dt;
    while (timer >= rate) { timer -= rate; spawnOne(world, level); }
  }
  return { update, enemyStatsAt, biome, getBossRef: () => bossRef, getArena: () => arena,
    biomeIndex: () => biomeIdx, clock: () => t };
}
