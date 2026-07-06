import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runtimeStats } from '../js/systems/skillScaling.js';
import { getSkill } from '../js/data/skills.js';

test('레벨업 시 damage 증가, cooldown 감소', () => {
  const s = getSkill('blade_orbit');
  const l1 = runtimeStats(s, 1); const l3 = runtimeStats(s, 3);
  assert.ok(l3.damage > l1.damage);
  assert.ok(l3.cooldown < l1.cooldown);
});
test('배열 스케일은 레벨 인덱스로 매핑되고 최대에서 클램프', () => {
  const s = getSkill('blade_orbit');
  assert.equal(runtimeStats(s, 1).count, 1);
  assert.equal(runtimeStats(s, 5).count, 3);
  assert.equal(runtimeStats(s, 99).count, 3);
});
