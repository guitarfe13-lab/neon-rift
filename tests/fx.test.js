import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elementOf, elColor, stepParticle } from '../js/ui/fx.js';

test('elementOf는 skill.tags[0] 또는 physical', () => {
  assert.equal(elementOf({ tags:['fire'] }), 'fire');
  assert.equal(elementOf({}), 'physical');
  assert.equal(elementOf(null), 'physical');
});
test('elColor는 원소별 색, 미지정은 physical', () => {
  assert.equal(elColor('ice'), '#8bd8ff');
  assert.ok(elColor('nope'));
});
test('stepParticle: 스파크 이동·수명, 충격파 반경 확장', () => {
  const s = { spark:true, x:0, y:0, vx:2, vy:0, life:3 };
  assert.equal(stepParticle(s), true); assert.ok(s.x > 0);
  const sh = { shock:true, r:0, rMax:100, life:2 };
  const r0 = sh.r; stepParticle(sh); assert.ok(sh.r > r0);
  const dead = { spark:true, x:0, y:0, vx:0, vy:0, life:1 };
  assert.equal(stepParticle(dead), false);   // life 1 → 0
});
