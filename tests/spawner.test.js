import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeDirector } from '../js/engine/spawner.js';
import { makeRng } from '../js/core/rng.js';
import { createWorld } from '../js/engine/entities.js';

test('시간이 지나면 적 스폰', () => {
  const dir = makeDirector(makeRng('s'), { enemySet:['grunt'] });
  const w = createWorld();
  for (let t=0;t<5000;t+=100) dir.update(100, t, w, 1);
  assert.ok(w.enemies.length > 0);
});
test('적 hp는 경과 시간에 따라 증가', () => {
  const dir = makeDirector(makeRng('s'), { enemySet:['grunt'] });
  const early = dir.enemyStatsAt('grunt', 0).hp;
  const late = dir.enemyStatsAt('grunt', 300000).hp;
  assert.ok(late > early);
});
