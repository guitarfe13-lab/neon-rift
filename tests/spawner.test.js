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
test('durationMs 경과 시 보스 스폰', () => {
  const dir = makeDirector(makeRng('s'), BIOMES);
  const w = createWorld();
  for (let i=0;i<1000;i++) dir.update(100, w);
  assert.ok(w.enemies.some(e=>e.boss) && dir.getBossRef());
});
test('보스 처치 시 다음 바이옴으로 진행', () => {
  const two = [{ id:'a', enemySet:['grunt'], boss:'warden', durationMs:1000 },
               { id:'b', enemySet:['grunt'], boss:'hydra', durationMs:1000 }];
  const dir = makeDirector(makeRng('s'), two);
  const w = createWorld();
  for (let i=0;i<20;i++) dir.update(100, w);
  const boss = dir.getBossRef(); assert.ok(boss);
  boss.alive = false; dir.update(100, w);
  assert.equal(dir.biomeIndex(), 1);
});
