import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeDirector } from '../js/engine/spawner.js';
import { makeRng } from '../js/core/rng.js';
import { createWorld } from '../js/engine/entities.js';

const BIOMES = [{ id:'t', enemySet:['grunt'], boss:'warden', durationMs:90000 }];

test('시간이 지나면 적 스폰', () => {
  const dir = makeDirector(makeRng('s'), BIOMES);
  const w = createWorld();
  for (let i=0;i<50;i++) dir.update(100, w);
  assert.ok(w.enemies.length > 0);
});
test('적 hp는 경과 시간에 따라 증가', () => {
  const dir = makeDirector(makeRng('s'), BIOMES);
  assert.ok(dir.enemyStatsAt('grunt',300000).hp > dir.enemyStatsAt('grunt',0).hp);
});
test('적 hp·피해는 플레이어 레벨에 따라 증가', () => {
  const dir = makeDirector(makeRng('s'), BIOMES);
  const lv1 = dir.enemyStatsAt('grunt', 0, 1);
  const lv15 = dir.enemyStatsAt('grunt', 0, 15);
  assert.ok(lv15.hp > lv1.hp);
  assert.ok(lv15.damage > lv1.damage);
});
test('적 xp·gold 보상도 시간·레벨에 따라 증가(후반 레벨업 정체 방지)', () => {
  const dir = makeDirector(makeRng('s'), BIOMES);
  const early = dir.enemyStatsAt('grunt', 0, 1);
  const late = dir.enemyStatsAt('grunt', 600000, 20);
  assert.ok(late.xp > early.xp);
  assert.ok(late.gold > early.gold);
});
test('적 이속 배율은 2배 상한(후반 무한 가속 방지)', () => {
  const dir = makeDirector(makeRng('s'), BIOMES);
  const base = dir.enemyStatsAt('grunt', 0, 1).speed / 1.1;   // 기본 배율 1.1 역산
  const late = dir.enemyStatsAt('grunt', 3600000, 99);        // 극후반
  assert.ok(late.speed <= base * 2.0 + 1e-9);
});
test('심연 변이: 35레벨+에서만 변이 몹 등장', () => {
  const hi = makeDirector(makeRng('mut'), BIOMES); const w = createWorld();
  for (let i=0;i<500;i++) hi.update(50, w, 45);   // 고레벨(티어2) 스폰 다수
  assert.ok(w.enemies.some(e => e.mutation), '고레벨에선 변이 몹이 나와야 함');
  const lo = makeDirector(makeRng('nomut'), BIOMES); const w2 = createWorld();
  for (let i=0;i<500;i++) lo.update(50, w2, 10);   // 저레벨
  assert.ok(!w2.enemies.some(e => e.mutation), '저레벨에선 변이 없음');
});
test('durationMs 경과 시 보스 스폰 + 아레나 설정', () => {
  const dir = makeDirector(makeRng('s'), BIOMES);
  const w = createWorld();
  assert.equal(dir.getArena(), null);
  for (let i=0;i<1000;i++) dir.update(100, w);
  assert.ok(w.enemies.some(e=>e.boss) && dir.getBossRef());
  assert.ok(dir.getArena() && dir.getArena().r > 0); // 보스전 아레나 활성
});
test('보스 반복 등장 시 수식어가 붙고 더 강해짐', () => {
  const one = [{ id:'a', enemySet:['grunt'], boss:'warden', durationMs:500 }];
  const dir = makeDirector(makeRng('s'), one);
  const w = createWorld();
  for (let i=0;i<10;i++) dir.update(100, w, 1);
  let boss = dir.getBossRef(); const firstHp = boss.maxHp, firstName = boss.name;
  boss.alive = false; dir.update(100, w, 1);          // 처치 → 다음 사이클
  for (let i=0;i<10;i++) dir.update(100, w, 1);
  boss = dir.getBossRef(); assert.ok(boss);
  assert.notEqual(boss.name, firstName);
  assert.ok(boss.name.startsWith('강력한'));
  assert.ok(boss.maxHp > firstHp);
});
test('보스 처치 시 다음 바이옴 진행 + 아레나 해제', () => {
  const two = [{ id:'a', enemySet:['grunt'], boss:'warden', durationMs:1000 },
               { id:'b', enemySet:['grunt'], boss:'hydra', durationMs:1000 }];
  const dir = makeDirector(makeRng('s'), two);
  const w = createWorld();
  for (let i=0;i<20;i++) dir.update(100, w);
  const boss = dir.getBossRef(); assert.ok(boss && dir.getArena());
  boss.alive = false; dir.update(100, w);
  assert.equal(dir.biomeIndex(), 1);
  assert.equal(dir.getArena(), null);
});
