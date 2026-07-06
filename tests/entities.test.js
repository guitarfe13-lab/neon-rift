import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../js/engine/entities.js';

test('적 스폰 후 목록에 존재', () => {
  const w = createWorld();
  w.spawnEnemy({ x:10, y:10, hp:5 });
  assert.equal(w.enemies.length, 1);
  assert.equal(w.enemies[0].alive, true);
});
test('죽은 엔티티는 despawnDead로 제거되고 슬롯 재사용', () => {
  const w = createWorld();
  const e = w.spawnEnemy({ x:0, y:0, hp:1 });
  e.alive = false; w.despawnDead();
  assert.equal(w.enemies.length, 0);
  w.spawnEnemy({ x:1, y:1, hp:1 });
  assert.equal(w.enemies.length, 1);
});
test('플레이어 기본 존재', () => {
  const w = createWorld();
  assert.ok(w.player && typeof w.player.x === 'number');
});
