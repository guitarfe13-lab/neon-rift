import { test } from 'node:test';
import assert from 'node:assert/strict';
import { xpForLevel, addXp, rollChoices } from '../js/systems/levelup.js';
import { makeRng } from '../js/core/rng.js';

function runState() {
  return { charId:'blade', level:1, xp:0, ownedSkills:{ blade_orbit:1 }, passives:{}, stats:{}, metaUpgrades:{} };
}
test('xpForLevel은 단조 증가', () => {
  assert.ok(xpForLevel(2) > xpForLevel(1));
});
test('임계치 넘으면 레벨업', () => {
  const rs = runState(); const r = addXp(rs, xpForLevel(1) + 1);
  assert.equal(r.leveled, true); assert.ok(rs.level >= 2);
});
test('rollChoices는 정확히 count개, 중복 없는 id', () => {
  const rs = runState(); const choices = rollChoices(rs, makeRng('c'), 3);
  assert.equal(choices.length, 3);
  const ids = choices.map(c=>c.id); assert.equal(new Set(ids).size, ids.length);
});
