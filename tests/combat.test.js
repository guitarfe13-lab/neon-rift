import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyHit, damageOf } from '../js/engine/combat.js';

test('데미지 적용 후 hp 감소, 0 이하면 사망', () => {
  const e = { hp: 5, alive: true };
  assert.equal(applyHit(e, 3, false).killed, false);
  assert.equal(e.hp, 2);
  const r = applyHit(e, 5, false);
  assert.equal(r.killed, true); assert.equal(e.alive, false);
});
test('크리티컬은 critMult 배수', () => {
  const stats = { damage: 10, critMult: 2 };
  assert.equal(damageOf(stats, 10, false), 10);
  assert.equal(damageOf(stats, 10, true), 20);
});
